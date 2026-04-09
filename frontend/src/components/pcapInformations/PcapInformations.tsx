import { PcapDetails } from "@/components/pcapDetails/PcapDetails";
import { PcapInfos } from "@/components/pcapInfos/PcapInfos";
import { PcapRewrite } from "@/components/pcapRewrite/PcapRewrite";
import type { PacketDetailsType, PcapInfoType } from "@/types/types";
import type { UseMutationResult } from "@tanstack/react-query";

interface IPcapInformationsProps {
  infosMutation?: UseMutationResult<PcapInfoType, Error, string, unknown>;
  detailsMutation?: UseMutationResult<
    PacketDetailsType[],
    Error,
    string,
    unknown
  >;
  selectedFile: string | null;
}

export const PcapInformations = ({
  infosMutation,
  detailsMutation,
  selectedFile,
}: IPcapInformationsProps) => {
  return (
    <>
      <h2 className="text-2xl">Informations</h2>
      <PcapInfos pcapInfos={infosMutation} />
      <PcapRewrite pcapInfos={infosMutation} />
      <PcapDetails
        selectedFile={selectedFile}
        detailsMutation={detailsMutation}
      />
    </>
  );
};
