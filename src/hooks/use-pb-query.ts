import { useState, useEffect, useCallback, useRef } from 'react';
import { ClientResponseError } from 'pocketbase';

/**
 * Checks if an error is a PocketBase cancellation error.
 */
export function isAbortError(error: any): boolean {
  return error instanceof ClientResponseError && error.isAbort;
}

interface UsePBQueryOptions {
  /**
   * Custom request key. If undefined, a unique key per hook instance is used.
   * Set to null to disable PocketBase auto-cancellation.
   */
  requestKey?: string | null;
  /**
   * If false, the query will not run automatically.
   */
  enabled?: boolean;
  /**
   * Callback on error (ignores abort errors).
   */
  onError?: (error: Error) => void;
}

/**
 * A simple hook to manage PocketBase data fetching with auto-cancellation handling.
 */
export function usePBQuery<T>(
  queryFn: (options: { requestKey: string | null }) => Promise<T>,
  deps: any[] = [],
  options: UsePBQueryOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(options.enabled !== false);
  const [error, setError] = useState<Error | null>(null);
  
  // Unique key for this component instance to prevent cross-component cancellation
  // but allow within-component cancellation of stale requests.
  const instanceId = useRef(`req_${Math.random().toString(36).substring(2, 9)}`);
  const requestKey = options.requestKey !== undefined ? options.requestKey : instanceId.current;

  const fetchData = useCallback(async () => {
    if (options.enabled === false) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await queryFn({ requestKey });
      setData(result);
      return result;
    } catch (err: any) {
      if (isAbortError(err)) {
        return;
      }
      setError(err);
      options.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey, options.enabled, ...deps]);

  useEffect(() => {
    fetchData().catch(() => {
      // Errors are handled in the try/catch and stored in state
    });
  }, [fetchData]);

  return { 
    data, 
    isLoading, 
    error, 
    refetch: fetchData,
    setData // Useful for optimistic updates
  };
}
