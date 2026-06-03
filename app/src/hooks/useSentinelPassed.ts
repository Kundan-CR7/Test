import { useEffect, useRef, useState } from 'react';

export function useSentinelPassed<T extends HTMLElement>() {
  const sentinelRef = useRef<T>(null);
  const [hasPassed, setHasPassed] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      setHasPassed(!entry.isIntersecting);
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  return [sentinelRef, hasPassed] as const;
}
