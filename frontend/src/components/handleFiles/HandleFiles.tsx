import { PcapFileList } from "@/components/pcapFileList/PcapFileList";
import { PcapInfos } from "@/components/pcapInfos/PcapInfos";
import { UploadPcapFile } from "@/components/uploadPcapFile/UploadPcapFile";
import type { PcapInfoType } from "@/types/types";
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
          pcapFiles={pcapFiles}
          selectFile={selectFile}
          setSelectFile={setSelectFile}
          infosMutation={infosMutation}
          deleteMutation={deleteMutation}
          pcaFilesloading={pcaFilesloading}
        />
      </div>
      <div className="flex flex-col gap-6 flex-1">
        {infosMutation.isPending && (
          <div className="align-middle mx-auto w-full h-full flex justify-center items-center">
            <p className="text-2xl">Pcap Infos Loading...</p>
          </div>
        )}
        {infosMutation.isSuccess && (
          <>
            <h2 className="text-2xl">Pcap Infos</h2>
            <PcapInfos
              pcapInfos={infosMutation}
              rewriteIps={rewriteIps}
              setRewriteIps={setRewriteIps}
              rewriteMacs={rewriteMacs}
              setRewriteMacs={setRewriteMacs}
            />
          </>
        )}
      </div>
    </div>
  );
};
