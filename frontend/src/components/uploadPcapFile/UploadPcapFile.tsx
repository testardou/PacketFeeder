import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useState } from "react";

interface UuploadPcapFileProps {
  files?: string[];
  pcaFilesloading?: boolean;
  resetStates: () => void;
}

export const UploadPcapFile = ({
  files,
  pcaFilesloading,
  resetStates,
}: UuploadPcapFileProps) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File | null) => {
      const formData = new FormData();
      formData.append("file", file ?? "");

      const res = await fetch("http://localhost:5000/api/upload-pcap-file/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("API Error");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pcap_files"] });
      resetStates();
      setFile(null);
      setOpen(false);
    },
  });

  const isFileAlreadyUploaded = file
    ? files?.find((element) => element === file.name) !== undefined
    : false;
  const isDisabled = Boolean(
    pcaFilesloading || !file || !file.name || isFileAlreadyUploaded
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) setFile(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Upload new File</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload PCAP File</DialogTitle>
          <DialogDescription>
            Select a PCAP file to upload to the server.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">PCAP File</Label>
            <Input
              type="file"
              id="file"
              accept=".pcap,.cap"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        {/* LOADING */}
        {uploadMutation.isPending && (
          <p className="text-gray-500">Uploading in progress...</p>
        )}

        {/* ERROR */}
        {isFileAlreadyUploaded && (
          <p className="text-red-600">This file is already uploaded</p>
        )}
        {uploadMutation.isError && (
          <p className="text-red-600">
            Error during upload: {uploadMutation.error.message}
          </p>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setFile(null)}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={isDisabled}
            onClick={() => {
              uploadMutation.mutate(file);
            }}
          >
            Upload PCAP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
