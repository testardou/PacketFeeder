import { Button } from "@/components/ui/button";
import type { ReplayModeType } from "@/types/types";
import type { UseMutationResult } from "@tanstack/react-query";

interface IButtonsReplayProps {
  selectFile: string | null;
  selectedInterface: string | null;
  running: boolean;
  runMutation: UseMutationResult<unknown, Error, string, unknown>;
  socket: {
    emit: (event: string) => void;
  };
  selectedMode: ReplayModeType;
  setStepIndex: (index: number) => void;
  stepIndex: number;
}

export const ButtonsReplay = ({
  selectFile,
  selectedInterface,
  running,
  runMutation,
  socket,
  selectedMode,
  setStepIndex,
  stepIndex,
}: IButtonsReplayProps) => {
  if (selectedMode === "step")
    return (
      <Button
        type="submit"
        variant="outline"
        disabled={!selectFile || !selectedInterface}
        color="blue"
        onClick={() => {
          if (selectFile) runMutation.mutate(selectFile);
          setStepIndex(stepIndex + 1);
        }}
      >
        Step
      </Button>
    );
  if (selectedMode === "fastest")
    return (
      <Button
        type="submit"
        variant="outline"
        disabled={!selectFile || !selectedInterface || running}
        color="blue"
        onClick={() => selectFile && runMutation.mutate(selectFile)}
      >
        Replay
      </Button>
    );
  return (
    <div className="flex flex-col gap-3">
      <Button
        type="submit"
        variant="outline"
        disabled={!selectFile || !selectedInterface || running}
        color="blue"
        onClick={() => selectFile && runMutation.mutate(selectFile)}
      >
        Replay
      </Button>
      <Button
        type="submit"
        variant="destructive"
        disabled={!running}
        onClick={() => socket.emit("stop_replay")}
      >
        Stop
      </Button>
    </div>
  );
};
