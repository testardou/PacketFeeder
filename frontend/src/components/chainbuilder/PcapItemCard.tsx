import { GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChainPcapItem } from "./types";

interface PcapItemCardProps {
  item: ChainPcapItem;
  index: number;
  onRemove: (id: string) => void;
}

export function PcapItemCard({ item, index, onRemove }: PcapItemCardProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          {index + 1}
        </div>
        <div className="text-muted-foreground hover:text-foreground transition-colors">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">
                {item.technique.mitre.technique_id}
              </span>
              <span className="text-muted-foreground text-sm">-</span>
              <span className="font-medium text-sm">
                {item.technique.mitre.technique_name}
              </span>
            </div>
            {item.technique.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.technique.description}
              </p>
            )}
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md">
                  {item.technique.metadata.domain}
                </span>
                {item.technique.metadata.confidence && (
                  <span className="text-xs px-2 py-1 bg-secondary/50 rounded-md">
                    {item.technique.metadata.confidence}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground break-all">
                <span className="font-semibold">PCAP :</span>{" "}
                <span>{item.pcapFile}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onRemove(item.id)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

