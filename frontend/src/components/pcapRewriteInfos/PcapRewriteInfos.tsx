import { ScrollAreaModify } from "@/components/scrollAreaModify/ScrollAreaModify";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { PcapInfoType } from "@/types/types";
import type { UseMutationResult } from "@tanstack/react-query";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import React from "react";

dayjs.extend(utc);

interface IPcapRewriteInfosProps {
  pcapInfos?: UseMutationResult<PcapInfoType, Error, string, unknown>;
  rewriteIps: { old: string; new: string }[];
  setRewriteIps: (rewriteIps: { old: string; new: string }[]) => void;
  rewriteMacs: { old: string; new: string }[];
  setRewriteMacs: (rewriteIps: { old: string; new: string }[]) => void;
}

export const PcapRewriteInfos = ({
  pcapInfos,
  setRewriteIps,
  rewriteIps,
  setRewriteMacs,
  rewriteMacs,
}: IPcapRewriteInfosProps) => {
  const pcapInfosData = pcapInfos?.data;
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const macAddrRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

  return (
    <div className="w-full flex flex-row gap-4 items-center">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>IPs</CardTitle>
          <CardDescription>Total: {pcapInfosData?.ips.length}</CardDescription>
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
          <CardDescription>Total: {pcapInfosData?.macs.length}</CardDescription>
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
  );
};
