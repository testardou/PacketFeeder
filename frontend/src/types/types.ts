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
};

export type RunStatusType = {
  sid: string;
  running: boolean;
};

export type NewValuesPcapType = { old: string; new: string };

export type ReplayModeType = "realTime" | "fast" | "fastest" | "step";

export type RewriteValues = {
  rewriteIps: NewValuesPcapType[];
  setRewriteIps: (values: NewValuesPcapType[]) => void;
  rewriteMacs: NewValuesPcapType[];
  setRewriteMacs: (values: NewValuesPcapType[]) => void;
  rewriteIpv6s: NewValuesPcapType[];
  setRewriteIpv6s: (values: NewValuesPcapType[]) => void;
  rewriteArpIps: NewValuesPcapType[];
  setRewriteArpIps: (values: NewValuesPcapType[]) => void;
  rewriteDnsDomains: NewValuesPcapType[];
  setRewriteDnsDomains: (values: NewValuesPcapType[]) => void;
  rewriteTcpPorts: NewValuesPcapType[];
  setRewriteTcpPorts: (values: NewValuesPcapType[]) => void;
  rewriteUdpPorts: NewValuesPcapType[];
  setRewriteUdpPorts: (values: NewValuesPcapType[]) => void;
};
