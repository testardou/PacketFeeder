import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";

import { ReplayConfiguration } from "../replayConfiguration/ReplayConfiguration";
import { PcapInfos } from "../pcapInfos/PcapInfos";
import type { ReplayProgressType, RunStatusType } from "../../types/types";
import { ReplayModes } from "../replayModes/ReplayModes";
import { ReplayProgress } from "../replayProgress/ReplayProgress";
const socket = io("http://localhost:5000/realtime", {
  autoConnect: true,
});

export const Replay = () => {
  const [file, setFile] = useState<File | null>(null);
  const [clientSid, setClientSid] = useState(null);
  const [socketData, setSocketData] = useState<ReplayProgressType | null>(null);
  const [selected, setSelected] = useState("realTime");
  const [running, setRunning] = useState(false);

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

  const { data: ifaces_list, isLoading } = useQuery({
    queryKey: ["interfaces"], // identifiant unique du cache
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/get_interfaces/");

      if (!res.ok) {
        throw new Error("Erreur API");
      }

      return res.json();
    },
  });
  const [selectedInterface, setSelectectedInterface] = useState(
    ifaces_list?.interfaces?.[0] ?? ""
  );

  const uploadMutation = useMutation({
    mutationFn: async (file: File | null) => {
      const formData = new FormData();
      formData.append("file", file ?? "");

      const res = await fetch("http://localhost:5000/api/infos-pcap/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur API");
      return res.json();
    },
  });

  const runMutation = useMutation({
    mutationFn: async (file: File | null) => {
      const urls: Record<string, string> = {
        realTime: "replay_realtime",
        fast: "replay_faster",
        fastest: "replay_fastest",
      };

      const formData = new FormData();
      formData.append("file", file ?? "");
      formData.append("iface", selectedInterface);
      formData.append("sid", clientSid ?? "");

      const res = await fetch(`http://localhost:5000/api/${urls[selected]}/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur API");

      return res.json();
    },
  });
  if (isLoading) {
    return <p>Loading interfaces...</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <ReplayConfiguration
        ifaces={ifaces_list?.interfaces}
        selectedInterface={selectedInterface}
        setSelectectedInterface={setSelectectedInterface}
        setFile={setFile}
        uploadMutation={uploadMutation}
        file={file}
      />
      {/* LOADING */}
      {uploadMutation.isPending && (
        <p className="text-gray-500">Analyse en cours…</p>
      )}

      {/* ERREUR */}
      {uploadMutation.isError && (
        <p className="text-red-600">
          Erreur lors du chargement: {uploadMutation.error.message}
        </p>
      )}
      {/* SUCCÈS */}
      {uploadMutation.isSuccess && (
        <>
          <div className="flex flex-col gap-3">
            <PcapInfos pcapInfos={uploadMutation.data} />
            <ReplayModes selected={selected} setSelected={setSelected} />
            <button
              onClick={() => runMutation.mutate(file)}
              type="button"
              disabled={running}
              className={`${
                !running
                  ? "bg-blue-500 hover:bg-blue-700 text-white"
                  : "bg-gray-400 hover:bg-gray-400 text-gray-600"
              } font-bold py-2 px-4 rounded`}
            >
              Replay
            </button>
            {runMutation.isPending ? (
              <p className="text-gray-500">Analyse en cours…</p>
            ) : (
              socketData && (
                <>
                  <button
                    onClick={() => {
                      socket.emit("stop_replay");
                    }}
                    type="button"
                    disabled={!running}
                    className={`${
                      running
                        ? "bg-blue-500 hover:bg-blue-700 text-white"
                        : "bg-gray-400 hover:bg-gray-400 text-gray-600"
                    } font-bold py-2 px-4 rounded`}
                  >
                    Stop
                  </button>
                  <ReplayProgress socketData={socketData} />
                </>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
};
