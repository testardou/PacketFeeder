import type { Technique } from "@/types/mitre";
import type { NewValuesPcapType, PcapInfoType } from "@/types/types";

export interface ChainPcapItem {
  type: "pcap";
  id: string;
  techniqueId: string;
  technique: Technique;
  tacticId?: string;
  pcapFile: string;
}

export interface ChainSleepItem {
  type: "sleep";
  id: string;
  duration: number;
}

export type ChainItem = ChainPcapItem | ChainSleepItem;

export interface RewriteMapsCollection {
  rewriteIps: NewValuesPcapType[];
  rewriteMacs: NewValuesPcapType[];
  rewriteIpv6s: NewValuesPcapType[];
  rewriteArpIps: NewValuesPcapType[];
  rewriteDnsDomains: NewValuesPcapType[];
  rewriteTcpPorts: NewValuesPcapType[];
  rewriteUdpPorts: NewValuesPcapType[];
}

export interface PerPcapInfoEntry {
  index: number;
  pcap_file: string;
  infos: PcapInfoType;
}

export interface ChainInfosResponse {
  per_pcap: PerPcapInfoEntry[];
  all: PcapInfoType;
}

export type PerPcapRewrites = Record<string, RewriteMapsCollection>;
