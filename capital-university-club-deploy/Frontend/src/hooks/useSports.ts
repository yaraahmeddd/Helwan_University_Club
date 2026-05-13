import { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:3000';

export interface Sport {
  id: number;
  name_ar: string;
  name_en: string;
}

interface UseSportsReturn {
  sports: Sport[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch all sports from the API
 */
export function useSports(): UseSportsReturn {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BACKEND_URL}/api/sports/public`);

        if (!response.ok) {
          throw new Error(`Failed to fetch sports: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setSports(result.data);
        } else {
          throw new Error(result.error || 'Invalid response format');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('[useSports] Error fetching sports:', {
          error: errorMessage,
          url: `${BACKEND_URL}/api/sports/public`,
          timestamp: new Date().toISOString()
        });
        setError(errorMessage);
        setSports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  return {
    sports,
    loading,
    error,
  };
}
