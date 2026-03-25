import { useState, useEffect, useReducer } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  InterfacesType,
  PacketDetailsType,
  PcapInfoType,
  ReplayModeType,
  RewriteValues,
} from "@/types/types";
import { PcapInfos } from "@/components/pcapInfos/PcapInfos";
import { PacketDetails } from "@/components/packetDetails/PacketDetails";
import { SelectInterface } from "@/components/selectInterface/SelectInterface";
import { ReplayModes } from "@/components/replayModes/ReplayModes";
import { ReplayFilter } from "@/components/replayFilter/ReplayFilter";
import { RunReplay } from "@/components/runReplay/RunReplay";
import { API_CONFIG } from "@/config/api";
import { initialRewriteState, rewriteReducer } from "@/hooks/useRewriteReducer";

interface ReplayConfigurationProps {
  selectFile: string;
}

export function ReplayConfiguration({ selectFile }: ReplayConfigurationProps) {
  const [selectedMode, setSelectedMode] = useState<ReplayModeType>("realTime");
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    null,
  );

  const [rewriteState, dispatchRewrite] = useReducer(
    rewriteReducer,
    initialRewriteState,
  );

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [filterIndex, setFilterIndex] = useState<number | null>(null);
  const [filterRange, setFilterRange] = useState<string>("");

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

  const { data: ifaces_list, isLoading: interfacesLoading } =
    useQuery<InterfacesType>({
      queryKey: ["interfaces"],
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

  const infosMutation = useMutation<PcapInfoType, Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(`${API_CONFIG.API_BASE}/infos-pcap?file=${file}`);
      if (!res.ok) throw new Error("API Error");
      return res.json();
    },
    onSuccess: () => {
      resetStates();
    },
  });

  // Load details and infos when file changes
  useEffect(() => {
    if (selectFile) {
      resetStates();
      detailsMutation.reset();
      infosMutation.reset();
      detailsMutation.mutate(selectFile);
      infosMutation.mutate(selectFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectFile]);

  if (interfacesLoading) {
    return <p>Loading interfaces...</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl">Configuration</h2>

      <PcapInfos pcapInfos={infosMutation} rewriteValues={rewriteValues} />

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
  );
}
