import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useState } from "react";
import type { PacketDetailsType, PcapInfoType } from "@/types/types";
import { FileScrollArea } from "@/components/fileScrollArea/FileScrollArea";
import { UploadPcapFile } from "@/components/uploadPcapFile/UploadPcapFile";

interface PcapFileListProps {
  pcapFiles?: string[];
  selectFile: string | null;
  setSelectFile: (fileName: string | null) => void;
  infosMutation: UseMutationResult<PcapInfoType, Error, string, unknown>;
  pcaFilesloading?: boolean;
  detailsMutation: UseMutationResult<
    PacketDetailsType[],
    Error,
    string,
    unknown
  >;
  resetStates: () => void;
}

export const PcapFileList = ({
  pcapFiles,
  selectFile,
  setSelectFile,
  infosMutation,
  pcaFilesloading,
  detailsMutation,
  resetStates,
}: PcapFileListProps) => {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (file: string) => {
      const formData = new FormData();
      formData.append("file", file ?? "");

      const res = await fetch("http://localhost:5000/api/delete-pcap-file/", {
        method: "DELETE",
        body: formData,
      });

      if (!res.ok) throw new Error("API Error");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pcap_files"] });
      setIsDeleteDialogOpen(false);
      if (selectFile) {
        setSelectFile(null);
      }
    },
  });

  const handleDelete = () => {
    if (selectFile) {
      deleteMutation.mutate(selectFile);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <FileScrollArea
        selectFile={selectFile}
        setSelectFile={setSelectFile}
        pcaFilesloading={pcaFilesloading}
        pcapFiles={pcapFiles}
      />
      <div className="flex flex-row gap-3">
        <UploadPcapFile
          files={pcapFiles}
          pcaFilesloading={pcaFilesloading}
          resetStates={resetStates}
        />
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
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <Button type="submit" variant="destructive" disabled={!selectFile}>
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the file{" "}
                <strong>{selectFile}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
