import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TechniqueCard } from "./TechniqueCard";
import type { Tactic, Technique, PcapDataResponse } from "@/types/scenarios";

interface TechniqueSelectorProps {
  selectedTechnique: string | null;
  tacticData: Tactic | null;
  techniquesData?: Record<string, Technique>;
  techniqueData: Technique | null;
  selectFile: string | null;
  pcapData?: PcapDataResponse;
  pcapFilesLoading?: boolean;
  onTechniqueChange: (techniqueId: string) => void;
  onDatasetSelect: (fileName: string) => void;
}

export function TechniqueSelector({
  selectedTechnique,
  tacticData,
  techniquesData,
  techniqueData,
  selectFile,
  pcapData,
  pcapFilesLoading,
  onTechniqueChange,
  onDatasetSelect,
}: TechniqueSelectorProps) {
  if (!tacticData) return null;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Technique</label>
      <Select
        value={selectedTechnique || ""}
        onValueChange={onTechniqueChange}
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
        <TechniqueCard
          technique={techniqueData}
          selectFile={selectFile}
          pcapData={pcapData}
          pcapFilesLoading={pcapFilesLoading}
          onDatasetSelect={onDatasetSelect}
        />
      )}
    </div>
  );
}

