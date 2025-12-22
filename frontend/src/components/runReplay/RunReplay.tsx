import { ButtonsReplay } from "@/components/buttonsReplay/ButtonsReplay";
import { ReplayProgress } from "@/components/replayProgress/ReplayProgress";
import { ReplayStepProgress } from "@/components/replayStepProgress/ReplayStepProgress";
import type {
  ReplayModeType,
  ReplayProgressType,
  RunStatusType,
} from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface IRunReplayProps {
  selectedInterface: string | null;
  rewriteIps: Record<string, string>[];
  rewriteMacs: Record<string, string>[];
  stepIndex: number;
  setStepIndex: (index: number) => void;
  selectedMode: ReplayModeType;
  selectFile: string | null;
}

export const RunReplay = ({
  selectedInterface,
  rewriteIps,
  rewriteMacs,
  stepIndex,
  setStepIndex,
  selectedMode,
  selectFile,
}: IRunReplayProps) => {
  const [clientSid, setClientSid] = useState(null);
  const [socketData, setSocketData] = useState<ReplayProgressType | null>(null);
  const [running, setRunning] = useState(false);
  const socket = io("http://localhost:5000/realtime", {
    autoConnect: true,
  });

  useEffect(() => {
    console.log("Initialisation listeners...");

    const connected = () => console.log("WS connecté !");
    const replayProgress = (data: ReplayProgressType) => {
      setSocketData(data);
    };

    const handleStatus = (data: RunStatusType) => {
      setRunning(data.running);
      if (!data.running) setSocketData(null);
      console.log("RUNNIG", data);
    };

    socket.on("connect", connected);
    socket.on("sid", ({ sid }) => {
      console.log("My SID:", sid);
      setClientSid(sid);
    });
    socket.on("replay_progress", replayProgress);
    socket.on("run_status", handleStatus);

    return () => {
      socket.off("connect", connected);
      socket.off("replay_progress", replayProgress);
      socket.off("run_status", handleStatus);
    };
  }, []);

  window.addEventListener("beforeunload", () => {
    socket.emit("stop_replay");
    setSocketData(null);
  });

  const runMutation = useMutation({
    mutationFn: async (file: string) => {
      const urls: Record<string, string> = {
        realTime: "replay_realtime",
        fast: "replay_faster",
        fastest: "replay_fastest",
        step: "replay-step",
      };
      const formData = new FormData();
      formData.append("file", file ?? "");
      formData.append("iface", selectedInterface ?? "");
      formData.append("sid", clientSid ?? "");
      formData.append("rewriteIps", JSON.stringify(rewriteIps));
      formData.append("rewriteMacs", JSON.stringify(rewriteMacs));
      formData.append("index", stepIndex.toString());

      const res = await fetch(
        `http://localhost:5000/api/${urls[selectedMode]}/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Erreur API");

      return res.json();
    },
  });

  return (
    <div className="flex flex-row gap-10 w-full items-center">
      <div className="mb-auto">
        <ButtonsReplay
          selectedMode={selectedMode}
          running={running}
          runMutation={runMutation}
          selectFile={selectFile}
          selectedInterface={selectedInterface}
          socket={socket}
          setStepIndex={setStepIndex}
          stepIndex={stepIndex}
        />
      </div>
      {selectedMode === "step" ? (
        <ReplayStepProgress mutation={runMutation} selectFile={selectFile} />
      ) : (
        <ReplayProgress
          socketData={socketData}
          mode={selectedMode}
          loading={runMutation.isPending}
        />
      )}
    </div>
  );
};
