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
  { value: "all", label: "All Packets" },
  { value: "index", label: "Single Packet" },
  { value: "range", label: "Packet Range" },
];

interface IReplayFilterProps {
  filterIndex: number | null;
  setFilterIndex: (index: number | null) => void;
  filterRange: string;
  setFilterRange: (range: string) => void;
  totalPackets?: number;
  disabled: boolean;
}

export const ReplayFilter = ({
  filterIndex,
  setFilterIndex,
  filterRange,
  setFilterRange,
  totalPackets,
  disabled,
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

  const rangeStart = filterRange ? filterRange.split("-")[0] : "";
  const rangeEnd = filterRange ? filterRange.split("-")[1] || "" : "";
  const startNum = rangeStart ? parseInt(rangeStart) : null;
  const endNum = rangeEnd ? parseInt(rangeEnd) : null;

  const rangeError =
    startNum !== null && endNum !== null && startNum > endNum
      ? "Start must be ≤ End"
      : totalPackets && endNum !== null && endNum >= totalPackets
        ? `Max index: ${totalPackets - 1}`
        : null;

  const indexError =
    totalPackets && filterIndex !== null && filterIndex >= totalPackets
      ? `Max index: ${totalPackets - 1}`
      : null;

  return (
    <div className="flex flex-col gap-2 text-sm font-medium">
      <span>
        Packet Selection{totalPackets ? ` (${totalPackets} packets)` : ""}
      </span>
      <div className="flex flex-row gap-4 items-center">
        <Select
          disabled={disabled}
          onValueChange={(value: FilterMode) => handleModeChange(value)}
          value={filterMode ?? ""}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a replay mode" />
          </SelectTrigger>
          <SelectContent>
            {replayModes.map((mode) => (
              <SelectItem value={mode.value} key={mode.value}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filterMode === "index" && (
          <div className="flex items-center gap-2">
            <Input
              disabled={disabled}
              type="number"
              min="0"
              max={totalPackets ? totalPackets - 1 : undefined}
              placeholder="Index"
              value={filterIndex !== null ? filterIndex.toString() : ""}
              onChange={(e) => handleIndexChange(e.target.value)}
              className="w-24 h-8"
            />
            {indexError && (
              <span className="text-destructive text-xs">{indexError}</span>
            )}
          </div>
        )}

        {filterMode === "range" && (
          <div className="flex items-center gap-2">
            <Input
              disabled={disabled}
              type="number"
              min="0"
              max={totalPackets ? totalPackets - 1 : undefined}
              placeholder="From"
              value={rangeStart}
              onChange={(e) => {
                const val = e.target.value;
                setFilterRange(rangeEnd ? `${val}-${rangeEnd}` : val);
              }}
              className="w-20 h-8"
            />
            <span>-</span>
            <Input
              disabled={disabled}
              type="number"
              min="0"
              max={totalPackets ? totalPackets - 1 : undefined}
              placeholder="To"
              value={rangeEnd}
              onChange={(e) => {
                const val = e.target.value;
                setFilterRange(rangeStart ? `${rangeStart}-${val}` : `-${val}`);
              }}
              className="w-20 h-8"
            />
            {rangeError && (
              <span className="text-destructive text-xs">{rangeError}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
