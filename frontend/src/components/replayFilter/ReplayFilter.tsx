import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText } from "lucide-react";

type FilterMode = "all" | "index" | "range";

interface IReplayFilterProps {
  filterIndex: number | null;
  setFilterIndex: (index: number | null) => void;
  filterRange: string;
  setFilterRange: (range: string) => void;
}

export const ReplayFilter = ({
  filterIndex,
  setFilterIndex,
  filterRange,
  setFilterRange,
}: IReplayFilterProps) => {
  // Determine current mode based on values
  const getCurrentMode = (): FilterMode => {
    if (filterIndex !== null) return "index";
    if (filterRange !== "") return "range";
    return "all";
  };

  // Initialize mode from current values
  const [filterMode, setFilterMode] = useState<FilterMode>(() =>
    getCurrentMode()
  );

  // Update mode when user explicitly changes it
  const handleModeChange = (mode: FilterMode) => {
    setFilterMode(mode);
    // Clear values when switching modes
    if (mode === "all") {
      setFilterIndex(null);
      setFilterRange("");
    } else if (mode === "index") {
      setFilterRange("");
    } else if (mode === "range") {
      setFilterIndex(null);
    }
  };

  // Use filterMode directly - it's controlled by user selection
  const displayedMode = filterMode;

  const handleIndexChange = (value: string) => {
    if (value === "") {
      setFilterIndex(null);
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 0) {
        setFilterIndex(num);
      }
    }
  };

  const handleRangeChange = (value: string) => {
    setFilterRange(value);
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-3xl">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FileText className="h-4 w-4" />
        <span>Packet Filter</span>
      </div>

      <div className="flex flex-row items-center gap-4 flex-wrap">
        <RadioGroup
          value={displayedMode}
          onValueChange={(value) => handleModeChange(value as FilterMode)}
          className="flex flex-row gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="filter-all" />
            <Label
              htmlFor="filter-all"
              className="cursor-pointer text-sm font-normal"
            >
              All
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="index" id="filter-index-option" />
            <Label
              htmlFor="filter-index-option"
              className="cursor-pointer text-sm font-normal"
            >
              Index
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="range" id="filter-range-option" />
            <Label
              htmlFor="filter-range-option"
              className="cursor-pointer text-sm font-normal"
            >
              Range
            </Label>
          </div>
        </RadioGroup>

        {displayedMode === "index" && (
          <div className="flex items-center gap-2">
            <Label
              htmlFor="filter-index"
              className="text-sm text-muted-foreground whitespace-nowrap"
            >
              Index:
            </Label>
            <Input
              id="filter-index"
              type="number"
              min="0"
              placeholder="e.g., 5"
              value={filterIndex !== null ? filterIndex.toString() : ""}
              onChange={(e) => handleIndexChange(e.target.value)}
              className="w-24 h-8"
            />
          </div>
        )}

        {displayedMode === "range" && (
          <div className="flex items-center gap-2">
            <Label
              htmlFor="filter-range"
              className="text-sm text-muted-foreground whitespace-nowrap"
            >
              Range:
            </Label>
            <Input
              id="filter-range"
              type="text"
              placeholder="e.g., 5-10"
              value={filterRange}
              onChange={(e) => handleRangeChange(e.target.value)}
              className="w-32 h-8"
            />
          </div>
        )}
      </div>
    </div>
  );
};
