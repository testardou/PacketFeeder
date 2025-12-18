import type { components } from "./api-types";

export type PcapInfoType = components["schemas"]["PcapInfo"];
export type PacketDetailsType = components["schemas"]["PacketDetails"];
export type PcapFilesType = components["schemas"]["PcapFiles"];
export type InterfacesType = components["schemas"]["GetInterfaces"];
export type PacketPayloadType = components["schemas"]["PacketPayload"];

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
