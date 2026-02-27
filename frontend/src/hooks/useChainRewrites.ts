import { useState, useCallback } from "react";
import type { NewValuesPcapType, RewriteValues } from "@/types/types";
import type { RewriteMapsCollection, PerPcapRewrites } from "@/components/chainbuilder/types";

const emptyCollection = (): RewriteMapsCollection => ({
  rewriteIps: [],
  rewriteMacs: [],
  rewriteIpv6s: [],
  rewriteArpIps: [],
  rewriteDnsDomains: [],
  rewriteTcpPorts: [],
  rewriteUdpPorts: [],
});

export function useChainRewrites() {
  const [globalRewrites, setGlobalRewrites] = useState<RewriteMapsCollection>(emptyCollection);
  const [perPcapRewrites, setPerPcapRewrites] = useState<PerPcapRewrites>({});

  // --- Global rewrite setters (compatible with RewriteValues) ---
  const setGlobalField = useCallback(
    (field: keyof RewriteMapsCollection) => (values: NewValuesPcapType[]) => {
      setGlobalRewrites((prev) => ({ ...prev, [field]: values }));
    },
    []
  );

  const globalRewriteValues: RewriteValues = {
    rewriteIps: globalRewrites.rewriteIps,
    setRewriteIps: setGlobalField("rewriteIps"),
    rewriteMacs: globalRewrites.rewriteMacs,
    setRewriteMacs: setGlobalField("rewriteMacs"),
    rewriteIpv6s: globalRewrites.rewriteIpv6s,
    setRewriteIpv6s: setGlobalField("rewriteIpv6s"),
    rewriteArpIps: globalRewrites.rewriteArpIps,
    setRewriteArpIps: setGlobalField("rewriteArpIps"),
    rewriteDnsDomains: globalRewrites.rewriteDnsDomains,
    setRewriteDnsDomains: setGlobalField("rewriteDnsDomains"),
    rewriteTcpPorts: globalRewrites.rewriteTcpPorts,
    setRewriteTcpPorts: setGlobalField("rewriteTcpPorts"),
    rewriteUdpPorts: globalRewrites.rewriteUdpPorts,
    setRewriteUdpPorts: setGlobalField("rewriteUdpPorts"),
  };

  // --- Per-pcap rewrite helpers ---
  const getPerPcapRewriteValues = useCallback(
    (index: number): RewriteValues => {
      const key = String(index);
      const current = perPcapRewrites[key] || emptyCollection();

      const setField =
        (field: keyof RewriteMapsCollection) => (values: NewValuesPcapType[]) => {
          setPerPcapRewrites((prev) => ({
            ...prev,
            [key]: { ...(prev[key] || emptyCollection()), [field]: values },
          }));
        };

      return {
        rewriteIps: current.rewriteIps,
        setRewriteIps: setField("rewriteIps"),
        rewriteMacs: current.rewriteMacs,
        setRewriteMacs: setField("rewriteMacs"),
        rewriteIpv6s: current.rewriteIpv6s,
        setRewriteIpv6s: setField("rewriteIpv6s"),
        rewriteArpIps: current.rewriteArpIps,
        setRewriteArpIps: setField("rewriteArpIps"),
        rewriteDnsDomains: current.rewriteDnsDomains,
        setRewriteDnsDomains: setField("rewriteDnsDomains"),
        rewriteTcpPorts: current.rewriteTcpPorts,
        setRewriteTcpPorts: setField("rewriteTcpPorts"),
        rewriteUdpPorts: current.rewriteUdpPorts,
        setRewriteUdpPorts: setField("rewriteUdpPorts"),
      };
    },
    [perPcapRewrites]
  );

  const resetAll = useCallback(() => {
    setGlobalRewrites(emptyCollection());
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
