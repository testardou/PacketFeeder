import type { Technique } from "@/types/mitre";
import type { NewValuesPcapType, PcapInfoType } from "@/types/types";

export interface ScenarioPcapItem {
  type: "pcap";
  id: string;
  techniqueId: string;
  technique: Technique;
  tacticId?: string;
  pcapFile: string;
}

export interface ScenarioSleepItem {
  type: "sleep";
  id: string;
  duration: number;
}

export type ScenarioItem = ScenarioPcapItem | ScenarioSleepItem;

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

export interface ScenarioInfosResponse {
  per_pcap: PerPcapInfoEntry[];
  all: PcapInfoType;
}

export type PerPcapRewrites = Record<string, RewriteMapsCollection>;
