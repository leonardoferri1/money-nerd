export interface MongoError extends Error {
  code?: number;
  keyPattern?: Record<string, unknown>;
}
