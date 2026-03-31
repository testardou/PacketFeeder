export interface Tactic {
  mitre: {
    tactic_id: string;
    tactic_name: string;
    url: string;
  };
  description: string;
  techniques: string[];
  metadata: {
    domain: string;
    source: string;
    version: string;
  };
}

export interface PcapDataset {
  id: string;
  file: string;
  name: string;
  description: string;
  criticality: "low" | "medium" | "high";
  scope: {
    protocol: string;
    ports?: number[];
  };
  filter?: string[];
  command?: string;
}

export interface PcapDataResponse {
  datasets?: PcapDataset[];
  files?: string[];
  path?: string;
}

export interface Technique {
  mitre: {
    technique_id: string;
    technique_name: string;
    url: string;
    tactics: string[];
  };
  description: string;
  artifacts: string[];
  datasets?: {
    pcaps: PcapDataset[];
  };
  pcaps_path?: string; // Legacy format
  variants?: string[]; // Legacy format
  metadata: {
    domain: string;
    confidence: string;
    schema_version?: string;
  };
}
