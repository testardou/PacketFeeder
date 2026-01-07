import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  InterfacesType,
  NewValuesPcapType,
  PacketDetailsType,
  PcapInfoType,
  ReplayModeType,
  RewriteValues,
} from "@/types/types";
import { ReplayModes } from "@/components/replayModes/ReplayModes";
import { SelectInterface } from "@/components/selectInterface/SelectInterface";
import { PacketDetails } from "@/components/packetDetails/PacketDetails";
import { RunReplay } from "@/components/runReplay/RunReplay";
import { ReplayFilter } from "@/components/replayFilter/ReplayFilter";
import { PcapInfos } from "@/components/pcapInfos/PcapInfos";
import { API_CONFIG } from "@/config/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface Tactic {
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

interface PcapDataset {
  id: string;
  file: string;
  name: string;
  description: string;
  criticality: "low" | "medium" | "high";
  scope: {
    protocol: string;
    ports?: number[];
  };
}

interface PcapDataResponse {
  datasets?: PcapDataset[];
  files?: string[];
  path?: string;
}

interface Technique {
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

export default function Scenarios() {
  const [selectedTactic, setSelectedTactic] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(
    null
  );
  const [selectFile, setSelectFile] = useState<string | null>(null);
  const [tacticData, setTacticData] = useState<Tactic | null>(null);
  const [techniqueData, setTechniqueData] = useState<Technique | null>(null);

  const [selectedMode, setSelectedMode] = useState<ReplayModeType>("realTime");
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    null
  );
  const [rewriteIps, setRewriteIps] = useState<NewValuesPcapType[]>([]);
  const [rewriteMacs, setRewriteMacs] = useState<NewValuesPcapType[]>([]);
  const [rewriteIpv6s, setRewriteIpv6s] = useState<NewValuesPcapType[]>([]);
  const [rewriteArpIps, setRewriteArpIps] = useState<NewValuesPcapType[]>([]);
  const [rewriteDnsDomains, setRewriteDnsDomains] = useState<
    NewValuesPcapType[]
  >([]);
  const [rewriteTcpPorts, setRewriteTcpPorts] = useState<NewValuesPcapType[]>(
    []
  );
  const [rewriteUdpPorts, setRewriteUdpPorts] = useState<NewValuesPcapType[]>(
    []
  );
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [filterIndex, setFilterIndex] = useState<number | null>(null);
  const [filterRange, setFilterRange] = useState<string>("");

  const rewriteValues: RewriteValues = {
    rewriteIps,
    setRewriteIps,
    rewriteMacs,
    setRewriteMacs,
    rewriteIpv6s,
    setRewriteIpv6s,
    rewriteArpIps,
    setRewriteArpIps,
    rewriteDnsDomains,
    setRewriteDnsDomains,
    rewriteTcpPorts,
    setRewriteTcpPorts,
    rewriteUdpPorts,
    setRewriteUdpPorts,
  };

  const resetStates = () => {
    setRewriteIps([]);
    setRewriteMacs([]);
    setRewriteIpv6s([]);
    setRewriteArpIps([]);
    setRewriteDnsDomains([]);
    setRewriteTcpPorts([]);
    setRewriteUdpPorts([]);
    setStepIndex(0);
    setFilterIndex(null);
    setFilterRange("");
  };

  // Load available tactics
  const { data: tacticsList, isLoading: tacticsLoading } = useQuery<{
    files: string[];
  }>({
    queryKey: ["tactics"],
    queryFn: async () => {
      const res = await fetch(`${API_CONFIG.API_BASE}/get-tactics/`);
      if (!res.ok) throw new Error("Failed to load tactics");
      return res.json();
    },
  });

  // Load tactic data when selected
  const { data: loadedTactic } = useQuery<Tactic>({
    queryKey: ["tactic", selectedTactic],
    queryFn: async () => {
      if (!selectedTactic) throw new Error("No tactic selected");
      const res = await fetch(
        `${API_CONFIG.API_BASE}/get-tactic/${selectedTactic}`
      );
      if (!res.ok) throw new Error("Failed to load tactic");
      return res.json();
    },
    enabled: !!selectedTactic,
  });

