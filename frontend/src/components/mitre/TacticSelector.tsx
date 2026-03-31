import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TacticCard } from "./TacticCard";
import type { Tactic } from "@/types/mitre";

interface TacticSelectorProps {
  selectedTactic: string | null;
  tacticsList?: { files: string[] };
  tacticData: Tactic | null;
  onTacticChange: (tacticFile: string) => void;
}

export function TacticSelector({
  selectedTactic,
  tacticsList,
  tacticData,
  onTacticChange,
}: TacticSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Tactic</label>
      <Select value={selectedTactic || ""} onValueChange={onTacticChange}>
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
      {tacticData && <TacticCard tactic={tacticData} />}
    </div>
  );
}
