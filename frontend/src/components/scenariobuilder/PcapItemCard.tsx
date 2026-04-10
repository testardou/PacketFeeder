import { GripVertical, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScenarioPcapItem } from "./types";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PcapItemCardProps {
  item: ScenarioPcapItem;
  index: number;
  onRemove: (id: string) => void;
}

export function PcapItemCard({ item, index, onRemove }: PcapItemCardProps) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-col gap-2 items-center w-full">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row items-center gap-2">
            <div className="flex flex-col gap-1 items-center">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                {index + 1}
              </div>
              <GripVertical className="h-4 w-4" />
            </div>
            <p className="text-sm font-semibold">
              {item.technique.mitre.technique_name}
            </p>
            {item.dataset && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs space-y-1">
                  <p className="font-semibold text-sm">
                    {item.techniqueId} — {item.technique.mitre.technique_name}
                  </p>
                  <p className="text-xs">{item.dataset.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.technique.mitre.tactics}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.technique.metadata.domain} ·{" "}
                    {item.dataset.scope.protocol}
                    {item.dataset.scope.ports?.length
                      ? ` · ports: ${item.dataset.scope.ports.join(", ")}`
                      : ""}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => onRemove(item.id)}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <Separator />
        <p className="text-sm">{item.dataset?.name}</p>
      </div>
    </div>
  );
}
