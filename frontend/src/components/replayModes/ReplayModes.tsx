interface IReplayModesProps {
  selected: string;
  setSelected: (mode: string) => void;
}

export const ReplayModes = ({ selected, setSelected }: IReplayModesProps) => {
  return (
    <div className="flex flex-row gap-4 items-center justify-center">
      <div className="flex flex-row gap-1">
        <input
          checked={selected === "realTime"}
          onChange={(e) => setSelected(e.target.value)}
          type="radio"
          name="speed"
          value="realTime"
        />
        Real Time (Slowest)
      </div>
      <div className="flex flex-row gap-1">
        <input
          checked={selected === "fast"}
          onChange={(e) => setSelected(e.target.value)}
          type="radio"
          name="speed"
          value="fast"
        />
        Full Speed with Progress Bar (Faster)
      </div>
      <div className="flex flex-row gap-1">
        <input
          checked={selected === "fastest"}
          onChange={(e) => setSelected(e.target.value)}
          type="radio"
          name="speed"
          value="fastest"
        />
        Full Speed (Fastest)
      </div>
    </div>
  );
};
