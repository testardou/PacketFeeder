import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

export const Replay = () => {
  const [file, setFile] = useState(null);

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/api/infos-pcap/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur API");
      return res.json();
    },
  });

  return (
    <div className="p-6 space-y-4">
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
        <p className="text-red-600">Erreur lors du chargement</p>
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
          <button
            onClick={() => uploadMutation.mutate(file)}
            type="button"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Replay
          </button>
        </div>
      )}
    </div>
  );
};
