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
import { API_CONFIG } from "@/config/api";
import { useRewriteContext } from "@/context/RewriteContext";
import { REWRITE_KEYS } from "@/constants/rewriteKeys";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  pcaFilesloading,
  resetStates,
}: PcapFileListProps) => {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRiwrittenDialogOpen, setIsRiwrittenDialogOpen] = useState(false);
  const { resetRewrites, rewriteState, rewriteValues } = useRewriteContext();
  const [fileName, setFileName] = useState<string | null>(null);

  const hasRewrites = REWRITE_KEYS.some(
    (key) => rewriteValues.rewrites[key].length > 0,
  );

  const deleteMutation = useMutation({
    mutationFn: async (file: string) => {
      const formData = new FormData();
      formData.append("file", file ?? "");

      const res = await fetch(`${API_CONFIG.API_BASE}/delete-pcap-file/`, {
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

  const rewriteMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("file", selectFile ?? "");
      formData.append("filename", fileName ?? "");
      for (const key of REWRITE_KEYS) {
        formData.append(key, JSON.stringify(rewriteState[key]));
      }

      const res = await fetch(`${API_CONFIG.API_BASE}/rewrite-pcap-file/`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur API");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pcap_files"] });
      resetRewrites();
    },
  });

  return (
    <div className="flex flex-row gap-3 w-full">
      <FileScrollArea
        selectFile={selectFile}
        setSelectFile={setSelectFile}
        pcaFilesloading={pcaFilesloading}
        pcapFiles={pcapFiles}
      />
      <div className="flex flex-col justify-end gap-3">
        {selectFile && hasRewrites && (
          <Dialog
            open={isRiwrittenDialogOpen}
            onOpenChange={setIsRiwrittenDialogOpen}
          >
            <DialogTrigger asChild>
              <Button type="submit" disabled={!hasRewrites}>
                Save rewritten pcap
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm deletion</DialogTitle>
                <DialogDescription>
                  <div className="flex flex-col gap-2">
                    <Label>New file name</Label>
                    <Input
                      disabled={!selectFile || !hasRewrites}
                      onChange={(e) => setFileName(e.target.value)}
                    />
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={() => rewriteMutation.mutate()}
                  disabled={!selectFile || !hasRewrites}
                  className="mt-auto"
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <UploadPcapFile
          files={pcapFiles}
          pcaFilesloading={pcaFilesloading}
          resetStates={resetStates}
        />
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
                Are you sure you want to delete the file
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
