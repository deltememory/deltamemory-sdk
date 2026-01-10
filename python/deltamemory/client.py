"""
DeltaMemory Python Client
"""

from typing import Any, Optional
import httpx

from .types import (
    DeltaMemoryConfig,
    IngestOptions,
    IngestResponse,
    RecallOptions,
    RecallResponse,
    StoreOptions,
    StoreResponse,
    Memory,
    MemoryResult,
    DecayResponse,
    ConsolidateResponse,
    ReflectResponse,
    StatsResponse,
    PurgeResponse,
    GraphResponse,
    HealthResponse,
    ExtractedFact,
    ExtractedConcept,
    ConceptRelation,
    ConceptResult,
    GraphKnowledge,
    UserProfile,
    UserEvent,
    GraphNode,
    GraphEdge,
    MemoryType,
)
from .errors import DeltaMemoryError, ConnectionError, parse_error

DEFAULT_BASE_URL = "http://localhost:6969"
DEFAULT_TIMEOUT = 30.0


class DeltaMemory:
    """
    DeltaMemory client for interacting with the DeltaMemory server.

    Example:
        db = DeltaMemory(
            api_key='dm_your_api_key_here',
            default_collection='my-app'
        )

        # Ingest content with cognitive processing
        result = await db.ingest('User prefers dark mode')

        # Recall relevant memories with profiles and events
        memories = await db.recall('What are the user preferences?')
        print(memories.profiles)  # Structured user facts
        print(memories.events)    # Timeline events
        print(memories.context)   # Pre-formatted LLM context
    """

    def __init__(
        self,
        base_url: str = DEFAULT_BASE_URL,
        api_key: Optional[str] = None,
        default_collection: str = "default",
        timeout: float = DEFAULT_TIMEOUT,
        headers: Optional[dict[str, str]] = None,
    ):
        self._base_url = base_url.rstrip("/")
        self._default_collection = default_collection
        self._timeout = timeout
        self._headers = {"Content-Type": "application/json", **(headers or {})}
        
        # Add API key header if provided
        if api_key:
            self._headers["X-API-Key"] = api_key
            
        self._client: Optional[httpx.AsyncClient] = None

    @classmethod
    def from_config(cls, config: DeltaMemoryConfig) -> "DeltaMemory":
        """Create client from config object."""
        return cls(
            base_url=config.base_url,
            api_key=config.api_key,
            default_collection=config.default_collection,
            timeout=config.timeout,
            headers=config.headers,
        )

    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create the HTTP client."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                base_url=self._base_url,
                headers=self._headers,
                timeout=self._timeout,
            )
        return self._client

    async def close(self) -> None:
        """Close the HTTP client."""
        if self._client is not None and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def __aenter__(self) -> "DeltaMemory":
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.close()

    async def _request(
        self,
        method: str,
        path: str,
        body: Optional[dict] = None,
        query: Optional[dict[str, str]] = None,
    ) -> Any:
        """Make an HTTP request to the DeltaMemory server."""
        client = await self._get_client()

        try:
            response = await client.request(
                method=method,
                url=path,
                json=body,
                params=query,
            )

            if not response.is_success:
                try:
                    error_body = response.json()
                except Exception:
                    error_body = {}
                parse_error(response.status_code, error_body)

            return response.json()

        except httpx.TimeoutException:
            raise ConnectionError(f"Request timeout after {self._timeout}s")
        except httpx.ConnectError as e:
            raise ConnectionError(str(e))
        except DeltaMemoryError:
            raise
        except Exception as e:
            raise ConnectionError(f"Unknown error: {e}")

    def _get_collection(self, collection: Optional[str]) -> str:
        """Get the collection name, using default if not provided."""
        return collection or self._default_collection

    async def ingest(
        self,
        content: str,
        options: Optional[IngestOptions] = None,
    ) -> IngestResponse:
        """
        Ingest content with cognitive processing.

        This method:
        - Generates embeddings for the content
        - Extracts facts and concepts using LLM
        - Extracts user profiles and events (structured memory)
        - Stores the memory with full cognitive metadata

        Args:
            content: The content to ingest
            options: Optional settings (collection, metadata, datetime, speaker)

        Returns:
            Ingest result with memory IDs, extracted facts, and concepts

        Example:
            result = await db.ingest('I prefer TypeScript over JavaScript', IngestOptions(
                metadata={'source': 'chat'},
                datetime='2024-01-15T10:30:00Z',
                speaker='user'
            ))
            print(result.facts)  # Extracted facts
        """
        opts = options or IngestOptions()
        metadata: dict[str, str] = dict(opts.metadata or {})

        if opts.datetime:
            metadata["datetime"] = opts.datetime
        if opts.speaker:
            metadata["speaker"] = opts.speaker

        data = await self._request("POST", "/v1/ingest", {
            "collection": self._get_collection(opts.collection),
            "content": content,
            "metadata": metadata,
        })

        return IngestResponse(
            memory_ids=data.get("memory_ids", []),
            facts=[ExtractedFact(**f) for f in data.get("facts", [])],
            concepts=[ExtractedConcept(**c) for c in data.get("concepts", [])],
        )

    async def recall(
        self,
        query: str,
        options: Optional[RecallOptions] = None,
    ) -> RecallResponse:
        """
        Recall memories using hybrid cognitive search.

        Combines:
        - Semantic similarity (vector search)
        - Temporal recency
        - Salience scoring
        - User profiles (structured facts)
        - User events (timeline)
        - Graph knowledge (multi-hop reasoning)

        Args:
            query: The search query
            options: Optional settings (collection, limit, weights)

        Returns:
            Recall response with memories, profiles, events, and pre-formatted context

        Example:
            results = await db.recall('user preferences', RecallOptions(
                limit=5,
                weights=RecallWeights(similarity=0.6, recency=0.2, salience=0.2)
            ))
            print(results.profiles)
            print(results.events)
            print(results.context)
        """
        opts = options or RecallOptions()

        body: dict[str, Any] = {
            "collection": self._get_collection(opts.collection),
            "query": query,
            "limit": opts.limit or 10,
        }

        if opts.weights:
            body["weights"] = opts.weights.to_dict()
        if opts.memory_types:
            body["memory_types"] = [mt.value for mt in opts.memory_types]

        data = await self._request("POST", "/v1/recall", body)

        return self._parse_recall_response(data)

    def _parse_recall_response(self, data: dict) -> RecallResponse:
        """Parse recall response data into typed objects."""
        results = []
        for r in data.get("results", []):
            mem_data = r.get("memory", {})
            memory = Memory(
                id=mem_data.get("id", ""),
                collection=mem_data.get("collection", ""),
                content=mem_data.get("content", ""),
                memory_type=mem_data.get("memory_type", ""),
                salience=mem_data.get("salience", 0.0),
                timestamp=mem_data.get("timestamp", 0),
                metadata=mem_data.get("metadata"),
            )
            results.append(MemoryResult(
                memory=memory,
                similarity=r.get("similarity", 0.0),
                recency=r.get("recency", 0.0),
                salience=r.get("salience", 0.0),
                cognitive_score=r.get("cognitive_score", 0.0),
            ))

        concepts = []
        for c in data.get("concepts", []):
            relations = [ConceptRelation(**rel) for rel in c.get("relations", [])]
            concepts.append(ConceptResult(
                id=c.get("id", ""),
                name=c.get("name", ""),
                relevance=c.get("relevance", 0.0),
                relations=relations,
                concept_type=c.get("concept_type"),
            ))

        graph_knowledge = None
        if "graph_knowledge" in data and data["graph_knowledge"]:
            graph_knowledge = [GraphKnowledge(**gk) for gk in data["graph_knowledge"]]

        profiles = None
        if "profiles" in data and data["profiles"]:
            profiles = [UserProfile(**p) for p in data["profiles"]]

        events = None
        if "events" in data and data["events"]:
            events = [UserEvent(**e) for e in data["events"]]

        return RecallResponse(
            results=results,
            concepts=concepts,
            graph_knowledge=graph_knowledge,
            profiles=profiles,
            events=events,
            context=data.get("context"),
        )

    async def store(
        self,
        content: str,
        options: Optional[StoreOptions] = None,
    ) -> StoreResponse:
        """
        Store a memory without cognitive processing (raw mode).

        Args:
            content: The content to store
            options: Optional settings (collection, memory_type, metadata)

        Returns:
            The ID of the stored memory
        """
        opts = options or StoreOptions()

        data = await self._request("POST", "/v1/store", {
            "collection": self._get_collection(opts.collection),
            "content": content,
            "memory_type": (opts.memory_type or MemoryType.CONVERSATION).value,
            "metadata": opts.metadata or {},
        })

        return StoreResponse(id=data.get("id", ""))

    async def get(self, id: str, collection: Optional[str] = None) -> Memory:
        """
        Get a specific memory by ID.

        Args:
            id: The memory ID
            collection: Optional collection name

        Returns:
            The memory object
        """
        data = await self._request(
            "GET",
            f"/v1/memory/{self._get_collection(collection)}/{id}"
        )

        return Memory(
            id=data.get("id", ""),
            collection=data.get("collection", ""),
            content=data.get("content", ""),
            memory_type=data.get("memory_type", ""),
            salience=data.get("salience", 0.0),
            timestamp=data.get("timestamp", 0),
            metadata=data.get("metadata"),
        )

    async def delete(self, id: str, collection: Optional[str] = None) -> None:
        """
        Delete a memory by ID.

        Args:
            id: The memory ID
            collection: Optional collection name
        """
        await self._request(
            "DELETE",
            f"/v1/memory/{self._get_collection(collection)}/{id}"
        )

    async def decay(
        self,
        rate: float = 0.1,
        collection: Optional[str] = None,
    ) -> DecayResponse:
        """
        Apply salience decay to memories in a collection.

        Args:
            rate: Decay rate (0.0 to 1.0, default: 0.1)
            collection: Optional collection name

        Returns:
            Number of affected memories
        """
        data = await self._request("POST", "/v1/decay", {
            "collection": self._get_collection(collection),
            "rate": rate,
        })

        return DecayResponse(affected_count=data.get("affected_count", 0))

    async def consolidate(
        self,
        threshold: float = 0.8,
        collection: Optional[str] = None,
    ) -> ConsolidateResponse:
        """
        Consolidate similar memories in a collection.

        Args:
            threshold: Similarity threshold (0.0 to 1.0, default: 0.8)
            collection: Optional collection name

        Returns:
            Number of consolidated memory groups
        """
        data = await self._request("POST", "/v1/consolidate", {
            "collection": self._get_collection(collection),
            "threshold": threshold,
        })

        return ConsolidateResponse(consolidated_count=data.get("consolidated_count", 0))

    async def reflect(
        self,
        window_size: int = 10,
        collection: Optional[str] = None,
    ) -> ReflectResponse:
        """
        Generate insights from recent memories.

        Args:
            window_size: Number of recent memories to analyze (default: 10)
            collection: Optional collection name

        Returns:
            Generated reflection/insights
        """
        data = await self._request("POST", "/v1/reflect", {
            "collection": self._get_collection(collection),
            "window_size": window_size,
        })

        return ReflectResponse(reflection=data.get("reflection", ""))

    async def stats(self, collection: Optional[str] = None) -> StatsResponse:
        """
        Get statistics for a collection.

        Args:
            collection: Optional collection name

        Returns:
            Collection statistics including profile and event counts
        """
        data = await self._request(
            "GET",
            "/v1/stats",
            query={"collection": self._get_collection(collection)},
        )

        return StatsResponse(
            memory_count=data.get("memory_count", 0),
            fact_count=data.get("fact_count", 0),
            concept_count=data.get("concept_count", 0),
            relation_count=data.get("relation_count", 0),
            vector_count=data.get("vector_count", 0),
            profile_count=data.get("profile_count", 0),
            event_count=data.get("event_count", 0),
        )

    async def graph(self, collection: Optional[str] = None) -> GraphResponse:
        """
        Get knowledge graph for a collection.

        Args:
            collection: Optional collection name

        Returns:
            Graph with nodes and edges
        """
        data = await self._request(
            "GET",
            "/v1/graph",
            query={"collection": self._get_collection(collection)},
        )

        nodes = []
        for n in data.get("nodes", []):
            nodes.append(GraphNode(
                id=n.get("id", ""),
                name=n.get("name", ""),
                node_type=n.get("node_type", ""),
                concept_type=n.get("concept_type"),
                salience=n.get("salience"),
            ))

        edges = []
        for e in data.get("edges", []):
            edges.append(GraphEdge(
                from_node=e.get("from", ""),
                to_node=e.get("to", ""),
                relation_type=e.get("relation_type", ""),
                weight=e.get("weight", 0.0),
            ))

        return GraphResponse(nodes=nodes, edges=edges)

    async def purge(self, collection: Optional[str] = None) -> PurgeResponse:
        """
        Purge all memories in a collection.

        Args:
            collection: Optional collection name

        Returns:
            Number of deleted memories
        """
        data = await self._request(
            "DELETE",
            "/v1/purge",
            query={"collection": self._get_collection(collection)},
        )

        return PurgeResponse(deleted_count=data.get("deleted_count", 0))

    async def health(self) -> HealthResponse:
        """
        Check server health.

        Returns:
            Health status and version
        """
        data = await self._request("GET", "/v1/health")

        return HealthResponse(
            healthy=data.get("healthy", False),
            version=data.get("version", ""),
        )


# Legacy alias for backward compatibility
CognitiveDB = DeltaMemory
