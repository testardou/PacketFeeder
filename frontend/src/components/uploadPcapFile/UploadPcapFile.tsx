import type { UseMutationResult } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface UuploadPcapFileProps {
  setFile: (file: File | null) => void;
  uploadMutation: UseMutationResult<unknown, Error, File | null, unknown>;
  file: File | null;
}

export const UploadPcapFile = ({
  setFile,
  uploadMutation,
  file,
}: UuploadPcapFileProps) => {
  return (
    <div className="grid w-full max-w-sm items-center gap-3">
      <Label htmlFor="file">Pcap File</Label>
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
          disabled={!file}
          color="blue"
          onClick={() => uploadMutation.mutate(file)}
        >
          Envoyer le PCAP
        </Button>
      </div>
    </div>
  );
};
