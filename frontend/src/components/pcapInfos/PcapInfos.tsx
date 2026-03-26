import type { PcapInfoType } from "@/types/types";
import type { UseMutationResult } from "@tanstack/react-query";
import { PcapGeneralInfos } from "@/components/pcapGeneralInfos/PcapGeneralInfos";
import { PcapProtocolsScrollArea } from "@/components/pcapProtocolsScrollArea/PcapProtocolsScrollArea";

interface IPcapInfosProps {
  pcapInfos?: UseMutationResult<PcapInfoType, Error, string, unknown>;
}

export const PcapInfos = ({ pcapInfos }: IPcapInfosProps) => {
  const data: PcapInfoType | undefined = pcapInfos?.data;

  return (
    <div className="flex flex-col gap-6 flex-1">
      {pcapInfos?.isPending && (
        <div className="align-middle mx-auto w-full h-full flex justify-center items-center">
          <p className="text-2xl">Pcap Infos Loading...</p>
        </div>
      )}
      {pcapInfos?.isSuccess && data && (
        <div>
          <h2 className="text-2xl">Pcap Infos</h2>
          <PcapGeneralInfos pcapInfosData={data} />
          <PcapProtocolsScrollArea pcapInfosData={data} />
        </div>
      )}
    </div>
  );
};
