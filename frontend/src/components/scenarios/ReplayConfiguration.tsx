import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  InterfacesType,
  NewValuesPcapType,
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

interface ReplayConfigurationProps {
  selectFile: string;
}

export function ReplayConfiguration({ selectFile }: ReplayConfigurationProps) {
  const [selectedMode, setSelectedMode] = useState<ReplayModeType>("realTime");
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    null
  );
  const [rewriteIps, setRewriteIps] = useState<NewValuesPcapType[]>([]);
  const [rewriteMacs, setRewriteMacs] = useState<NewValuesPcapType[]>([]);
  const [rewriteIpv6s, setRewriteIpv6s] = useState<NewValuesPcapType[]>([]);
  const [rewriteArpIps, setRewriteArpIps] = useState<NewValuesPcapType[]>([]);
  const [rewriteDnsDomains, setRewriteDnsDomains] = useState<
    NewValuesPcapType[]
  >([]);
  const [rewriteTcpPorts, setRewriteTcpPorts] = useState<NewValuesPcapType[]>(
    []
  );
  const [rewriteUdpPorts, setRewriteUdpPorts] = useState<NewValuesPcapType[]>(
    []
  );
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [filterIndex, setFilterIndex] = useState<number | null>(null);
  const [filterRange, setFilterRange] = useState<string>("");

  const rewriteValues: RewriteValues = {
    rewriteIps,
    setRewriteIps,
    rewriteMacs,
    setRewriteMacs,
    rewriteIpv6s,
    setRewriteIpv6s,
    rewriteArpIps,
    setRewriteArpIps,
    rewriteDnsDomains,
    setRewriteDnsDomains,
    rewriteTcpPorts,
    setRewriteTcpPorts,
    rewriteUdpPorts,
    setRewriteUdpPorts,
  };

  const resetStates = () => {
    setRewriteIps([]);
    setRewriteMacs([]);
    setRewriteIpv6s([]);
    setRewriteArpIps([]);
    setRewriteDnsDomains([]);
    setRewriteTcpPorts([]);
    setRewriteUdpPorts([]);
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
        `${API_CONFIG.API_BASE}/detail-packets-pcap?file=${file}`
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
        rewriteIps={rewriteIps}
        rewriteMacs={rewriteMacs}
        rewriteIpv6s={rewriteIpv6s}
        rewriteArpIps={rewriteArpIps}
        rewriteDnsDomains={rewriteDnsDomains}
        rewriteTcpPorts={rewriteTcpPorts}
        rewriteUdpPorts={rewriteUdpPorts}
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
