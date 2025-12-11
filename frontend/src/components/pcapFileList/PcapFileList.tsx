import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { UseMutationResult } from "@tanstack/react-query";

interface PcapFileListProps {
  pcapFiles?: string[];
  selectFile: string | null;
  setSelectFile: (fileName: string) => void;
  infosMutation: UseMutationResult<unknown, Error, string, unknown>;
  deleteMutation: UseMutationResult<unknown, Error, string, unknown>;
}

export const PcapFileList = ({
  pcapFiles,
  selectFile,
  setSelectFile,
  infosMutation,
  deleteMutation,
}: PcapFileListProps) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <ScrollArea className="h-72  rounded-md border">
        {!pcapFiles || pcapFiles.length === 0 ? (
          <div className="p-4 text-sm">No pcap files available.</div>
        ) : (
          <div className="p-2">
            {pcapFiles?.map((pcapFile) => (
              <div key={pcapFile}>
                <div
                  className={`${
                    selectFile === pcapFile ? "bg-blue-300" : ""
                  } p-1.5 rounded-sm cursor-pointer`}
                  onClick={() => setSelectFile(pcapFile)}
                >
                  {pcapFile}
                </div>
                <Separator className="my-2" />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
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
          onClick={() => selectFile && deleteMutation.mutate(selectFile)}
          className="bg-red-500 text-amber-50  hover:bg-red-600 hover:text-amber-100"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
