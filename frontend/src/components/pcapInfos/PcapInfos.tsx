import type { PcapInfoType, RewriteValues } from "@/types/types";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import type { UseMutationResult } from "@tanstack/react-query";
import { PcapGeneralInfos } from "@/components/pcapGeneralInfos/PcapGeneralInfos";
// import { PcapRewriteInfos } from "@/components/pcapRewriteInfos/PcapRewriteInfos";
import { PcapProtocolsScrollArea } from "@/components/pcapProtocolsScrollArea/PcapProtocolsScrollArea";

dayjs.extend(utc);

interface IPcapInfosProps {
  pcapInfos?: UseMutationResult<PcapInfoType, Error, string, unknown>;
  rewriteValues: RewriteValues;
}

export const PcapInfos = ({ pcapInfos, rewriteValues }: IPcapInfosProps) => {
  return (
    <div className="flex flex-col gap-6 flex-1">
      {pcapInfos?.isPending && (
        <div className="align-middle mx-auto w-full h-full flex justify-center items-center">
          <p className="text-2xl">Pcap Infos Loading...</p>
        </div>
      )}
      {pcapInfos?.isSuccess && (
        <div>
          <h2 className="text-2xl">Pcap Infos</h2>
          <PcapGeneralInfos pcapInfos={pcapInfos} />
          <PcapProtocolsScrollArea
            pcapInfos={pcapInfos}
            rewriteValues={rewriteValues}
          />
          {/* <PcapRewriteInfos
            pcapInfos={pcapInfos}
            rewriteIps={rewriteIps}
            rewriteMacs={rewriteMacs}
            setRewriteIps={setRewriteIps}
            setRewriteMacs={setRewriteMacs}
          /> */}
        </div>
      )}
    </div>
  );
};
