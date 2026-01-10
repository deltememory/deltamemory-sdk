"""
DeltaMemory Python SDK Types
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class MemoryType(str, Enum):
    """Memory type enum"""
    CONVERSATION = "Conversation"
    FACT = "Fact"
    INSIGHT = "Insight"
    SUMMARY = "Summary"


@dataclass
class RecallWeights:
    """Weights for recall scoring"""
    similarity: Optional[float] = None
    recency: Optional[float] = None
    salience: Optional[float] = None

    def to_dict(self) -> dict:
        return {k: v for k, v in {
            "similarity": self.similarity,
            "recency": self.recency,
            "salience": self.salience,
        }.items() if v is not None}


@dataclass
class Memory:
    """Memory object returned from API"""
    id: str
    collection: str
    content: str
    memory_type: str
    salience: float
    timestamp: int
    metadata: Optional[dict[str, str]] = None


@dataclass
class MemoryResult:
    """Memory result with cognitive scores"""
    memory: Memory
    similarity: float
    recency: float
    salience: float
    cognitive_score: float


@dataclass
class ExtractedFact:
    """Extracted fact from content"""
    fact: str
    confidence: float


@dataclass
class ExtractedConcept:
    """Extracted concept from content"""
    name: str
    type: str
    importance: float


@dataclass
class IngestResponse:
    """Ingest response"""
    memory_ids: list[str]
    facts: list[ExtractedFact]
    concepts: list[ExtractedConcept]


@dataclass
class ConceptRelation:
    """Concept relation in recall response"""
    target_name: str
    relation_type: str
    weight: float


@dataclass
class ConceptResult:
    """Concept result in recall response"""
    id: str
    name: str
    relevance: float
    relations: list[ConceptRelation]
    concept_type: Optional[str] = None


@dataclass
class GraphKnowledge:
    """Knowledge derived from graph traversal (multi-hop)"""
    path: str
    statement: str
    confidence: float
    hops: int
    source_concept: str


@dataclass
class UserProfile:
    """User profile (structured fact about the user)"""
    id: str
    topic: str
    sub_topic: str
    content: str
    confidence: float
    updated_at: int


@dataclass
class UserEvent:
    """User event (timeline entry)"""
    id: str
    gist: str
    event_type: str
    mentioned_at: int
    tags: list[str]
    event_at: Optional[int] = None


@dataclass
class RecallResponse:
    """Recall response"""
    results: list[MemoryResult]
    concepts: list[ConceptResult]
    graph_knowledge: Optional[list[GraphKnowledge]] = None
    profiles: Optional[list[UserProfile]] = None
    events: Optional[list[UserEvent]] = None
    context: Optional[str] = None


@dataclass
class StoreResponse:
    """Store response"""
    id: str


@dataclass
class DecayResponse:
    """Decay response"""
    affected_count: int


@dataclass
class ConsolidateResponse:
    """Consolidate response"""
    consolidated_count: int


@dataclass
class ReflectResponse:
    """Reflect response"""
    reflection: str


@dataclass
class StatsResponse:
    """Collection statistics"""
    memory_count: int
    fact_count: int
    concept_count: int
    relation_count: int
    vector_count: int
    profile_count: int
    event_count: int


@dataclass
class PurgeResponse:
    """Purge response"""
    deleted_count: int


@dataclass
class GraphNode:
    """Graph node (concept or fact)"""
    id: str
    name: str
    node_type: str  # 'concept' or 'fact'
    concept_type: Optional[str] = None
    salience: Optional[float] = None


@dataclass
class GraphEdge:
    """Graph edge (relationship)"""
    from_node: str  # 'from' is reserved in Python
    to_node: str    # 'to' for consistency
    relation_type: str
    weight: float


@dataclass
class GraphResponse:
    """Knowledge graph response"""
    nodes: list[GraphNode]
    edges: list[GraphEdge]


@dataclass
class HealthResponse:
    """Health check response"""
    healthy: bool
    version: str


@dataclass
class DeltaMemoryConfig:
    """Client configuration options"""
    base_url: str = "http://localhost:6969"
    api_key: Optional[str] = None
    default_collection: str = "default"
    timeout: float = 30.0
    headers: Optional[dict[str, str]] = None


@dataclass
class IngestOptions:
    """Ingest options"""
    collection: Optional[str] = None
    metadata: Optional[dict[str, str]] = None
    datetime: Optional[str] = None
    speaker: Optional[str] = None


@dataclass
class RecallOptions:
    """Recall options"""
    collection: Optional[str] = None
    limit: Optional[int] = None
    weights: Optional[RecallWeights] = None
    memory_types: Optional[list[MemoryType]] = None


@dataclass
class StoreOptions:
    """Store options"""
    collection: Optional[str] = None
    memory_type: Optional[MemoryType] = None
    metadata: Optional[dict[str, str]] = None


# Legacy alias for backward compatibility
CognitiveDBConfig = DeltaMemoryConfig
