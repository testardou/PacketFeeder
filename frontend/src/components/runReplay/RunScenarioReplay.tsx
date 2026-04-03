import { ButtonsReplay } from "@/components/buttonsReplay/ButtonsReplay";
import { ReplayProgress } from "@/components/replayProgress/ReplayProgress";
import { ReplayStepProgress } from "@/components/replayStepProgress/ReplayStepProgress";
import type {
  ReplayModeType,
  ReplayProgressType,
  RunStatusType,
} from "@/types/types";
import type {
  ScenarioItem,
  RewriteMapsCollection,
  PerPcapRewrites,
} from "@/components/scenariobuilder/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_CONFIG } from "@/config/api";

function toApiItems(items: ScenarioItem[]) {
  return items.map((item) => {
    if (item.type === "pcap") {
      return {
        type: "pcap" as const,
        pcap_file: item.pcapFile,
        technique_id: item.techniqueId ?? null,
        tactic_id: item.tacticId ?? null,
      };
    }
    return {
      type: "sleep" as const,
      duration: item.duration,
    };
  });
}

interface IRunScenarioReplayProps {
  scenarioItems: ScenarioItem[];
  globalRewrites: RewriteMapsCollection;
  perPcapRewrites: PerPcapRewrites;
  selectedMode: ReplayModeType;
  selectedInterface: string | null;
  stepIndex: number;
  setStepIndex: (index: number) => void;
  filterIndex: number | null;
  filterRange: string;
}

export const RunScenarioReplay = ({
  scenarioItems,
  globalRewrites,
  perPcapRewrites,
  selectedMode,
  selectedInterface,
  stepIndex,
  setStepIndex,
  filterIndex,
  filterRange,
}: IRunScenarioReplayProps) => {
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
    mutationFn: async () => {
      const modeMap: Record<string, string> = {
        realTime: "realTime",
        fast: "fast",
        fastest: "fastest",
        step: "realTime",
      };

      let indexVal: number | null = null;
      let rangeVal: string | null = null;

      if (selectedMode === "step") {
        indexVal = stepIndex;
      } else {
        if (filterIndex !== null) {
          indexVal = filterIndex;
        } else if (filterRange !== "") {
          rangeVal = filterRange;
        }
      }

      const body = {
        items: toApiItems(scenarioItems),
        iface: selectedInterface ?? "",
        sid: clientSid ?? "",
        mode: modeMap[selectedMode] ?? "realTime",
        global_rewrites: globalRewrites,
        per_pcap_rewrites: perPcapRewrites,
        index: indexVal,
        range: rangeVal,
      };

      const res = await fetch(`${API_CONFIG.API_BASE}/replay-scenario/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "API Error");
      }

      return res.json();
    },
  });

  // ButtonsReplay expects selectFile and a mutation that takes a file string.
  // We wrap our mutation so that ButtonsReplay can trigger it with any string.
  const wrappedMutation = {
    ...runMutation,
    mutate: (_file: string | undefined, options?: unknown) => {
      runMutation.mutate(undefined, options as never);
    },
    mutateAsync: async (_file: string | undefined, options?: unknown) => {
      return runMutation.mutateAsync(undefined, options as never);
    },
  };

  return (
    <div className="flex flex-row gap-10 w-full items-center">
      <div className="mb-auto">
        <ButtonsReplay
          selectedMode={selectedMode}
          running={running}
          runMutation={wrappedMutation as never}
          selectFile="scenario"
          selectedInterface={selectedInterface}
          socket={socket}
          setStepIndex={setStepIndex}
          stepIndex={stepIndex}
        />
      </div>
      {selectedMode === "step" ? (
        <ReplayStepProgress
          mutation={wrappedMutation as never}
          selectFile="scenario"
        />
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
