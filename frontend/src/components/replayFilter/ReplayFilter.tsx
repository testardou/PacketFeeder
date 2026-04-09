import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";

type FilterMode = "all" | "index" | "range";

type SelectFilterModeType = { value: FilterMode; label: string };

const replayModes: SelectFilterModeType[] = [
  {
    value: "all",
    label: "All Pcakets",
  },
  {
    value: "index",
    label: "Single Packet",
  },
  {
    value: "range",
    label: "Packet Range",
  },
];
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
  const getCurrentMode = (): FilterMode => {
    if (filterIndex !== null) return "index";
    if (filterRange !== "") return "range";
    return "all";
  };
  const [filterMode, setFilterMode] = useState<FilterMode>(() =>
    getCurrentMode(),
  );
  const handleModeChange = (mode: FilterMode) => {
    setFilterMode(mode);
    if (mode === "all") {
      setFilterIndex(null);
      setFilterRange("");
    } else if (mode === "index") {
      setFilterRange("");
    } else if (mode === "range") {
      setFilterIndex(null);
    }
  };
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
    <>
      <div className="flex flex-col gap-2 text-sm font-medium">
        <span>Packet Selection</span>
        <div className="flex flex-row gap-4">
          <Select
            onValueChange={(value: FilterMode) => handleModeChange(value)}
            value={filterMode ?? ""}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a replay mode" />
            </SelectTrigger>
            <SelectContent>
              {replayModes?.map((mode: SelectFilterModeType) => (
                <SelectItem value={mode.value} key={mode.value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-row items-center gap-4 flex-wrap">
            {displayedMode === "index" && (
              <div className="flex flex-col items-center gap-2">
                <Input
                  id="filter-index"
                  type="number"
                  min="0"
                  placeholder="Index"
                  value={filterIndex !== null ? filterIndex.toString() : ""}
                  onChange={(e) => handleIndexChange(e.target.value)}
                  className="w-24 h-8"
                />
              </div>
            )}

            {displayedMode === "range" && (
              <div className="flex flex-col items-center gap-2">
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
      </div>
    </>
  );
};
