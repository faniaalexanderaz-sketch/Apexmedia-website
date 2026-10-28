"use client";

import { useEffect, useState } from "react";

/** true/false dopo l’idratazione; null durante il rendering sul server. */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(query);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- il media query esiste solo nel browser
    setMatches(mq.matches);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}
