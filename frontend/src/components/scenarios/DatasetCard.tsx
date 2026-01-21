import type { PcapDataset } from "@/types/scenarios";

interface DatasetCardProps {
  dataset: PcapDataset;
}

export function DatasetCard({ dataset }: DatasetCardProps) {
  return (
    <div className="p-4 bg-muted/30 rounded-lg border space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm">{dataset.name}</p>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            dataset.criticality === "high"
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : dataset.criticality === "medium"
              ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
          }`}
        >
          {dataset.criticality}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{dataset.description}</p>
      {dataset.command && (
        <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded break-all">
          {dataset.command}
        </p>
      )}
      <div className="flex items-center gap-3 text-xs">
        <span className="px-2 py-1 bg-secondary rounded-md">
          {dataset.scope.protocol.toUpperCase()}
        </span>
        {dataset.scope.ports && (
          <span className="text-muted-foreground">
            Ports: {dataset.scope.ports.join(", ")}
          </span>
        )}
        <span className="text-muted-foreground font-mono">
          {dataset.file.split("/").pop()}
        </span>
      </div>
    </div>
  );
}
