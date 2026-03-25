import { ButtonsReplay } from "@/components/buttonsReplay/ButtonsReplay";
import { ReplayProgress } from "@/components/replayProgress/ReplayProgress";
import { ReplayStepProgress } from "@/components/replayStepProgress/ReplayStepProgress";
import type {
  ReplayModeType,
  ReplayProgressType,
  RewriteValues,
  RunStatusType,
} from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_CONFIG } from "@/config/api";

interface IRunReplayProps {
  selectedInterface: string | null;
  rewrites: RewriteValues;
  stepIndex: number;
  setStepIndex: (index: number) => void;
  selectedMode: ReplayModeType;
  selectFile: string | null;
  filterIndex: number | null;
  filterRange: string;
}

export const RunReplay = ({
  selectedInterface,
  rewrites,
  stepIndex,
  setStepIndex,
  selectedMode,
  selectFile,
  filterIndex,
  filterRange,
}: IRunReplayProps) => {
  const [clientSid, setClientSid] = useState<string | null>(null);
  const [socketData, setSocketData] = useState<ReplayProgressType | null>(null);
  const [running, setRunning] = useState(false);
  const socket = io(API_CONFIG.SOCKET_URL, {
    autoConnect: true,
  });

  useEffect(() => {
    const replayProgress = (data: ReplayProgressType) => {
      setSocketData(data);
    };

    const handleStatus = (data: RunStatusType) => {
      setRunning(data.running);
      if (!data.running) setSocketData(null);
    };

    const handleConnect = () => {
      // Request current status when connecting
      socket.emit("get_status");
    };

    const handleSid = ({ sid }: { sid: string }) => {
      setClientSid(sid);
    };

    socket.on("connect", handleConnect);
    socket.on("sid", handleSid);
    socket.on("replay_progress", replayProgress);
    socket.on("run_status", handleStatus);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("sid", handleSid);
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
      formData.append("rewriteIps", JSON.stringify(rewrites.rewriteIps));
      formData.append("rewriteMacs", JSON.stringify(rewrites.rewriteMacs));
      formData.append("rewriteIpv6s", JSON.stringify(rewrites.rewriteIpv6s));
      formData.append("rewriteArpIps", JSON.stringify(rewrites.rewriteArpIps));
      formData.append(
        "rewriteDnsDomains",
        JSON.stringify(rewrites.rewriteDnsDomains),
      );
      formData.append(
        "rewriteTcpPorts",
        JSON.stringify(rewrites.rewriteTcpPorts),
      );
      formData.append(
        "rewriteUdpPorts",
        JSON.stringify(rewrites.rewriteUdpPorts),
      );

      // For step mode, use stepIndex; otherwise use filterIndex or filterRange
      if (selectedMode === "step") {
        formData.append("index", stepIndex.toString());
      } else {
        if (filterIndex !== null) {
          formData.append("index", filterIndex.toString());
        } else if (filterRange !== "") {
          formData.append("range", filterRange);
        }
      }

      const res = await fetch(`${API_CONFIG.API_BASE}/${urls[selectedMode]}/`, {
        method: "POST",
        body: formData,
      });

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
