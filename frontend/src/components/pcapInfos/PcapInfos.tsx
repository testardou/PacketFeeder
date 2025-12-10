import React from "react";
import type { PcapInfoType } from "../../types/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

interface IPcapInfosProps {
  pcapInfos?: PcapInfoType;
}

export const PcapInfos = ({ pcapInfos }: IPcapInfosProps) => {
  return (
    <div>
      <div className="w-full flex flex-row gap-4 items-center mb-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Total packets</CardTitle>
          </CardHeader>
          <CardContent>
            <h3>{pcapInfos?.packet_count}</h3>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Total bytes</CardTitle>
          </CardHeader>
          <CardContent>
            <h3>{pcapInfos?.total_bytes}B</h3>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Total Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <h3>
              {dayjs((pcapInfos?.duration_seconds ?? 0) * 1000)
                .utc()
                .format("HH:mm:ss.SSS")}
            </h3>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Min Packet Size</CardTitle>
          </CardHeader>
          <CardContent>
            <h3>{pcapInfos?.min_packet_size}</h3>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Max Packet Size</CardTitle>
          </CardHeader>
          <CardContent>
            <h3>{pcapInfos?.max_packet_size}</h3>
          </CardContent>
        </Card>
      </div>
      <div className="w-full flex flex-row gap-4 items-center">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Sources IPs</CardTitle>
            <CardDescription>
              Total: {pcapInfos?.src_ips.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72  rounded-md border">
              <div className="p-4">
                {pcapInfos?.src_ips.map((srcIp) => (
                  <React.Fragment key={srcIp}>
                    <div className="text-sm">{srcIp}</div>
                    <Separator className="my-2" />
                  </React.Fragment>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Destinations IPs</CardTitle>
            <CardDescription>
              Total: {pcapInfos?.dst_ips.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72  rounded-md border">
              <div className="p-4">
                {pcapInfos?.dst_ips.map((dstIp) => (
                  <React.Fragment key={dstIp}>
                    <div className="text-sm">{dstIp}</div>
                    <Separator className="my-2" />
                  </React.Fragment>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>TCP Ports</CardTitle>
            <CardDescription>
              Total: {pcapInfos?.tcp_ports.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72  rounded-md border">
              <div className="p-4">
                {pcapInfos?.tcp_ports.map((tcpPort) => (
                  <React.Fragment key={tcpPort}>
                    <a
                      className="text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://isc.sans.edu/data/port/${tcpPort}`}
                    >
                      {tcpPort}
                    </a>
                    <Separator className="my-2" />
                  </React.Fragment>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>UDP Ports</CardTitle>
            <CardDescription>
              Total: {pcapInfos?.udp_ports.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72  rounded-md border">
              <div className="p-4">
                {pcapInfos?.udp_ports.map((udpPort) => (
                  <React.Fragment key={udpPort}>
                    <a
                      className="text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://isc.sans.edu/data/port/${udpPort}`}
                    >
                      {udpPort}
                    </a>
                    <Separator className="my-2" />
                  </React.Fragment>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
