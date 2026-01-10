/**
 * DeltaMemory Error Classes
 */

/** Base error class for DeltaMemory errors */
export class DeltaMemoryError extends Error {
  /** Error code from the API */
  public readonly code: string;
  /** HTTP status code */
  public readonly status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = 'DeltaMemoryError';
    this.code = code;
    this.status = status;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DeltaMemoryError);
    }
  }
}

/** Error thrown when a memory is not found */
export class MemoryNotFoundError extends DeltaMemoryError {
  constructor(id: string) {
    super(`Memory not found: ${id}`, 'MEMORY_NOT_FOUND', 404);
    this.name = 'MemoryNotFoundError';
  }
}

/** Error thrown when a collection is not found */
export class CollectionNotFoundError extends DeltaMemoryError {
  constructor(name: string) {
    super(`Collection not found: ${name}`, 'COLLECTION_NOT_FOUND', 404);
    this.name = 'CollectionNotFoundError';
  }
}

/** Error thrown for invalid requests */
export class InvalidRequestError extends DeltaMemoryError {
  constructor(message: string) {
    super(message, 'INVALID_REQUEST', 400);
    this.name = 'InvalidRequestError';
  }
}

/** Error thrown when the server is unavailable */
export class ServerUnavailableError extends DeltaMemoryError {
  constructor(message: string) {
    super(message, 'SERVER_UNAVAILABLE', 503);
    this.name = 'ServerUnavailableError';
  }
}

/** Error thrown for network/connection issues */
export class ConnectionError extends DeltaMemoryError {
  constructor(message: string) {
    super(message, 'CONNECTION_ERROR');
    this.name = 'ConnectionError';
  }
}

/** Error thrown when authentication fails */
export class UnauthorizedError extends DeltaMemoryError {
  constructor(message: string = 'Invalid or missing API key') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

/** Parse error response and throw appropriate error */
export function parseError(status: number, body: { error?: string; code?: string }): never {
  const message = body.error || 'Unknown error';
  const code = body.code || 'UNKNOWN_ERROR';

  switch (code) {
    case 'MEMORY_NOT_FOUND':
      throw new MemoryNotFoundError(message.replace('Memory not found: ', ''));
    case 'COLLECTION_NOT_FOUND':
      throw new CollectionNotFoundError(message.replace('Collection not found: ', ''));
    case 'INVALID_REQUEST':
      throw new InvalidRequestError(message);
    case 'INVALID_API_KEY':
    case 'MISSING_API_KEY':
      throw new UnauthorizedError(message);
    case 'PROVIDER_ERROR':
    case 'EMBEDDING_ERROR':
      throw new ServerUnavailableError(message);
    default:
      if (status === 401) {
        throw new UnauthorizedError(message);
      }
      throw new DeltaMemoryError(message, code, status);
  }
}

// Legacy alias for backward compatibility
export const CognitiveDBError = DeltaMemoryError;
