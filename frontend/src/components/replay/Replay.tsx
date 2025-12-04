import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { io } from "socket.io-client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
const socket = io("http://localhost:5000/realtime", {
  autoConnect: true,
});

export const Replay = () => {
  const [file, setFile] = useState(null);
  const [clientSid, setClientSid] = useState(null);
  const [socketData, setSocketData] = useState<{
    progress: 0;
    index: 0;
    timestamp: 0;
    size: 0;
    remaining_time: 0;
    next_packet: 0;
  } | null>(null);
  const [selected, setSelected] = useState("realTime");

  useEffect(() => {
    console.log("Initialisation listeners...");

    const connected = () => console.log("WS connecté !");
    const hello = (data) => console.log("HELLO:", data);
    const replayProgress = (data) => {
      console.log("Progress:", data);
      console.log("PERCEN", Math.floor(socketData?.progress ?? 0));

      setSocketData(data);
    };

    socket.on("connect", connected);
    socket.on("hello", hello);
    socket.on("sid", ({ sid }) => {
      console.log("My SID:", sid);
      setClientSid(sid);
    });
    socket.on("replay_progress", replayProgress);

    return () => {
      socket.off("connect", connected);
      socket.off("hello", hello);
      socket.off("replay_progress", replayProgress);
    };
  }, []);

  window.addEventListener("beforeunload", () => {
    socket.emit("stop_replay");
  });

  const {
    data: ifaces_list,
    error,
    isLoading,
  } = useQuery({
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
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/api/infos-pcap/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur API");
      return res.json();
    },
  });

  const runMutation = useMutation({
    mutationFn: async (file) => {
      const urls: Record<string, string> = {
        realTime: "replay_realtime",
        fast: "replay_faster",
        fastest: "replay_fastest",
      };

      const formData = new FormData();
      formData.append("file", file);
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

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2>Interfaces :</h2>
        <select
          id="interfaces"
          value={selectedInterface}
          onChange={(e) => setSelectectedInterface(e.target.value)}
          name="interfaces"
          className="mt-2 block"
        >
          {ifaces_list?.interfaces?.map((iface: string) => (
            <option key={iface} value={iface}>
              {iface}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-row gap-1">
        <input
          className="border rounded p-1"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0])}
        />

        <button
          onClick={() => uploadMutation.mutate(file)}
          type="button"
          className={`${
            file
              ? "bg-blue-500 hover:bg-blue-700 text-white"
              : "bg-gray-400 hover:bg-gray-400 text-gray-600"
          } font-bold py-2 px-4 rounded`}
          disabled={!file}
        >
          Envoyer le PCAP
        </button>
      </div>

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
        <div className="flex flex-col gap-3">
          <div className="border p-4 border-black rounded flex gap-10 flex-nowrap text-gray-800">
            <div>
              <p className="font-bold">Total packets : </p>
              <p>{uploadMutation.data.packet_count}</p>
            </div>
            <div>
              <p className="font-bold">Total bytes : </p>
              <p>{uploadMutation.data.total_bytes}</p>
            </div>
            <div>
              <p className="font-bold">Duration in seconds : </p>
              <p>{uploadMutation.data.duration_seconds}</p>
            </div>
            <div>
              <p className="font-bold">Min packet sizes : </p>
              <p>{uploadMutation.data.min_packet_size}</p>
            </div>
            <div>
              <p className="font-bold">Max packet sizes : </p>
              <p>{uploadMutation.data.max_packet_size}</p>
            </div>
          </div>
          <div className="border p-4 justify-center w-full border-black rounded flex gap-10 flex-nowrap text-gray-800">
            <div>
              <p className="font-bold mb-1">Sources IP : </p>
              <ul className="overflow-y-scroll h-32 bg-white border-2 rounded p-3">
                {uploadMutation.data.src_ips.map((srcIp: string) => (
                  <li>{srcIp}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-bold mb-1">Destinations IP : </p>
              <ul className="overflow-y-scroll h-32 bg-white border-2 rounded p-3">
                {uploadMutation.data.dst_ips.map((dstIp: string) => (
                  <li>{dstIp}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-bold mb-1">TCP Ports : </p>
              <ul className="overflow-y-scroll h-32 bg-white border-2 rounded p-3">
                {uploadMutation.data.tcp_ports.map((tcpPort: string) => (
                  <li>{tcpPort}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-bold mb-1">UDP Ports : </p>
              <ul className="overflow-y-scroll h-32 bg-white border-2 rounded p-3">
                {uploadMutation.data.udp_ports.map((udpPort: string) => (
                  <li>{udpPort}</li>
                ))}
              </ul>
            </div>
          </div>
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
          <button
            onClick={() => runMutation.mutate(file)}
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Replay
          </button>
          {runMutation.isPending ? (
            <p className="text-gray-500">Analyse en cours…</p>
          ) : (
            socketData && (
              <>
                <button
                  onClick={() => socket.emit("stop_replay")}
                  type="button"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Stop
                </button>
                <div>
                  <p>Percent: {Number(socketData?.progress.toFixed(2))} %</p>
                  <p>Packet Index: {socketData?.index}</p>
                  <p>
                    Timestamp:
                    {dayjs
                      .unix(socketData?.timestamp ?? 0)
                      .format("HH:mm:ss.SSS")}
                  </p>
                  <p>
                    Size:
                    {socketData?.size} bytes
                  </p>
                  <p>
                    Remaining Time:
                    {dayjs((socketData?.remaining_time ?? 0) * 1000)
                      .utc()
                      .format("HH:mm:ss.SSS")}
                  </p>
                  <p>
                    Next Packet In:
                    {dayjs((socketData?.next_packet ?? 0) * 1000)
                      .utc()
                      .format("HH:mm:ss.SSS")}
                  </p>
                </div>
                <p>
                  <progress
                    value={Math.floor(socketData?.progress ?? 0) / 100}
                  />
                </p>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
};
