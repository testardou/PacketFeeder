import React from "react";
import type { PcapInfoType } from "@/types/types";
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

import { ScrollAreaModify } from "../scrollAreaModify/ScrollAreaModify";
import type { UseMutationResult } from "@tanstack/react-query";

dayjs.extend(utc);

interface IPcapInfosProps {
  pcapInfos?: UseMutationResult<PcapInfoType, Error, string, unknown>;
  rewriteIps: { old: string; new: string }[];
  setRewriteIps: (rewriteIps: { old: string; new: string }[]) => void;
  rewriteMacs: { old: string; new: string }[];
  setRewriteMacs: (rewriteIps: { old: string; new: string }[]) => void;
}

export const PcapInfos = ({
  pcapInfos,
  rewriteIps,
  setRewriteIps,
  rewriteMacs,
  setRewriteMacs,
}: IPcapInfosProps) => {
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const macAddrRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  const pcapInfosData = pcapInfos?.data;
  return (
    <div>
      <div className="w-full flex flex-row gap-4 items-center mb-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Total packets</CardTitle>
          </CardHeader>
          <CardContent>
            <h3>{pcapInfosData?.packet_count}</h3>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Total bytes</CardTitle>
          </CardHeader>
          <CardContent>
            <h3>{pcapInfosData?.total_bytes}B</h3>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Total Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <h3>
              {dayjs((pcapInfosData?.duration_seconds ?? 0) * 1000)
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
            <h3>{pcapInfosData?.min_packet_size}</h3>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Max Packet Size</CardTitle>
          </CardHeader>
          <CardContent>
            <h3>{pcapInfosData?.max_packet_size}</h3>
          </CardContent>
        </Card>
      </div>
      <div className="w-full flex flex-row gap-4 items-center">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>IPs</CardTitle>
            <CardDescription>
              Total: {pcapInfosData?.ips.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollAreaModify
              valuesArray={pcapInfosData?.ips ?? []}
              setNewValues={setRewriteIps}
              newValues={rewriteIps}
              validator={ipv4Regex}
              modalLabel="New IP"
              modalTitle="Edit IP"
              modalDescription="Modify or rewrite this IP."
              errorMessage="The new IP is not valid"
            />
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>MACs</CardTitle>
            <CardDescription>
              Total: {pcapInfosData?.macs.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollAreaModify
              valuesArray={pcapInfosData?.macs ?? []}
              setNewValues={setRewriteMacs}
              newValues={rewriteMacs}
              validator={macAddrRegex}
              modalLabel="New MAC adress"
              modalTitle="Edit MAC address"
              modalDescription="Modify or rewrite this MAC address."
              errorMessage="The new MAC address is not valid"
            />
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>TCP Ports</CardTitle>
            <CardDescription>
              Total: {pcapInfosData?.tcp_ports.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72  rounded-md border">
              <div className="p-4">
                {pcapInfosData?.tcp_ports.map((tcpPort) => (
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
              Total: {pcapInfosData?.udp_ports.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72  rounded-md border">
              <div className="p-4">
                {pcapInfosData?.udp_ports.map((udpPort) => (
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
