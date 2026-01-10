"""
DeltaMemory Error Classes
"""


class DeltaMemoryError(Exception):
    """Base error class for DeltaMemory errors"""

    def __init__(self, message: str, code: str, status: int | None = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status = status

    def __str__(self) -> str:
        return f"{self.message} (code: {self.code})"


class MemoryNotFoundError(DeltaMemoryError):
    """Error thrown when a memory is not found"""

    def __init__(self, id: str):
        super().__init__(f"Memory not found: {id}", "MEMORY_NOT_FOUND", 404)


class CollectionNotFoundError(DeltaMemoryError):
    """Error thrown when a collection is not found"""

    def __init__(self, name: str):
        super().__init__(f"Collection not found: {name}", "COLLECTION_NOT_FOUND", 404)


class InvalidRequestError(DeltaMemoryError):
    """Error thrown for invalid requests"""

    def __init__(self, message: str):
        super().__init__(message, "INVALID_REQUEST", 400)


class ServerUnavailableError(DeltaMemoryError):
    """Error thrown when the server is unavailable"""

    def __init__(self, message: str):
        super().__init__(message, "SERVER_UNAVAILABLE", 503)


class ConnectionError(DeltaMemoryError):
    """Error thrown for network/connection issues"""

    def __init__(self, message: str):
        super().__init__(message, "CONNECTION_ERROR")


class UnauthorizedError(DeltaMemoryError):
    """Error thrown when authentication fails"""

    def __init__(self, message: str = "Invalid or missing API key"):
        super().__init__(message, "UNAUTHORIZED", 401)


def parse_error(status: int, body: dict) -> None:
    """Parse error response and raise appropriate error"""
    message = body.get("error", "Unknown error")
    code = body.get("code", "UNKNOWN_ERROR")

    if code == "MEMORY_NOT_FOUND":
        raise MemoryNotFoundError(message.replace("Memory not found: ", ""))
    elif code == "COLLECTION_NOT_FOUND":
        raise CollectionNotFoundError(message.replace("Collection not found: ", ""))
    elif code == "INVALID_REQUEST":
        raise InvalidRequestError(message)
    elif code in ("INVALID_API_KEY", "MISSING_API_KEY"):
        raise UnauthorizedError(message)
    elif code in ("PROVIDER_ERROR", "EMBEDDING_ERROR"):
        raise ServerUnavailableError(message)
    elif status == 401:
        raise UnauthorizedError(message)
    else:
        raise DeltaMemoryError(message, code, status)


# Legacy alias for backward compatibility
CognitiveDBError = DeltaMemoryError
