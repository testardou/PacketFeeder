import { PcapFileList } from "@/components/pcapFileList/PcapFileList";
import { PcapInfos } from "@/components/pcapInfos/PcapInfos";
import { UploadPcapFile } from "@/components/uploadPcapFile/UploadPcapFile";
import type {
  NewValuesPcapType,
  PacketDetailsType,
  PcapFilesType,
  PcapInfoType,
} from "@/types/types";
import {
  useMutation,
  useQuery,
  type UseMutationResult,
} from "@tanstack/react-query";

interface IHandleFilesProps {
  selectFile: string | null;
  setSelectFile: (fileName: string) => void;
  files?: string[];
  detailsMutation: UseMutationResult<
    PacketDetailsType[],
    Error,
    string,
    unknown
  >;
  rewriteIps: NewValuesPcapType[];
  setRewriteIps: (value: NewValuesPcapType[]) => void;
  rewriteMacs: NewValuesPcapType[];
  setRewriteMacs: (value: NewValuesPcapType[]) => void;
  resetStates: () => void;
}

export const HandleFiles = ({
  selectFile,
  setSelectFile,
  rewriteIps,
  setRewriteIps,
  rewriteMacs,
  setRewriteMacs,
  detailsMutation,
  resetStates,
}: IHandleFilesProps) => {
  const pcapFilesMutation = useQuery<PcapFilesType>({
    queryKey: ["pcap_files"], // identifiant unique du cache
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/get-pcap-files/");

      if (!res.ok) {
        throw new Error("Erreur API");
      }

      return res.json();
    },
  });

  const infosMutation = useMutation<PcapInfoType, Error, string>({
    mutationFn: async (file: string) => {
      const res = await fetch(
        `http://localhost:5000/api/infos-pcap?file=${file}`
      );

      if (!res.ok) throw new Error("Erreur API");

      return res.json();
    },
    onSuccess: () => {
      resetStates();
    },
  });

  return (
    <div className="flex flex-row gap-10">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl">Pcap Files</h2>
        <UploadPcapFile
          files={pcapFilesMutation.data?.files}
          pcaFilesloading={pcapFilesMutation.isLoading}
          resetStates={resetStates}
        />
        <PcapFileList
          detailsMutation={detailsMutation}
          pcapFiles={pcapFilesMutation.data?.files}
          selectFile={selectFile}
          setSelectFile={setSelectFile}
          infosMutation={infosMutation}
          pcaFilesloading={pcapFilesMutation.isLoading}
        />
      </div>
      <PcapInfos
        pcapInfos={infosMutation}
        rewriteIps={rewriteIps}
        setRewriteIps={setRewriteIps}
        rewriteMacs={rewriteMacs}
        setRewriteMacs={setRewriteMacs}
      />
    </div>
  );
};
