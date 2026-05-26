import type { PcapDataset, Technique } from "@/types/mitre";
import type {
  NewValuesPcapType,
  PcapInfoType,
  RewriteState,
} from "@/types/types";

export interface ScenarioPcapItem {
  type: "pcap";
  id: string;
  techniqueId: string;
  technique: Technique;
  tacticId?: string;
  pcapFile: string;
  dataset?: PcapDataset;
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
  file_path: string;
  infos: PcapInfoType;
}

export interface ScenarioInfosResponse {
  per_pcap: PerPcapInfoEntry[];
  all: PcapInfoType;
}
export type PerPcapRewrites = Record<string, RewriteState>;

export type ImportScenarioResponseItem =
  | Omit<ScenarioPcapItem, "id">
  | Omit<ScenarioSleepItem, "id">;

export interface ImportScenarioResponse {
  items: ImportScenarioResponseItem[];
  missing: string[];
}
