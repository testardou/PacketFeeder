import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import type {
  InterfacesType,
  NewValuesPcapType,
  PacketDetailsType,
  ReplayModeType,
} from "@/types/types";
import { ReplayModes } from "@/components/replayModes/ReplayModes";
import { SelectInterface } from "@/components/selectInterface/SelectInterface";
import { ModifiedPcapRecap } from "../modifiedPcapRecap/ModifiedPcapRecap";
import { HandleFiles } from "@/components/handleFiles/HandleFiles";
import { PacketDetails } from "@/components/packetDetails/PacketDetails";
import { RunReplay } from "@/components/runReplay/RunReplay";

export const ReplayPage = () => {
  const [selectFile, setSelectFile] = useState<string | null>(null);

  const [selectedMode, setSelectedMode] = useState<ReplayModeType>("realTime");
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    null
  );
  const [rewriteIps, setRewriteIps] = useState<NewValuesPcapType[]>([]);
  const [rewriteMacs, setRewriteMacs] = useState<NewValuesPcapType[]>([]);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const resetStates = () => {
    setRewriteIps([]);
    setRewriteMacs([]);
    setStepIndex(0);
  };

  const { data: ifaces_list, isLoading } = useQuery<InterfacesType>({
    queryKey: ["interfaces"], // identifiant unique du cache
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/get_interfaces/");

      if (!res.ok) {
        throw new Error("Erreur API");
      }
      return res.json();
    },
  });

  const detailsMutation = useMutation<PacketDetailsType[], Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(
        `http://localhost:5000/api/detail-packets-pcap?file=${file}`
      );

      if (!res.ok) throw new Error("Erreur API");

      return res.json();
    },
    onSuccess: () => {
      resetStates();
    },
  });

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
        setSelectFile={setSelectFile}
        rewriteIps={rewriteIps}
        setRewriteIps={setRewriteIps}
        rewriteMacs={rewriteMacs}
        setRewriteMacs={setRewriteMacs}
      />
      <div className="flex flex-col gap-5">
        <h2 className="text-2xl">Configuration</h2>
        <div className="flex flex-row gap-4">
          <ModifiedPcapRecap
            cardTitle="Replaced Ips"
            setRewriteValues={setRewriteIps}
            rewriteValues={rewriteIps}
          />
          <ModifiedPcapRecap
            cardTitle="Replaced MACs addresses"
            setRewriteValues={setRewriteMacs}
            rewriteValues={rewriteMacs}
          />
        </div>
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
        <RunReplay
          selectedInterface={selectedInterface}
          rewriteIps={rewriteIps}
          rewriteMacs={rewriteMacs}
          stepIndex={stepIndex}
          setStepIndex={setStepIndex}
          selectedMode={selectedMode}
          selectFile={selectFile}
        />
      </div>
    </div>
  );
};
