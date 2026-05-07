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
import { useScenarioBuilderQueries } from "@/hooks/useScenarioBuilderQueries";
import { useScenarioItems } from "@/hooks/useScenarioItems";
import { Plus } from "lucide-react";
import { TechniqueCard } from "@/components/mitre/TechniqueCard";

interface IScenarioBuildPhaseProps {
  queries: ReturnType<typeof useScenarioBuilderQueries>;
  scenario: ReturnType<typeof useScenarioItems>;
}

export const ScenarioBuildPhase = ({
  queries,
  scenario,
}: IScenarioBuildPhaseProps) => {
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
    const dataset = pcapData?.datasets?.find((d) => d.file === selectFile);
    scenario.addPcap(
      selectedTechnique,
      techniqueData,
      selectFile,
      selectedTactic?.split("_")[0] || undefined,
      dataset,
    );
  };

  return (
    <>
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>MITRE ATT&CK Technique Selection</CardTitle>
            <CardDescription>
              Select a tactic, technique and PCAP to add to your scenario
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
              onTechniqueChange={handleTechniqueChange}
            />

            {techniqueData && (
              <>
                <TechniqueCard
                  technique={techniqueData}
                  selectFile={selectFile}
                  pcapData={pcapData}
                  pcapFilesLoading={pcapFilesLoading}
                  onDatasetSelect={handleFileChange}
                />
                <Button
                  onClick={handleAddTechnique}
                  className="w-full"
                  disabled={!selectedTechnique || !selectFile}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter le PCAP au scénario
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
