import type { REWRITE_KEYS } from "@/constants/rewriteKeys";
import type { components } from "./api-types";

export type PcapInfoType = components["schemas"]["PcapInfo"];
export type PacketDetailsType = components["schemas"]["PacketDetails"];
export type PcapFilesType = components["schemas"]["PcapFiles"];
export type InterfacesType = components["schemas"]["GetInterfaces"];
export type PacketPayloadType = components["schemas"]["PacketPayload"];
export type ReplayStepType = components["schemas"]["ReplayStep"];

export type ReplayProgressType = {
  progress: number;
  index: number;
  timestamp: number;
  size: number;
  remaining_time: number;
  next_packet: number;
  packet_count: number;
};

export type RunStatusType = {
  sid: string;
  running: boolean;
};

export type NewValuesPcapType = { old: string; new: string };

export type ReplayModeType = "realTime" | "fast" | "fastest" | "step";

export type ProtocolType =
  | "ip"
  | "ipv6"
  | "mac"
  | "tcp"
  | "udp"
  | "icmp"
  | "arp"
  | "dns"
  | null;

export type ProtocolDataType = {
  key: ProtocolType;
  label: string;
  count: number;
  data: (string | number)[];
  isPort?: boolean;
};

export type RewriteKey = (typeof REWRITE_KEYS)[number];

export type RewriteState = Record<RewriteKey, NewValuesPcapType[]>;

export type RewriteValues = {
  rewrites: RewriteState;
  setRewrite: (key: RewriteKey, values: NewValuesPcapType[]) => void;
};
