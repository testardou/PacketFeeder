import { createContext, useContext, useReducer } from "react";
import { rewriteReducer, initialRewriteState } from "@/hooks/useRewriteReducer";
import type { RewriteState } from "@/hooks/useRewriteReducer";
import type { RewriteValues } from "@/types/types";

type RewriteContextType = {
  rewriteState: RewriteState;
  rewriteValues: RewriteValues;
  resetRewrites: () => void;
};

const RewriteContext = createContext<RewriteContextType | null>(null);

export function RewriteProvider({ children }: { children: React.ReactNode }) {
  const [rewriteState, dispatch] = useReducer(
    rewriteReducer,
    initialRewriteState,
  );

  const rewriteValues: RewriteValues = {
    rewriteIps: rewriteState.rewriteIps,
    setRewriteIps: (ips) => dispatch({ type: "SET_REWRITE_IPS", payload: ips }),
    rewriteMacs: rewriteState.rewriteMacs,
    setRewriteMacs: (macs) =>
      dispatch({ type: "SET_REWRITE_MACS", payload: macs }),
    rewriteIpv6s: rewriteState.rewriteIpv6s,
    setRewriteIpv6s: (ipv6s) =>
      dispatch({ type: "SET_REWRITE_IPV6S", payload: ipv6s }),
    rewriteArpIps: rewriteState.rewriteArpIps,
    setRewriteArpIps: (arpIps) =>
      dispatch({ type: "SET_REWRITE_ARP_IPS", payload: arpIps }),
    rewriteDnsDomains: rewriteState.rewriteDnsDomains,
    setRewriteDnsDomains: (dnsDomains) =>
      dispatch({ type: "SET_REWRITE_DNS_DOMAINS", payload: dnsDomains }),
    rewriteTcpPorts: rewriteState.rewriteTcpPorts,
    setRewriteTcpPorts: (tcpPorts) =>
      dispatch({ type: "SET_REWRITE_TCP_PORTS", payload: tcpPorts }),
    rewriteUdpPorts: rewriteState.rewriteUdpPorts,
    setRewriteUdpPorts: (udpPorts) =>
      dispatch({ type: "SET_REWRITE_UDP_PORTS", payload: udpPorts }),
  };

  const resetRewrites = () => dispatch({ type: "RESET" });

  return (
    <RewriteContext.Provider
      value={{ rewriteState, rewriteValues, resetRewrites }}
    >
      {children}
    </RewriteContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRewriteContext() {
  const ctx = useContext(RewriteContext);
  if (!ctx) throw new Error("useRewriteContext must be inside RewriteProvider");
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOptionalRewriteContext() {
  return useContext(RewriteContext);
}
