import type { PcapInfoType } from "../../types/types";

interface IPcapInfosProps {
  pcapInfos?: PcapInfoType;
}

export const PcapInfos = ({ pcapInfos }: IPcapInfosProps) => {
  return (
    <div>
      <div className="flex flex-col gap-3">
        <div className="border p-4 border-black rounded flex gap-10 flex-nowrap text-gray-800">
          <div>
            <p className="font-bold">Total packets : </p>
            <p>{pcapInfos?.packet_count}</p>
          </div>
          <div>
            <p className="font-bold">Total bytes : </p>
            <p>{pcapInfos?.total_bytes}</p>
          </div>
          <div>
            <p className="font-bold">Duration in seconds : </p>
            <p>{pcapInfos?.duration_seconds}</p>
          </div>
          <div>
            <p className="font-bold">Min packet sizes : </p>
            <p>{pcapInfos?.min_packet_size}</p>
          </div>
          <div>
            <p className="font-bold">Max packet sizes : </p>
            <p>{pcapInfos?.max_packet_size}</p>
          </div>
        </div>
        <div className="border p-4 justify-center w-full border-black rounded flex gap-10 flex-nowrap text-gray-800">
          <div>
            <p className="font-bold mb-1">Sources IP : </p>
            <ul className="overflow-y-scroll h-32 bg-white border-2 rounded p-3">
              {pcapInfos?.src_ips.map((srcIp: string) => (
                <li>{srcIp}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold mb-1">Destinations IP : </p>
            <ul className="overflow-y-scroll h-32 bg-white border-2 rounded p-3">
              {pcapInfos?.dst_ips.map((dstIp: string) => (
                <li>{dstIp}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold mb-1">TCP Ports : </p>
            <ul className="overflow-y-scroll h-32 bg-white border-2 rounded p-3">
              {pcapInfos?.tcp_ports.map((tcpPort: number) => (
                <li>{tcpPort}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold mb-1">UDP Ports : </p>
            <ul className="overflow-y-scroll h-32 bg-white border-2 rounded p-3">
              {pcapInfos?.udp_ports.map((udpPort: number) => (
                <li>{udpPort}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
