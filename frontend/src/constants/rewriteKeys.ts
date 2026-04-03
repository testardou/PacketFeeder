import type { RewriteState } from "@/types/types";

export const REWRITE_KEYS = [
  "ip",
  "mac",
  "ipv6",
  "arp-ip",
  "dns",
  "tcp",
  "udp",
] as const;

export const initialRewriteState = Object.fromEntries(
  REWRITE_KEYS.map((k) => [k, []]),
) as unknown as RewriteState;
