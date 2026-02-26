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

  const { mutate: buildChain, isPending, isSuccess, isError, error } = useBuildChain();

  const handleAddTechnique = () => {
    if (!techniqueData || !selectedTechnique || !selectFile) return;
    addPcap(
      selectedTechnique,
      techniqueData,
      selectFile,
      selectedTactic || undefined
    );
  };

  if (tacticsLoading) {
    return <p>Loading...</p>;
  }

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

      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          size="lg"
          disabled={chainItems.length === 0 || isPending}
          onClick={() => buildChain(chainItems)}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {isPending ? "Building chain..." : "Build Chain"}
        </Button>

        {isError && (
          <p className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error.message}
          </p>
        )}

        {isSuccess && (
          <p className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Chain validated successfully
          </p>
        )}
      </div>
    </div>
  );
}
