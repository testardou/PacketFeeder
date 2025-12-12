import React from "react";
import type { PcapInfoType } from "@/types/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

dayjs.extend(utc);

interface IPcapInfosProps {
  pcapInfos?: PcapInfoType;
  rewriteIps: { old: string; new: string }[];
  setRewriteIps: (rewriteIps: { old: string; new: string }[]) => void;
}

export const PcapInfos = ({
  pcapInfos,
  rewriteIps,
  setRewriteIps,
}: IPcapInfosProps) => {
  const [newIp, setNewIp] = React.useState<string>("");
  const ipv4Regex =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  const isValidIPv4 = ipv4Regex.test(newIp);

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
            <CardTitle>IPs</CardTitle>
            <CardDescription>Total: {pcapInfos?.ips.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72  rounded-md border">
              <div className="p-4">
                {pcapInfos?.ips
                  .filter(
                    (srcIp) =>
                      rewriteIps?.find((element) => element.old === srcIp) ===
                      undefined
                  )
                  .map((srcIp) => (
                    <React.Fragment key={srcIp}>
                      <Dialog onOpenChange={() => setNewIp(srcIp)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost">{srcIp}</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit IP</DialogTitle>
                            <DialogDescription>
                              Modify or rewrite this IP.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor={`new-ip-${srcIp}`}>New IP</Label>
                              <Input
                                id={`new-ip-${srcIp}`}
                                defaultValue={srcIp}
                                onChange={(e) => setNewIp(e.target.value)}
                              />
                            </div>
                          </div>
                          {!isValidIPv4 && (
                            <p className="text-red-600">
                              The new IP is not valid
                            </p>
                          )}

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button
                                variant="outline"
                                onClick={() => setNewIp("")}
                              >
                                Cancel
                              </Button>
                            </DialogClose>
                            <Button
                              disabled={!isValidIPv4 || newIp === srcIp}
                              onClick={() => {
                                setRewriteIps([
                                  ...rewriteIps,
                                  { old: srcIp, new: newIp },
                                ]);
                                setNewIp("");
                              }}
                            >
                              Save
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Separator className="my-2" />
                    </React.Fragment>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>MACs</CardTitle>
            <CardDescription>Total: {pcapInfos?.macs.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72  rounded-md border">
              <div className="p-4">
                {pcapInfos?.macs.map((mac) => (
                  <React.Fragment key={mac}>
                    <div className="text-sm">{mac}</div>
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
