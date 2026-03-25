import type { NewValuesPcapType } from "@/types/types";

export type RewriteState = {
  rewriteIps: NewValuesPcapType[];
  rewriteMacs: NewValuesPcapType[];
  rewriteIpv6s: NewValuesPcapType[];
  rewriteArpIps: NewValuesPcapType[];
  rewriteDnsDomains: NewValuesPcapType[];
  rewriteTcpPorts: NewValuesPcapType[];
  rewriteUdpPorts: NewValuesPcapType[];
};

export const initialRewriteState: RewriteState = {
  rewriteIps: [],
  rewriteMacs: [],
  rewriteIpv6s: [],
  rewriteArpIps: [],
  rewriteDnsDomains: [],
  rewriteTcpPorts: [],
  rewriteUdpPorts: [],
};

type RewriteAction =
  | { type: "SET_REWRITE_IPS"; payload: NewValuesPcapType[] }
  | { type: "SET_REWRITE_MACS"; payload: NewValuesPcapType[] }
  | { type: "SET_REWRITE_IPV6S"; payload: NewValuesPcapType[] }
  | { type: "SET_REWRITE_ARP_IPS"; payload: NewValuesPcapType[] }
  | { type: "SET_REWRITE_DNS_DOMAINS"; payload: NewValuesPcapType[] }
  | { type: "SET_REWRITE_TCP_PORTS"; payload: NewValuesPcapType[] }
  | { type: "SET_REWRITE_UDP_PORTS"; payload: NewValuesPcapType[] }
  | { type: "RESET" };

export const rewriteReducer = (
  state: RewriteState,
  action: RewriteAction,
): RewriteState => {
  switch (action.type) {
    case "SET_REWRITE_IPS":
      return { ...state, rewriteIps: action.payload };
    case "SET_REWRITE_MACS":
      return { ...state, rewriteMacs: action.payload };
    case "SET_REWRITE_IPV6S":
      return { ...state, rewriteIpv6s: action.payload };
    case "SET_REWRITE_ARP_IPS":
      return { ...state, rewriteArpIps: action.payload };
    case "SET_REWRITE_DNS_DOMAINS":
      return { ...state, rewriteDnsDomains: action.payload };
    case "SET_REWRITE_TCP_PORTS":
      return { ...state, rewriteTcpPorts: action.payload };
    case "SET_REWRITE_UDP_PORTS":
      return { ...state, rewriteUdpPorts: action.payload };
    case "RESET":
      return initialRewriteState;
    default:
      return state;
  }
};
