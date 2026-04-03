import { GripVertical, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ScenarioSleepItem } from "./types";

interface SleepItemCardProps {
  item: ScenarioSleepItem;
  index: number;
  onRemove: (id: string) => void;
  onUpdateDuration: (id: string, duration: number) => void;
}

export function SleepItemCard({
  item,
  index,
  onRemove,
  onUpdateDuration,
}: SleepItemCardProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-semibold">
          {index + 1}
        </div>
        <div className="text-muted-foreground hover:text-foreground transition-colors">
          <GripVertical className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-center gap-3 flex-1">
        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
          Sleep
        </span>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            value={item.duration}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 0) {
                onUpdateDuration(item.id, val);
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="w-20 h-8 text-sm"
          />
          <span className="text-xs text-muted-foreground">secondes</span>
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
  );
}
