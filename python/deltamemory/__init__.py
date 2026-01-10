"""
DeltaMemory Python SDK

A Python client for DeltaMemory - Smart memory database for AI agents.

Example:
    from deltamemory import DeltaMemory

    db = DeltaMemory(
        base_url='http://localhost:6969',
        default_collection='my-app'
    )

    # Ingest content with cognitive processing
    await db.ingest('User prefers dark mode')

    # Recall relevant memories with profiles and events
    results = await db.recall('What are the user preferences?')
    print(results.profiles)  # Structured user facts
    print(results.events)    # Timeline events
    print(results.context)   # Pre-formatted LLM context
"""

from .client import DeltaMemory, CognitiveDB
from .types import (
    MemoryType,
    RecallWeights,
    Memory,
    MemoryResult,
    ExtractedFact,
    ExtractedConcept,
    IngestResponse,
    ConceptRelation,
    ConceptResult,
    GraphKnowledge,
    UserProfile,
    UserEvent,
    RecallResponse,
    StoreResponse,
    DecayResponse,
    ConsolidateResponse,
    ReflectResponse,
    StatsResponse,
    PurgeResponse,
    GraphNode,
    GraphEdge,
    GraphResponse,
    HealthResponse,
    DeltaMemoryConfig,
    IngestOptions,
    RecallOptions,
    StoreOptions,
)
from .errors import (
    DeltaMemoryError,
    MemoryNotFoundError,
    CollectionNotFoundError,
    InvalidRequestError,
    ServerUnavailableError,
    ConnectionError,
    CognitiveDBError,
)

__version__ = "0.1.0"
__all__ = [
    # Client
    "DeltaMemory",
    "CognitiveDB",
    # Types
    "MemoryType",
    "RecallWeights",
    "Memory",
    "MemoryResult",
    "ExtractedFact",
    "ExtractedConcept",
    "IngestResponse",
    "ConceptRelation",
    "ConceptResult",
    "GraphKnowledge",
    "UserProfile",
    "UserEvent",
    "RecallResponse",
    "StoreResponse",
    "DecayResponse",
    "ConsolidateResponse",
    "ReflectResponse",
    "StatsResponse",
    "PurgeResponse",
    "GraphNode",
    "GraphEdge",
    "GraphResponse",
    "HealthResponse",
    "DeltaMemoryConfig",
    "IngestOptions",
    "RecallOptions",
    "StoreOptions",
    # Errors
    "DeltaMemoryError",
    "MemoryNotFoundError",
    "CollectionNotFoundError",
    "InvalidRequestError",
    "ServerUnavailableError",
    "ConnectionError",
    "CognitiveDBError",
]
