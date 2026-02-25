import { useState } from "react";
import { GripVertical, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Technique } from "@/types/scenarios";

export interface ChainPcapItem {
  type: "pcap";
  id: string;
  techniqueId: string;
  technique: Technique;
  tacticId?: string;
  pcapFile: string;
}

export interface ChainSleepItem {
  type: "sleep";
  id: string;
  duration: number;
}

export type ChainItem = ChainPcapItem | ChainSleepItem;

interface TechniqueChainListProps {
  items: ChainItem[];
  onRemove: (id: string) => void;
  onReorder: (reorderedItems: ChainItem[]) => void;
  onDropFromOutside?: (technique: Omit<ChainPcapItem, "id">) => void;
  onAddSleep: () => void;
  onUpdateSleepDuration: (id: string, duration: number) => void;
}

export function TechniqueChainList({
  items,
  onRemove,
  onReorder,
  onDropFromOutside,
  onAddSleep,
  onUpdateSleepDuration,
}: TechniqueChainListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOverContainer, setIsDragOverContainer] = useState(false);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setIsDragOverContainer(false);
    setDragOverIndex(null);

    // Check if this is a drop from outside (new technique)
    const dragData = e.dataTransfer.getData("application/json");
    if (dragData && onDropFromOutside) {
      try {
        const techniqueData = JSON.parse(dragData);
        const newItem: Omit<ChainPcapItem, "id"> = {
          type: "pcap",
          techniqueId: techniqueData.techniqueId,
          technique: techniqueData.technique,
          tacticId: techniqueData.tacticId,
          pcapFile: techniqueData.pcapFile,
        };
        onDropFromOutside(newItem);
        return;
      } catch (error) {
        console.error("Failed to parse drag data:", error);
      }
    }

    // Internal reordering
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, removed);

    onReorder(newItems);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverContainer(true);
  };

  const handleContainerDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setIsDragOverContainer(false);
    }
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverContainer(false);

    const dragData = e.dataTransfer.getData("application/json");
    if (dragData && onDropFromOutside) {
      try {
        const techniqueData = JSON.parse(dragData);
        const newItem: Omit<ChainPcapItem, "id"> = {
          type: "pcap",
          techniqueId: techniqueData.techniqueId,
          technique: techniqueData.technique,
          tacticId: techniqueData.tacticId,
          pcapFile: techniqueData.pcapFile,
        };
        onDropFromOutside(newItem);
      } catch (error) {
        console.error("Failed to parse drag data:", error);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full gap-3">
        <div
          className={`flex-1 flex flex-col items-center justify-center text-center px-4 text-muted-foreground border-2 border-dashed rounded-lg transition-colors ${
            isDragOverContainer
              ? "border-primary bg-primary/5"
              : "border-border"
          }`}
          onDragOver={handleContainerDragOver}
          onDragLeave={handleContainerDragLeave}
          onDrop={handleContainerDrop}
        >
          <p>Aucune technique dans la chaîne</p>
          <p className="text-sm mt-2">
            {isDragOverContainer
              ? "Relâchez pour ajouter la technique"
              : "Sélectionnez une tactique et une technique à gauche pour commencer, ou glissez-déposez"}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full shrink-0"
          onClick={onAddSleep}
        >
          <Clock className="h-4 w-4 mr-2" />
          Ajouter un Sleep
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div
        className={`flex-1 rounded-lg border-2 border-dashed p-3 transition-colors overflow-auto ${
          isDragOverContainer ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={handleContainerDragOver}
        onDragLeave={handleContainerDragLeave}
        onDrop={handleContainerDrop}
      >
        <div className="space-y-3">
          {items.map((item, index) => (
            <Card
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`cursor-move transition-all duration-200 ${
                draggedIndex === index ? "opacity-50 scale-95" : ""
              } ${
                dragOverIndex === index && draggedIndex !== index
                  ? "border-primary border-2 shadow-lg bg-primary/5"
                  : "hover:border-border/50"
              }`}
            >
              <CardContent className="p-4">
                {item.type === "pcap" ? (
                  <PcapItemContent
                    item={item}
                    index={index}
                    onRemove={onRemove}
                  />
                ) : (
                  <SleepItemContent
                    item={item}
                    index={index}
                    onRemove={onRemove}
                    onUpdateDuration={onUpdateSleepDuration}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full shrink-0"
        onClick={onAddSleep}
      >
        <Clock className="h-4 w-4 mr-2" />
        Ajouter un Sleep
      </Button>
    </div>
  );
}

function PcapItemContent({
  item,
  index,
  onRemove,
}: {
  item: ChainPcapItem;
  index: number;
  onRemove: (id: string) => void;
}) {
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

function SleepItemContent({
  item,
  index,
  onRemove,
  onUpdateDuration,
}: {
  item: ChainSleepItem;
  index: number;
  onRemove: (id: string) => void;
  onUpdateDuration: (id: string, duration: number) => void;
}) {
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
        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Sleep</span>
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