  // Load all techniques for the selected tactic to get their names
  const { data: techniquesData } = useQuery<Record<string, Technique>>({
    queryKey: ["tactic_techniques", tacticData?.techniques],
    queryFn: async () => {
      if (!tacticData?.techniques) throw new Error("No techniques available");
      const techniques: Record<string, Technique> = {};

      // Load all techniques in parallel
      await Promise.all(
        tacticData.techniques.map(async (techId) => {
          try {
            const res = await fetch(
              `${API_CONFIG.API_BASE}/get-technique/${techId}`
            );
            if (res.ok) {
              const data = await res.json();
              techniques[techId] = data;
            }
          } catch (error) {
            console.error(`Failed to load technique ${techId}:`, error);
          }
        })
      );

      return techniques;
    },
    enabled: !!tacticData?.techniques && tacticData.techniques.length > 0,
  });

  // Load technique data when selected
  const { data: loadedTechnique } = useQuery<Technique>({
    queryKey: ["technique", selectedTechnique],
    queryFn: async () => {
      if (!selectedTechnique) throw new Error("No technique selected");
      const res = await fetch(
        `${API_CONFIG.API_BASE}/get-technique/${selectedTechnique}`
      );
      if (!res.ok) throw new Error("Failed to load technique");
      return res.json();
    },
    enabled: !!selectedTechnique,
  });

  // Load PCAP datasets for selected technique
  const { data: pcapData, isLoading: pcapFilesLoading } =
    useQuery<PcapDataResponse>({
      queryKey: ["technique_pcaps", selectedTechnique],
      queryFn: async () => {
        if (!selectedTechnique) throw new Error("No technique selected");
        const res = await fetch(
          `${API_CONFIG.API_BASE}/get-technique-pcaps/${selectedTechnique}`
        );
        if (!res.ok) throw new Error("Failed to load PCAP datasets");
        return res.json();
      },
      enabled: !!selectedTechnique,
    });

  // Update state when tactic data loads
  if (loadedTactic && loadedTactic !== tacticData) {
    setTacticData(loadedTactic);
    setSelectedTechnique(null);
    setTechniqueData(null);
    setSelectFile(null);
  }

  // Update state when technique data loads
  if (loadedTechnique && loadedTechnique !== techniqueData) {
    setTechniqueData(loadedTechnique);
    setSelectFile(null);
  }

  const { data: ifaces_list, isLoading: interfacesLoading } =
    useQuery<InterfacesType>({
      queryKey: ["interfaces"],
      queryFn: async () => {
        const res = await fetch(`${API_CONFIG.API_BASE}/get_interfaces/`);
        if (!res.ok) {
          throw new Error("Erreur API");
        }
        return res.json();
      },
    });

