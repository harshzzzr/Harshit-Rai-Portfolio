import { useState, useEffect } from 'react';

/**
 * Custom hook to execute an asynchronous service call with standard loading, error, and empty states
 * @param {Function} asyncFn - Async service function to execute
 * @param {Array} dependencies - Hook dependency array
 */
export function useAsyncData(asyncFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    asyncFn()
      .then((res) => {
        if (!isMounted) return;
        setData(res.data);
        setError(res.error || null);
        setIsLive(Boolean(res.isLive));
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load data');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const isEmpty = !loading && (!data || (Array.isArray(data) && data.length === 0));

  return { data, loading, error, isEmpty, isLive };
}
