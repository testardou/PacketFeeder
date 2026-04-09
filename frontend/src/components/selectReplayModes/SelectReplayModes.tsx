import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "@/components/ui/select";
import type { ReplayModeType } from "@/types/types";

interface ISelectReplayModesProps {
  selected: ReplayModeType;
  setSelected: (mode: ReplayModeType) => void;
}
type SelectReplayModeType = { value: ReplayModeType; label: string };

const replayModes: SelectReplayModeType[] = [
  {
    value: "realTime",
    label: "Real Time (Slowest)",
  },
  {
    value: "fast",
    label: "Full Speed with Progress Bar (Faster)",
  },
  {
    value: "fastest",
    label: "Full Speed (Fastest)",
  },
  {
    value: "step",
    label: "Step by step",
  },
];

export const SelectReplayModes = ({
  selected,
  setSelected,
}: ISelectReplayModesProps) => {
  return (
    <div className="flex flex-col gap-2 text-sm font-medium">
      <span>Replay Mode</span>
      <Select
        onValueChange={(value: ReplayModeType) => setSelected(value)}
        value={selected ?? ""}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a replay mode" />
        </SelectTrigger>
        <SelectContent>
          {replayModes?.map((mode: SelectReplayModeType) => (
            <SelectItem value={mode.value} key={mode.value}>
              {mode.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
