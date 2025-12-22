import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { ReplayModeType } from "@/types/types";

interface IReplayModesProps {
  selected: ReplayModeType;
  setSelected: (mode: ReplayModeType) => void;
}

export const ReplayModes = ({ selected, setSelected }: IReplayModesProps) => {
  const replayModes: { value: ReplayModeType; label: string }[] = [
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

  return (
    <RadioGroup
      className="flex flex-row"
      defaultValue={replayModes[0].value}
      value={selected}
      onValueChange={setSelected}
    >
      {replayModes.map((mode) => (
        <div key={mode.value} className="flex items-center space-x-2">
          <RadioGroupItem value={mode.value} id={mode.value} />
          <Label htmlFor={mode.value}>{mode.label}</Label>
        </div>
      ))}
    </RadioGroup>
  );
};
