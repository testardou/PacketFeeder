import { PcapFileList } from "@/components/pcapFileList/PcapFileList";
import { PcapInfos } from "@/components/pcapInfos/PcapInfos";
import type {
  PacketDetailsType,
  PcapFilesType,
  PcapInfoType,
} from "@/types/types";
import { useQuery, type UseMutationResult } from "@tanstack/react-query";
import { API_CONFIG } from "@/config/api";

interface IHandleFilesProps {
  selectFile: string | null;
  setSelectFile: (fileName: string | null) => void;
  files?: string[];
  detailsMutation: UseMutationResult<
    PacketDetailsType[],
    Error,
    string,
    unknown
  >;
  resetStates: () => void;
  infosMutation: UseMutationResult<PcapInfoType, Error, string, unknown>;
}

export const HandleFiles = ({
  selectFile,
  setSelectFile,
  detailsMutation,
  resetStates,
  infosMutation,
}: IHandleFilesProps) => {
  const pcapFilesMutation = useQuery<PcapFilesType>({
    queryKey: ["pcap_files"], // identifiant unique du cache
    queryFn: async () => {
      const res = await fetch(`${API_CONFIG.API_BASE}/get-pcap-files/`);

      if (!res.ok) {
        throw new Error("API Error");
      }

      return res.json();
    },
  });

  const handleSetSelectFile = (fileName: string | null) => {
    setSelectFile(fileName);
  };
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl">Pcap Files</h2>
        <PcapFileList
          detailsMutation={detailsMutation}
          pcapFiles={pcapFilesMutation.data?.files}
          selectFile={selectFile}
          setSelectFile={handleSetSelectFile}
          infosMutation={infosMutation}
          pcaFilesloading={pcapFilesMutation.isLoading}
          resetStates={resetStates}
        />
      </div>
      {selectFile && <PcapInfos pcapInfos={infosMutation} />}
    </div>
  );
};
