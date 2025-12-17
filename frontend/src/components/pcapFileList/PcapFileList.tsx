import { Button } from "@/components/ui/button";
import type { UseMutationResult } from "@tanstack/react-query";
import type { PacketDetailsType, PcapInfoType } from "@/types/types";
import { FileScrollArea } from "@/components/fileScrollArea/FileScrollArea";

interface PcapFileListProps {
  pcapFiles?: string[];
  selectFile: string | null;
  setSelectFile: (fileName: string) => void;
  infosMutation: UseMutationResult<PcapInfoType, Error, string, unknown>;
  deleteMutation: UseMutationResult<unknown, Error, string, unknown>;
  pcaFilesloading?: boolean;
  detailsMutation: UseMutationResult<PacketDetailsType, Error, string, unknown>;
}

export const PcapFileList = ({
  pcapFiles,
  selectFile,
  setSelectFile,
  infosMutation,
  deleteMutation,
  pcaFilesloading,
  detailsMutation,
}: PcapFileListProps) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <FileScrollArea
        selectFile={selectFile}
        setSelectFile={setSelectFile}
        pcaFilesloading={pcaFilesloading}
        pcapFiles={pcapFiles}
      />
      <div className="flex flex-row gap-3">
        <Button
          type="submit"
          variant="outline"
          disabled={!selectFile}
          color="blue"
          onClick={() => selectFile && infosMutation.mutate(selectFile)}
        >
          Get infos
        </Button>
        <Button
          type="submit"
          variant="outline"
          disabled={!selectFile}
          color="blue"
          onClick={() => selectFile && detailsMutation.mutate(selectFile)}
        >
          Packet Details
        </Button>
        <Button
          type="submit"
          variant="outline"
          disabled={!selectFile}
          onClick={() => selectFile && deleteMutation.mutate(selectFile)}
          className="bg-red-500 text-amber-50  hover:bg-red-600 hover:text-amber-100"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