  const detailsMutation = useMutation<PacketDetailsType[], Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(
        `${API_CONFIG.API_BASE}/detail-packets-pcap?file=${file}`
      );
      if (!res.ok) throw new Error("Erreur API");
      return res.json();
    },
    onSuccess: () => {
      resetStates();
    },
  });

  const infosMutation = useMutation<PcapInfoType, Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(`${API_CONFIG.API_BASE}/infos-pcap?file=${file}`);
      if (!res.ok) throw new Error("API Error");
      return res.json();
    },
    onSuccess: () => {
      resetStates();
    },
  });

  const handleTacticChange = (tacticFile: string) => {
    setSelectedTactic(tacticFile);
    setSelectedTechnique(null);
    setSelectFile(null);
    resetStates();
  };

  const handleTechniqueChange = (techniqueId: string) => {
    setSelectedTechnique(techniqueId);
    setSelectFile(null);
    resetStates();
  };

  const handleFileChange = (fileName: string | null) => {
    if (fileName !== selectFile) {
      resetStates();
      detailsMutation.reset();
      infosMutation.reset();
    }
    setSelectFile(fileName);
    if (fileName) {
      detailsMutation.mutate(fileName);
      infosMutation.mutate(fileName);
    }
  };

  if (interfacesLoading || tacticsLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-4xl mx-auto w-fit font-bold">Scenarios</h1>

      {/* Tactic and Technique Selection */}
      <Card>
        <CardHeader>
          <CardTitle>MITRE ATT&CK Scenario Selection</CardTitle>
          <CardDescription>
            Select a tactic and technique to replay attack scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tactic</label>
            <Select
              value={selectedTactic || ""}
              onValueChange={handleTacticChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a tactic" />
              </SelectTrigger>
              <SelectContent>
                {tacticsList?.files.map((file) => {
                  const tacticId = file.replace("_", " ").replace(".json", "");
                  return (
                    <SelectItem key={file} value={file}>
                      {tacticId}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {tacticData && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">
                        {tacticData.mitre.tactic_id}
                      </span>
                      <span className="text-muted-foreground">-</span>
                      <span className="font-medium">
                        {tacticData.mitre.tactic_name}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tacticData.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                        {tacticData.metadata.domain}
                      </span>
                      <span className="text-muted-foreground">
                        {tacticData.techniques.length} technique
                        {tacticData.techniques.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <a
                    href={tacticData.mitre.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="View on MITRE ATT&CK"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {tacticData && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Technique</label>
              <Select
                value={selectedTechnique || ""}
                onValueChange={handleTechniqueChange}
                disabled={!tacticData}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a technique" />
                </SelectTrigger>
                <SelectContent>
                  {tacticData.techniques.map((techId) => {
                    const technique = techniquesData?.[techId];
                    const techniqueName =
                      technique?.mitre?.technique_name || techId;
                    return (
                      <SelectItem key={techId} value={techId}>
                        {techId} - {techniqueName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {techniqueData && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">
                          {techniqueData.mitre.technique_id}
                        </span>
                        <span className="text-muted-foreground">-</span>
                        <span className="font-medium">
                          {techniqueData.mitre.technique_name}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {techniqueData.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
                          {techniqueData.metadata.domain}
                        </span>
                        <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md">
                          Confidence: {techniqueData.metadata.confidence}
                        </span>
                        {techniqueData.variants && (
                          <span className="text-muted-foreground">
                            {techniqueData.variants.length} variant
                            {techniqueData.variants.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <a
                      href={techniqueData.mitre.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                      title="View on MITRE ATT&CK"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  {techniqueData.artifacts &&
                    techniqueData.artifacts.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <p className="text-sm font-medium">
                          Network Artifacts:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {techniqueData.artifacts.map((artifact, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-primary mt-1.5">•</span>
                              <span>{artifact}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {techniqueData.datasets?.pcaps &&
                    techniqueData.datasets.pcaps.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <p className="text-sm font-medium">
                          Available Datasets:
                        </p>
                        <div className="space-y-2">
                          {techniqueData.datasets.pcaps.map((dataset) => (
                            <div
                              key={dataset.id}
                              className="p-3 bg-background border rounded-md hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                      {dataset.name}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-xs ${
                                        dataset.criticality === "high"
                                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                          : dataset.criticality === "medium"
                                          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                      }`}
                                    >
                                      {dataset.criticality}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {dataset.description}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="px-2 py-0.5 bg-secondary rounded-md">
                                      {dataset.scope.protocol.toUpperCase()}
                                    </span>
                                    {dataset.scope.ports && (
                                      <span className="text-muted-foreground">
                                        Ports: {dataset.scope.ports.join(", ")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {techniqueData.variants &&
                    techniqueData.variants.length > 0 &&
                    !techniqueData.datasets && (
                      <div className="space-y-2 pt-2 border-t">
                        <p className="text-sm font-medium">
                          Available Variants:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {techniqueData.variants.map((variant, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                            >
                              {variant}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {techniqueData.pcaps_path && !techniqueData.datasets && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">PCAP Path:</span>{" "}
                        {techniqueData.pcaps_path}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {techniqueData && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">PCAP Dataset</label>
              {pcapFilesLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading PCAP datasets...
                </p>
              ) : pcapData?.datasets && pcapData.datasets.length > 0 ? (
                <div className="space-y-3">
                  <Select
                    value={selectFile || ""}
                    onValueChange={handleFileChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a PCAP dataset" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      {pcapData.datasets.map((dataset) => {
                        const fileName =
                          dataset.file.split("/").pop() || dataset.file;
                        return (
                          <SelectItem key={dataset.id} value={dataset.file}>
                            <div className="flex flex-col gap-1 py-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {dataset.name}
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                    dataset.criticality === "high"
                                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                      : dataset.criticality === "medium"
                                      ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  }`}
                                >
                                  {dataset.criticality}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {dataset.description}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                  {dataset.scope.protocol.toUpperCase()}
                                </span>
                                {dataset.scope.ports && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      Ports: {dataset.scope.ports.join(", ")}
                                    </span>
                                  </>
                                )}
                                <span>•</span>
                                <span className="font-mono">{fileName}</span>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectFile &&
                    (() => {
                      const selectedDataset = pcapData.datasets.find(
                        (d) => d.file === selectFile
                      );
                      if (!selectedDataset) return null;
                      return (
                        <div className="p-4 bg-muted/30 rounded-lg border space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">
                              {selectedDataset.name}
                            </p>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                selectedDataset.criticality === "high"
                                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                                  : selectedDataset.criticality === "medium"
                                  ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              }`}
                            >
                              {selectedDataset.criticality}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {selectedDataset.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="px-2 py-1 bg-secondary rounded-md">
                              {selectedDataset.scope.protocol.toUpperCase()}
                            </span>
                            {selectedDataset.scope.ports && (
                              <span className="text-muted-foreground">
                                Ports: {selectedDataset.scope.ports.join(", ")}
                              </span>
                            )}
                            <span className="text-muted-foreground font-mono">
                              {selectedDataset.file.split("/").pop()}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              ) : pcapData?.files && pcapData.files.length > 0 ? (
                <Select
                  value={selectFile || ""}
                  onValueChange={handleFileChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a PCAP file" />
                  </SelectTrigger>
                  <SelectContent>
                    {pcapData.files
                      .filter(
                        (file: string) =>
                          file.endsWith(".pcap") || file.endsWith(".pcapng")
                      )
                      .map((file: string) => (
                        <SelectItem key={file} value={file}>
                          {file}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No PCAP datasets found for this technique.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Replay Configuration */}
      {selectFile && (
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl">Configuration</h2>

          <PcapInfos pcapInfos={infosMutation} rewriteValues={rewriteValues} />

          <PacketDetails
            selectedFile={selectFile}
            data={detailsMutation?.data}
            isPending={detailsMutation.isPending}
          />
          <div className="flex flex-row gap-20">
            <SelectInterface
              selectedInterface={selectedInterface}
              setSelectedInterface={setSelectedInterface}
              ifaces={ifaces_list?.interfaces}
            />
            <ReplayModes
              selected={selectedMode}
              setSelected={setSelectedMode}
            />
          </div>
          <ReplayFilter
            filterIndex={filterIndex}
            setFilterIndex={setFilterIndex}
            filterRange={filterRange}
            setFilterRange={setFilterRange}
          />
          <RunReplay
            selectedInterface={selectedInterface}
            rewriteIps={rewriteIps}
            rewriteMacs={rewriteMacs}
            rewriteIpv6s={rewriteIpv6s}
            rewriteArpIps={rewriteArpIps}
            rewriteDnsDomains={rewriteDnsDomains}
            rewriteTcpPorts={rewriteTcpPorts}
            rewriteUdpPorts={rewriteUdpPorts}
            stepIndex={stepIndex}
            setStepIndex={setStepIndex}
            selectedMode={selectedMode}
            selectFile={selectFile}
            filterIndex={filterIndex}
            filterRange={filterRange}
          />
        </div>
      )}
    </div>
  );
}
