import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TacticSelector } from "@/components/scenarios/TacticSelector";
import { TechniqueSelector } from "@/components/scenarios/TechniqueSelector";
import { TechniqueChainList } from "@/components/chainbuilder/TechniqueChainList";
import { Button } from "@/components/ui/button";
import { Plus, Play, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useChainBuilderQueries } from "@/hooks/useChainBuilderQueries";
import { useChainItems } from "@/hooks/useChainItems";
import { useBuildChain } from "@/hooks/useBuildChain";
import { PacketDetails } from "@/components/packetDetails/PacketDetails";
import { SelectInterface } from "@/components/selectInterface/SelectInterface";
import { ReplayModes } from "@/components/replayModes/ReplayModes";
import { ReplayFilter } from "@/components/replayFilter/ReplayFilter";
import { RunReplay } from "@/components/runReplay/RunReplay";
import { PcapInfos } from "@/components/pcapInfos/PcapInfos";
import { API_CONFIG } from "@/config/api";
import type {
  InterfacesType,
  NewValuesPcapType,
  PacketDetailsType,
  PcapInfoType,
  ReplayModeType,
  RewriteValues,
} from "@/types/types";

export default function ChainBuilder() {
  const {
    selectedTactic,
    selectedTechnique,
    tacticData,
    techniqueData,
    selectFile,
    tacticsList,
    tacticsLoading,
    techniquesData,
    pcapData,
    pcapFilesLoading,
    handleTacticChange,
    handleTechniqueChange,
    handleFileChange,
  } = useChainBuilderQueries();

  const {
    chainItems,
    addPcap,
    addPcapFromDrop,
    addSleep,
    updateSleepDuration,
    removeItem,
    reorderItems,
  } = useChainItems();

  // --- Build chain ---
  const {
    mutate: buildChain,
    isPending: isBuildPending,
    isSuccess: isBuildSuccess,
    isError: isBuildError,
    error: buildError,
    data: buildData,
  } = useBuildChain();

  // --- Replay state ---
  const [selectedMode, setSelectedMode] = useState<ReplayModeType>("realTime");
  const [selectedInterface, setSelectedInterface] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [filterIndex, setFilterIndex] = useState<number | null>(null);
  const [filterRange, setFilterRange] = useState("");

  // --- Rewrite state ---
  const [rewriteIps, setRewriteIps] = useState<NewValuesPcapType[]>([]);
  const [rewriteMacs, setRewriteMacs] = useState<NewValuesPcapType[]>([]);
  const [rewriteIpv6s, setRewriteIpv6s] = useState<NewValuesPcapType[]>([]);
  const [rewriteArpIps, setRewriteArpIps] = useState<NewValuesPcapType[]>([]);
  const [rewriteDnsDomains, setRewriteDnsDomains] = useState<NewValuesPcapType[]>([]);
  const [rewriteTcpPorts, setRewriteTcpPorts] = useState<NewValuesPcapType[]>([]);
  const [rewriteUdpPorts, setRewriteUdpPorts] = useState<NewValuesPcapType[]>([]);

  const rewriteValues: RewriteValues = {
    rewriteIps, setRewriteIps,
    rewriteMacs, setRewriteMacs,
    rewriteIpv6s, setRewriteIpv6s,
    rewriteArpIps, setRewriteArpIps,
    rewriteDnsDomains, setRewriteDnsDomains,
    rewriteTcpPorts, setRewriteTcpPorts,
    rewriteUdpPorts, setRewriteUdpPorts,
  };

  const { data: ifacesList } = useQuery<InterfacesType>({
    queryKey: ["interfaces"],
    queryFn: async () => {
      const res = await fetch(`${API_CONFIG.API_BASE}/get_interfaces/`);
      if (!res.ok) throw new Error("Failed to load interfaces");
      return res.json();
    },
  });

  const detailsMutation = useMutation<PacketDetailsType[], Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(
        `${API_CONFIG.API_BASE}/detail-packets-pcap?file=${file}`
      );
      if (!res.ok) throw new Error("Failed to load packet details");
      return res.json();
    },
  });

  const infosMutation = useMutation<PcapInfoType, Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(
        `${API_CONFIG.API_BASE}/infos-pcap/?file=${file}`
      );
      if (!res.ok) throw new Error("Failed to load PCAP infos");
      return res.json();
    },
  });

  const handleAddTechnique = () => {
    if (!techniqueData || !selectedTechnique || !selectFile) return;
    addPcap(
      selectedTechnique,
      techniqueData,
      selectFile,
      selectedTactic || undefined
    );
  };

  const handleBuildChain = () => {
    buildChain(chainItems, {
      onSuccess: (data) => {
        setStepIndex(0);
        setFilterIndex(null);
        setFilterRange("");
        setRewriteIps([]);
        setRewriteMacs([]);
        setRewriteIpv6s([]);
        setRewriteArpIps([]);
        setRewriteDnsDomains([]);
        setRewriteTcpPorts([]);
        setRewriteUdpPorts([]);
        detailsMutation.mutate(data.file);
        infosMutation.mutate(data.file);
      },
    });
  };

  if (tacticsLoading) {
    return <p>Loading...</p>;
  }

  const mergedFile = buildData?.file ?? null;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-4xl mx-auto w-fit font-bold">Chain Builder</h1>

      <div className="flex flex-col lg:flex-row gap-6 relative min-h-[350px]">
        {/* Left side: Tactic and Technique Selection */}
        <div className="lg:w-[calc(50%-12px)]">
          <Card>
            <CardHeader>
              <CardTitle>MITRE ATT&CK Technique Selection</CardTitle>
              <CardDescription>
                Select a tactic, technique and PCAP to add to your chain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TacticSelector
                selectedTactic={selectedTactic}
                tacticsList={tacticsList}
                tacticData={tacticData}
                onTacticChange={handleTacticChange}
              />

              <TechniqueSelector
                selectedTechnique={selectedTechnique}
                tacticData={tacticData}
                techniquesData={techniquesData}
                techniqueData={techniqueData}
                selectFile={selectFile}
                pcapData={pcapData}
                pcapFilesLoading={pcapFilesLoading}
                onTechniqueChange={handleTechniqueChange}
                onDatasetSelect={handleFileChange}
                draggable={true}
                tacticId={selectedTactic}
              />

              {techniqueData && (
                <Button
                  onClick={handleAddTechnique}
                  className="w-full"
                  disabled={!selectedTechnique || !selectFile}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter le PCAP à la chaîne
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side: Technique Chain */}
        <div className="lg:absolute lg:top-0 lg:bottom-0 lg:right-0 lg:w-[calc(50%-12px)]">
          <Card className="h-full flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle>PCAP Chain</CardTitle>
              <CardDescription>
                Build your attack chain by adding and reordering technique PCAPs
              </CardDescription>
            </CardHeader>
            <CardContent className={`flex-1 min-h-0 flex flex-col ${selectedTactic ? "overflow-auto" : "overflow-hidden"}`}>
              <TechniqueChainList
                items={chainItems}
                onRemove={removeItem}
                onReorder={reorderItems}
                onDropFromOutside={addPcapFromDrop}
                onAddSleep={addSleep}
                onUpdateSleepDuration={updateSleepDuration}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Build Chain button */}
      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          size="lg"
          disabled={chainItems.length === 0 || isBuildPending}
          onClick={handleBuildChain}
        >
          {isBuildPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {isBuildPending ? "Building chain..." : "Build Chain"}
        </Button>

        {isBuildError && (
          <p className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {buildError.message}
          </p>
        )}

        {isBuildSuccess && buildData && (
          <p className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Chain built — {buildData.packet_count} packets, {buildData.duration}s total duration
          </p>
        )}
      </div>

      {/* Replay section — shown after successful build */}
      {isBuildSuccess && mergedFile && (
        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-bold">Replay</h2>

          <PcapInfos
            pcapInfos={infosMutation}
            rewriteValues={rewriteValues}
          />

          <PacketDetails
            selectedFile={mergedFile}
            data={detailsMutation.data}
            isPending={detailsMutation.isPending}
          />

          <div className="flex flex-row gap-20">
            <SelectInterface
              selectedInterface={selectedInterface}
              setSelectedInterface={setSelectedInterface}
              ifaces={ifacesList?.interfaces}
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
            selectFile={mergedFile}
            filterIndex={filterIndex}
            filterRange={filterRange}
          />
        </div>
      )}
    </div>
  );
}
