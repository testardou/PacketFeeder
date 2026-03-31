import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TechniqueCard } from "./TechniqueCard";
import type { Tactic, Technique, PcapDataResponse } from "@/types/mitre";

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
  hideCard?: boolean;
  draggable?: boolean;
  tacticId?: string | null;
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
  hideCard = false,
  draggable = false,
  tacticId = null,
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
            const techniqueName = technique?.mitre?.technique_name || techId;
            return (
              <SelectItem key={techId} value={techId}>
                {techId} - {techniqueName}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {techniqueData && !hideCard && (
        <TechniqueCard
          technique={techniqueData}
          selectFile={selectFile}
          pcapData={pcapData}
          pcapFilesLoading={pcapFilesLoading}
          onDatasetSelect={onDatasetSelect}
          draggablePcaps={draggable}
          tacticId={tacticId}
        />
      )}
    </div>
  );
}
