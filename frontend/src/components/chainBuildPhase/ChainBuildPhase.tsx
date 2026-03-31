import { TechniqueChainList } from "@/components/chainbuilder/TechniqueChainList";
import type {
  ChainInfosResponse,
  ChainItem,
} from "@/components/chainbuilder/types";
import { TacticSelector } from "@/components/mitre/TacticSelector";
import { TechniqueSelector } from "@/components/mitre/TechniqueSelector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useChainBuilderQueries } from "@/hooks/useChainBuilderQueries";
import { useChainItems } from "@/hooks/useChainItems";
import type { UseMutationResult } from "@tanstack/react-query";
import { Plus, Loader2, Search, AlertCircle } from "lucide-react";

interface IChainBuildPhaseProps {
  queries: ReturnType<typeof useChainBuilderQueries>;
  chain: ReturnType<typeof useChainItems>;
  chainInfosMutation: UseMutationResult<ChainInfosResponse, Error, ChainItem[]>;
  resetRewrites: () => void;
}

export const ChainBuildPhase = ({
  queries,
  chain,
  chainInfosMutation,
  resetRewrites,
}: IChainBuildPhaseProps) => {
  const {
    addPcap,
    addPcapFromDrop,
    removeItem,
    reorderItems,
    addSleep,
    updateSleepDuration,
    chainItems,
  } = chain;

  const {
    selectFile,
    selectedTactic,
    selectedTechnique,
    techniqueData,
    tacticsList,
    tacticData,
    pcapData,
    techniquesData,
    pcapFilesLoading,
    handleTacticChange,
    handleTechniqueChange,
    handleFileChange,
  } = queries;

  const handleAddTechnique = () => {
    if (!techniqueData || !selectedTechnique || !selectFile) return;
    addPcap(
      selectedTechnique,
      techniqueData,
      selectFile,
      selectedTactic || undefined,
    );
  };

  const handleFetchInfos = () => {
    resetRewrites();
    chainInfosMutation.mutate(chainItems, {});
  };

  return (
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
                Build your attack chain by adding and reordering technique PCAPs
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
          disabled={chainItems.length === 0 || chainInfosMutation.isPending}
          onClick={handleFetchInfos}
        >
          {chainInfosMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          {chainInfosMutation.isPending ? "Fetching infos..." : "Fetch Infos"}
        </Button>

        {chainInfosMutation.isError && (
          <p className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {chainInfosMutation.error.message}
          </p>
        )}
      </div>
    </>
  );
};
