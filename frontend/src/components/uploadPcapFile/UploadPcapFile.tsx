import type { UseMutationResult } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface UuploadPcapFileProps {
  setFile: (file: File | null) => void;
  uploadMutation: UseMutationResult<unknown, Error, File | null, unknown>;
  file: File | null;
  files?: string[];
  pcaFilesloading?: boolean;
}

export const UploadPcapFile = ({
  setFile,
  uploadMutation,
  file,
  files,
  pcaFilesloading,
}: UuploadPcapFileProps) => {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor="file">Upload new File</Label>
      <div className="flex w-full max-w-sm items-center gap-2">
        <Input
          type="file"
          id="file"
          placeholder="Pcap File"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Button
          type="submit"
          variant="outline"
          disabled={
            pcaFilesloading ||
            !file ||
            !file.name ||
            files?.find((element) => element === file.name) !== undefined
          }
          color="blue"
          onClick={() => uploadMutation.mutate(file)}
        >
          Envoyer le PCAP
        </Button>
      </div>
      {/* LOADING */}
      {uploadMutation.isPending && (
        <p className="text-gray-500">Uploading in progress...</p>
      )}

      {/* ERREUR */}
      {files?.find((element) => element === file?.name) && (
        <p className="text-red-600">This file is already uploaded</p>
      )}
      {uploadMutation.isError && (
        <p className="text-red-600">
          Erreur lors du chargement: {uploadMutation.error.message}
        </p>
      )}
    </div>
  );
};
