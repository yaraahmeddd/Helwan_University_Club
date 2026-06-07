/**
 * Connect to database with automatic retry logic
 * Attempts to connect up to MAX_RETRIES times with exponential backoff
 */
declare function connectWithRetry(attempt?: number): Promise<void>;
export default connectWithRetry;
//# sourceMappingURL=connect.d.ts.map