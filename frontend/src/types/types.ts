import type { components } from "../api-types";

export type PcapInfoType = components["schemas"]["PcapInfo"];

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
