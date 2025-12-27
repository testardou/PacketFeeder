import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface FileScrollAreaProps {
  pcapFiles?: string[];
  selectFile: string | null;
  setSelectFile: (fileName: string) => void;
  pcaFilesloading?: boolean;
}

export const FileScrollArea = ({
  pcapFiles,
  selectFile,
  setSelectFile,
  pcaFilesloading,
}: FileScrollAreaProps) => {
  return (
    <ScrollArea className="h-72  rounded-md border">
      {pcaFilesloading ? (
        <div className="p-4 text-sm">Loading pcap files ...</div>
      ) : !pcapFiles || pcapFiles.length === 0 ? (
        <div className="p-4 text-sm">No pcap files available.</div>
      ) : (
        <div className="p-2">
          {pcapFiles?.map((pcapFile) => (
            <div key={pcapFile}>
              <div
                className={`
                p-1.5 rounded-sm cursor-pointer
                transition-colors
                hover:bg-muted
                ${
                  selectFile === pcapFile
                    ? "bg-accent text-accent-foreground"
                    : ""
                }
              `}
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
  );
};
