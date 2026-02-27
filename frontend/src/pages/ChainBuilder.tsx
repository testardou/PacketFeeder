import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Plus,
  Search,
  Play,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useChainBuilderQueries } from "@/hooks/useChainBuilderQueries";
import { useChainItems } from "@/hooks/useChainItems";
import { useChainInfos } from "@/hooks/useChainInfos";
import { useChainRewrites } from "@/hooks/useChainRewrites";
import { ChainRewritePanel } from "@/components/chainbuilder/ChainRewritePanel";
import { SelectInterface } from "@/components/selectInterface/SelectInterface";
import { ReplayModes } from "@/components/replayModes/ReplayModes";
import { ReplayFilter } from "@/components/replayFilter/ReplayFilter";
import { RunChainReplay } from "@/components/runReplay/RunChainReplay";
import { API_CONFIG } from "@/config/api";
import type { InterfacesType, ReplayModeType } from "@/types/types";

type Phase = "build" | "rewrites" | "replay";

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

  // --- Phase ---
  const [phase, setPhase] = useState<Phase>("build");

  // --- Chain infos ---
  const chainInfosMutation = useChainInfos();

  // --- Rewrites ---
  const {
    globalRewrites,
    perPcapRewrites,
    globalRewriteValues,
    getPerPcapRewriteValues,
    resetAll: resetRewrites,
  } = useChainRewrites();

  // --- Replay state ---
  const [selectedMode, setSelectedMode] = useState<ReplayModeType>("realTime");
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    null
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [filterIndex, setFilterIndex] = useState<number | null>(null);
  const [filterRange, setFilterRange] = useState("");

  const { data: ifacesList } = useQuery<InterfacesType>({
    queryKey: ["interfaces"],
    queryFn: async () => {
      const res = await fetch(`${API_CONFIG.API_BASE}/get_interfaces/`);
      if (!res.ok) throw new Error("Failed to load interfaces");
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

  const handleFetchInfos = () => {
    resetRewrites();
    chainInfosMutation.mutate(chainItems, {
      onSuccess: () => {
        setPhase("rewrites");
      },
    });
  };

  const handleContinueToReplay = () => {
    setStepIndex(0);
    setFilterIndex(null);
    setFilterRange("");
    setPhase("replay");
  };

  const handleBackToBuild = () => {
    setPhase("build");
  };

  const handleBackToRewrites = () => {
    setPhase("rewrites");
  };

  if (tacticsLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-4xl mx-auto w-fit font-bold">Chain Builder</h1>

      {/* ===== Phase: BUILD ===== */}
      {phase === "build" && (
        <>
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
                    Build your attack chain by adding and reordering technique
                    PCAPs
                  </CardDescription>
                </CardHeader>
                <CardContent
                  className={`flex-1 min-h-0 flex flex-col ${selectedTactic ? "overflow-auto" : "overflow-hidden"}`}
                >
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

          {/* Fetch Infos button */}
          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              size="lg"
              disabled={
                chainItems.length === 0 || chainInfosMutation.isPending
              }
              onClick={handleFetchInfos}
            >
              {chainInfosMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {chainInfosMutation.isPending
                ? "Fetching infos..."
                : "Fetch Infos"}
            </Button>

            {chainInfosMutation.isError && (
              <p className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {chainInfosMutation.error.message}
              </p>
            )}
          </div>
        </>
      )}

      {/* ===== Phase: REWRITES ===== */}
      {phase === "rewrites" && chainInfosMutation.data && (
        <>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBackToBuild}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Build
            </Button>
          </div>

          <ChainRewritePanel
            chainInfos={chainInfosMutation.data}
            globalRewriteValues={globalRewriteValues}
            getPerPcapRewriteValues={getPerPcapRewriteValues}
          />

          <Button
            className="w-full"
            size="lg"
            onClick={handleContinueToReplay}
          >
            <Play className="h-4 w-4 mr-2" />
            Continue to Replay
          </Button>
        </>
      )}

      {/* ===== Phase: REPLAY ===== */}
      {phase === "replay" && (
        <>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBackToRewrites}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Rewrites
            </Button>
          </div>

          <div className="flex flex-col gap-5">
            <h2 className="text-2xl font-bold">Replay</h2>

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

            <RunChainReplay
              chainItems={chainItems}
              globalRewrites={globalRewrites}
              perPcapRewrites={perPcapRewrites}
              selectedMode={selectedMode}
              selectedInterface={selectedInterface}
              stepIndex={stepIndex}
              setStepIndex={setStepIndex}
              filterIndex={filterIndex}
              filterRange={filterRange}
            />
          </div>
        </>
      )}
    </div>
  );
}
