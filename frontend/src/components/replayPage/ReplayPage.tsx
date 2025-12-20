import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";

import type {
  InterfacesType,
  NewValuesPcapType,
  PacketDetailsType,
  PcapFilesType,
  PcapInfoType,
  ReplayProgressType,
  RunStatusType,
} from "@/types/types";
import { ReplayModes } from "@/components/replayModes/ReplayModes";
import { ReplayProgress } from "@/components/replayProgress/ReplayProgress";
import { SelectInterface } from "@/components/selectInterface/SelectInterface";
import { ModifiedPcapRecap } from "../modifiedPcapRecap/ModifiedPcapRecap";
import { HandleFiles } from "@/components/handleFiles/HandleFiles";
import { PacketDetails } from "@/components/packetDetails/PacketDetails";

const socket = io("http://localhost:5000/realtime", {
  autoConnect: true,
});

export const ReplayPage = () => {
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [selectFile, setSelectFile] = useState<string | null>(null);
  const [clientSid, setClientSid] = useState(null);
  const [socketData, setSocketData] = useState<ReplayProgressType | null>(null);
  const [selected, setSelected] = useState("realTime");
  const [running, setRunning] = useState(false);
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    null
  );
  const [rewriteIps, setRewriteIps] = useState<NewValuesPcapType[]>([]);
  const [rewriteMacs, setRewriteMacs] = useState<NewValuesPcapType[]>([]);

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

  const resetStates = () => {
    setRewriteIps([]);
    setRewriteMacs([]);
  };

  const { data: ifaces_list, isLoading } = useQuery<InterfacesType>({
    queryKey: ["interfaces"], // identifiant unique du cache
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/get_interfaces/");

      if (!res.ok) {
        throw new Error("Erreur API");
      }
      return res.json();
    },
  });

  const { data: pcapFiles, isLoading: pcaFilesloading } =
    useQuery<PcapFilesType>({
      queryKey: ["pcap_files"], // identifiant unique du cache
      queryFn: async () => {
        const res = await fetch("http://localhost:5000/api/get-pcap-files/");

        if (!res.ok) {
          throw new Error("Erreur API");
        }

        return res.json();
      },
    });

  const uploadMutation = useMutation({
    mutationFn: async (file: File | null) => {
      const formData = new FormData();
      formData.append("file", file ?? "");

      const res = await fetch("http://localhost:5000/api/upload-pcap-file/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur API");
      setFile(null);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pcap_files"] });
      resetStates();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (file: string) => {
      const formData = new FormData();
      formData.append("file", file ?? "");

      const res = await fetch("http://localhost:5000/api/delete-pcap-file/", {
        method: "DELETE",
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur API");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pcap_files"] });
    },
  });

  const infosMutation = useMutation<PcapInfoType, Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(
        `http://localhost:5000/api/infos-pcap?file=${file}`
      );

      if (!res.ok) throw new Error("Erreur API");

      return res.json();
    },
    onSuccess: () => {
      resetStates();
    },
  });

  const runMutation = useMutation({
    mutationFn: async (file: string) => {
      const urls: Record<string, string> = {
        realTime: "replay_realtime",
        fast: "replay_faster",
        fastest: "replay_fastest",
      };

      const formData = new FormData();
      formData.append("file", file ?? "");
      formData.append("iface", selectedInterface ?? "");
      formData.append("sid", clientSid ?? "");
      formData.append("rewriteIps", JSON.stringify(rewriteIps));
      formData.append("rewriteMacs", JSON.stringify(rewriteMacs));

      const res = await fetch(`http://localhost:5000/api/${urls[selected]}/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur API");

      return res.json();
    },
  });

  const detailsMutation = useMutation<PacketDetailsType[], Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(
        `http://localhost:5000/api/detail-packets-pcap?file=${file}`
      );

      if (!res.ok) throw new Error("Erreur API");

      return res.json();
    },
    onSuccess: () => {
      resetStates();
    },
  });

  if (isLoading) {
    return <p>Loading interfaces...</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-4xl mx-auto w-fit font-bold">Replay</h1>
      <HandleFiles
        detailsMutation={detailsMutation}
        deleteMutation={deleteMutation}
        file={file}
        infosMutation={infosMutation}
        selectFile={selectFile}
        setFile={setFile}
        setSelectFile={setSelectFile}
        uploadMutation={uploadMutation}
        pcapFiles={pcapFiles?.files}
        pcaFilesloading={pcaFilesloading}
        rewriteIps={rewriteIps}
        setRewriteIps={setRewriteIps}
        rewriteMacs={rewriteMacs}
        setRewriteMacs={setRewriteMacs}
      />
      <div className="flex flex-col gap-5">
        <h2 className="text-2xl">Configuration</h2>
        <div className="flex flex-row gap-4">
          {rewriteIps.length > 0 && (
            <ModifiedPcapRecap
              cardTitle="Replaced Ips"
              setRewriteValues={setRewriteIps}
              rewriteValues={rewriteIps}
            />
          )}
          {rewriteMacs.length > 0 && (
            <ModifiedPcapRecap
              cardTitle="Replaced MACs addresses"
              setRewriteValues={setRewriteMacs}
              rewriteValues={rewriteMacs}
            />
          )}
        </div>
        <PacketDetails
          selectedFile={selectFile}
          detailsMutation={detailsMutation}
        />
        <div className="flex flex-row gap-20">
          <SelectInterface
            selectedInterface={selectedInterface}
            setSelectedInterface={setSelectedInterface}
            ifaces={ifaces_list?.interfaces}
          />
          <ReplayModes selected={selected} setSelected={setSelected} />
        </div>
        <div className="flex flex-row gap-10 w-full items-center">
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
              variant="outline"
              disabled={!running}
              color="blue"
              onClick={() => socket.emit("stop_replay")}
              className="bg-red-500 text-amber-50 hover:bg-red-600 hover:text-amber-100"
            >
              Stop
            </Button>
          </div>
          <div className="w-full">
            {runMutation.isPending ? (
              <p className="text-gray-500">Analyse en cours…</p>
            ) : (
              socketData && (
                <>
                  <ReplayProgress socketData={socketData} mode={selected} />
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
