import { PcapFileList } from "@/components/pcapFileList/PcapFileList";
import { PcapInfos } from "@/components/pcapInfos/PcapInfos";
import { UploadPcapFile } from "@/components/uploadPcapFile/UploadPcapFile";
import type { PacketDetailsType, PcapInfoType } from "@/types/types";
import type { UseMutationResult } from "@tanstack/react-query";

interface IHandleFilesProps {
  pcapFiles?: string[];
  selectFile: string | null;
  setSelectFile: (fileName: string) => void;
  pcaFilesloading?: boolean;
  uploadMutation: UseMutationResult<unknown, Error, File | null, unknown>;
  setFile: (file: File | null) => void;
  file: File | null;
  files?: string[];
  infosMutation: UseMutationResult<PcapInfoType, Error, string, unknown>;
  detailsMutation: UseMutationResult<PacketDetailsType, Error, string, unknown>;
  deleteMutation: UseMutationResult<unknown, Error, string, unknown>;
  rewriteIps: { old: string; new: string }[];
  setRewriteIps: (rewriteIps: { old: string; new: string }[]) => void;
  rewriteMacs: { old: string; new: string }[];
  setRewriteMacs: (rewriteIps: { old: string; new: string }[]) => void;
}

export const HandleFiles = ({
  pcapFiles,
  selectFile,
  setSelectFile,
  pcaFilesloading,
  uploadMutation,
  file,
  setFile,
  infosMutation,
  deleteMutation,
  rewriteIps,
  setRewriteIps,
  rewriteMacs,
  setRewriteMacs,
  detailsMutation,
}: IHandleFilesProps) => {
  return (
    <div className="flex flex-row gap-10">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl">Pcap Files</h2>
        <UploadPcapFile
          files={pcapFiles}
          setFile={setFile}
          uploadMutation={uploadMutation}
          file={file}
          pcaFilesloading={pcaFilesloading}
        />
        <PcapFileList
          detailsMutation={detailsMutation}
          pcapFiles={pcapFiles}
          selectFile={selectFile}
          setSelectFile={setSelectFile}
          infosMutation={infosMutation}
          deleteMutation={deleteMutation}
          pcaFilesloading={pcaFilesloading}
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
