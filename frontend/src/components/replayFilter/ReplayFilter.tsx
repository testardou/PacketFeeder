import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, Hash, List } from "lucide-react";

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
    <Card className="w-full max-w-2xl border-2">
      <CardHeader className="bg-muted/50 pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Packet Filter
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <RadioGroup
          value={displayedMode}
          onValueChange={(value) => handleModeChange(value as FilterMode)}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="all" id="filter-all" />
            <Label
              htmlFor="filter-all"
              className="cursor-pointer flex-1 flex items-center gap-2 font-normal"
            >
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>All PCAP file</span>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="index" id="filter-index-option" />
            <Label
              htmlFor="filter-index-option"
              className="cursor-pointer flex-1 flex items-center gap-2 font-normal"
            >
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>Index</span>
            </Label>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <RadioGroupItem value="range" id="filter-range-option" />
            <Label
              htmlFor="filter-range-option"
              className="cursor-pointer flex-1 flex items-center gap-2 font-normal"
            >
              <List className="h-4 w-4 text-muted-foreground" />
              <span>Range index</span>
            </Label>
          </div>
        </RadioGroup>

        {displayedMode === "index" && (
          <div className="space-y-2 pl-8 border-l-2 border-primary/20 bg-muted/30 p-4 rounded-md">
            <Label htmlFor="filter-index" className="text-sm font-medium">
              Single Index (0-based)
            </Label>
            <Input
              id="filter-index"
              type="number"
              min="0"
              placeholder="e.g., 5"
              value={filterIndex !== null ? filterIndex.toString() : ""}
              onChange={(e) => handleIndexChange(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Replay only the packet at the specified index
            </p>
          </div>
        )}

        {displayedMode === "range" && (
          <div className="space-y-2 pl-8 border-l-2 border-primary/20 bg-muted/30 p-4 rounded-md">
            <Label htmlFor="filter-range" className="text-sm font-medium">
              Range (start-end)
            </Label>
            <Input
              id="filter-range"
              type="text"
              placeholder="e.g., 5-10"
              value={filterRange}
              onChange={(e) => handleRangeChange(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Replay packets from start index to end index (inclusive)
            </p>
          </div>
        )}

        {displayedMode === "all" && (
          <div className="pl-8 border-l-2 border-primary/20 bg-muted/30 p-4 rounded-md">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All packets from the PCAP file will be replayed
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
