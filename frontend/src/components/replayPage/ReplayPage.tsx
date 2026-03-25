import { useReducer, useState } from "react";
import { initialRewriteState, rewriteReducer } from "@/hooks/useRewriteReducer";
import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  InterfacesType,
  PacketDetailsType,
  ReplayModeType,
  RewriteValues,
} from "@/types/types";
import { ReplayModes } from "@/components/replayModes/ReplayModes";
import { SelectInterface } from "@/components/selectInterface/SelectInterface";
import { HandleFiles } from "@/components/handleFiles/HandleFiles";
import { PacketDetails } from "@/components/packetDetails/PacketDetails";
import { RunReplay } from "@/components/runReplay/RunReplay";
import { ReplayFilter } from "@/components/replayFilter/ReplayFilter";
import { API_CONFIG } from "@/config/api";

export const ReplayPage = () => {
  const [selectFile, setSelectFile] = useState<string | null>(null);

  const [selectedMode, setSelectedMode] = useState<ReplayModeType>("realTime");
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    null,
  );

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [filterIndex, setFilterIndex] = useState<number | null>(null);
  const [filterRange, setFilterRange] = useState<string>("");

  const [rewriteState, dispatchRewrite] = useReducer(
    rewriteReducer,
    initialRewriteState,
  );

  const rewriteValues: RewriteValues = {
    rewriteIps: rewriteState.rewriteIps,
    setRewriteIps: (ips) =>
      dispatchRewrite({ type: "SET_REWRITE_IPS", payload: ips }),
    rewriteMacs: rewriteState.rewriteMacs,
    setRewriteMacs: (macs) =>
      dispatchRewrite({ type: "SET_REWRITE_MACS", payload: macs }),
    rewriteIpv6s: rewriteState.rewriteIpv6s,
    setRewriteIpv6s: (ipv6s) =>
      dispatchRewrite({ type: "SET_REWRITE_IPV6S", payload: ipv6s }),
    rewriteArpIps: rewriteState.rewriteArpIps,
    setRewriteArpIps: (arpIps) =>
      dispatchRewrite({ type: "SET_REWRITE_ARP_IPS", payload: arpIps }),
    rewriteDnsDomains: rewriteState.rewriteDnsDomains,
    setRewriteDnsDomains: (dnsDomains) =>
      dispatchRewrite({ type: "SET_REWRITE_DNS_DOMAINS", payload: dnsDomains }),
    rewriteTcpPorts: rewriteState.rewriteTcpPorts,
    setRewriteTcpPorts: (tcpPorts) =>
      dispatchRewrite({ type: "SET_REWRITE_TCP_PORTS", payload: tcpPorts }),
    rewriteUdpPorts: rewriteState.rewriteUdpPorts,
    setRewriteUdpPorts: (udpPorts) =>
      dispatchRewrite({ type: "SET_REWRITE_UDP_PORTS", payload: udpPorts }),
  };

  const resetStates = () => {
    dispatchRewrite({ type: "RESET" });
    setStepIndex(0);
    setFilterIndex(null);
    setFilterRange("");
  };

  const { data: ifaces_list, isLoading } = useQuery<InterfacesType>({
    queryKey: ["interfaces"], // identifiant unique du cache
    queryFn: async () => {
      const res = await fetch(`${API_CONFIG.API_BASE}/get_interfaces/`);

      if (!res.ok) {
        throw new Error("Erreur API");
      }
      return res.json();
    },
  });

  const detailsMutation = useMutation<PacketDetailsType[], Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(
        `${API_CONFIG.API_BASE}/detail-packets-pcap?file=${file}`,
      );

      if (!res.ok) throw new Error("Erreur API");

      return res.json();
    },
    onSuccess: () => {
      resetStates();
    },
  });

  const handleSetSelectFile = (fileName: string | null) => {
    // Reset all states when file selection changes
    if (fileName !== selectFile) {
      resetStates();
      detailsMutation.reset();
    }
    setSelectFile(fileName);
  };

  if (isLoading) {
    return <p>Loading interfaces...</p>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-4xl mx-auto w-fit font-bold">Replay</h1>
      <HandleFiles
        resetStates={resetStates}
        detailsMutation={detailsMutation}
        selectFile={selectFile}
        setSelectFile={handleSetSelectFile}
        rewriteValues={rewriteValues}
      />
      <div className="flex flex-col gap-5">
        <h2 className="text-2xl">Configuration</h2>

        <PacketDetails
          selectedFile={selectFile}
          data={detailsMutation?.data}
          isPending={detailsMutation.isPending}
        />
        <div className="flex flex-row gap-20">
          <SelectInterface
            selectedInterface={selectedInterface}
            setSelectedInterface={setSelectedInterface}
            ifaces={ifaces_list?.interfaces}
          />
          <ReplayModes selected={selectedMode} setSelected={setSelectedMode} />
        </div>
        <ReplayFilter
          filterIndex={filterIndex}
          setFilterIndex={setFilterIndex}
          filterRange={filterRange}
          setFilterRange={setFilterRange}
        />
        <RunReplay
          selectedInterface={selectedInterface}
          rewrites={rewriteValues}
          stepIndex={stepIndex}
          setStepIndex={setStepIndex}
          selectedMode={selectedMode}
          selectFile={selectFile}
          filterIndex={filterIndex}
          filterRange={filterRange}
        />
      </div>
    </div>
  );
};
