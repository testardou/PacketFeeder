import { useState, useCallback } from "react";
import type { RewriteState, RewriteValues } from "@/types/types";

import { initialRewriteState } from "@/constants/rewriteKeys";

export function useScenarioRewrites() {
  const [globalRewrites, setGlobalRewrites] =
    useState<RewriteState>(initialRewriteState);
  const [perPcapRewrites, setPerPcapRewrites] = useState<
    Record<string, RewriteState>
  >({});

  const globalRewriteValues: RewriteValues = {
    rewrites: globalRewrites,
    setRewrite: (key, values) =>
      setGlobalRewrites((prev) => ({ ...prev, [key]: values })),
  };

  // --- Per-pcap rewrite helpers ---
  const getPerPcapRewriteValues = useCallback(
    (index: number): RewriteValues => {
      const key = String(index);
      const current = perPcapRewrites[key] || initialRewriteState;

      return {
        rewrites: current,
        setRewrite: (key, values) =>
          setPerPcapRewrites((prev) => ({
            ...prev,
            [String(index)]: {
              ...(prev[String(index)] || initialRewriteState),
              [key]: values,
            },
          })),
      };
    },
    [perPcapRewrites],
  );

  const resetAll = useCallback(() => {
    setGlobalRewrites(initialRewriteState);
    setPerPcapRewrites({});
  }, []);

  return {
    globalRewrites,
    perPcapRewrites,
    globalRewriteValues,
    getPerPcapRewriteValues,
    resetAll,
  };
}
