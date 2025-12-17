import type { PcapInfoType } from "@/types/types";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import type { UseMutationResult } from "@tanstack/react-query";
import { PcapGeneralInfos } from "@/components/pcapGeneralInfos/PcapGeneralInfos";
import { PcapRewriteInfos } from "@/components/pcapRewriteInfos/PcapRewriteInfos";

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
          <PcapRewriteInfos
            pcapInfos={pcapInfos}
            rewriteIps={rewriteIps}
            rewriteMacs={rewriteMacs}
            setRewriteIps={setRewriteIps}
            setRewriteMacs={setRewriteMacs}
          />
        </div>
      )}
    </div>
  );
};
