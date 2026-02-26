import type { Technique } from "@/types/scenarios";

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

