import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Technique, PcapDataset } from "@/types/scenarios";

interface TechniqueCardProps {
  technique: Technique;
  selectFile: string | null;
  pcapData?: { datasets?: PcapDataset[]; files?: string[] };
  pcapFilesLoading?: boolean;
  onDatasetSelect: (fileName: string) => void;
}

export function TechniqueCard({
  technique,
  selectFile,
  pcapData,
  pcapFilesLoading,
  onDatasetSelect,
}: TechniqueCardProps) {
  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              {technique.mitre.technique_id}
            </span>
            <span className="text-muted-foreground">-</span>
            <span className="font-medium">
              {technique.mitre.technique_name}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {technique.description}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
              {technique.metadata.domain}
            </span>
            <span className="px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md">
              Confidence: {technique.metadata.confidence}
            </span>
            {technique.variants && (
              <span className="text-muted-foreground">
                {technique.variants.length} variant
                {technique.variants.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <a
          href={technique.mitre.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 transition-colors"
          title="View on MITRE ATT&CK"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {technique.artifacts && technique.artifacts.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium">Network Artifacts:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {technique.artifacts.map((artifact, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1.5">•</span>
                <span>{artifact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Datasets from pcapData (API response) */}
      {pcapFilesLoading ? (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium">Available Datasets:</p>
          <p className="text-xs text-muted-foreground">Loading datasets...</p>
        </div>
      ) : pcapData?.datasets && pcapData.datasets.length > 0 ? (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium">Available Datasets:</p>
          <div className="space-y-2">
            {pcapData.datasets.map((dataset) => {
              const isSelected = selectFile === dataset.file;
              return (
                <button
                  key={dataset.id}
                  type="button"
                  onClick={() => onDatasetSelect(dataset.file)}
                  className={cn(
                    "w-full p-3 bg-background border rounded-md transition-all text-left",
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "hover:bg-muted/50 hover:border-muted-foreground/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {dataset.name}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-xs",
                            dataset.criticality === "high"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : dataset.criticality === "medium"
                              ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          )}
                        >
                          {dataset.criticality}
                        </span>
                        {isSelected && (
                          <span className="text-xs text-primary font-medium">
                            ✓ Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {dataset.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-secondary rounded-md">
                          {dataset.scope.protocol.toUpperCase()}
                        </span>
                        {dataset.scope.ports && (
                          <span className="text-muted-foreground">
                            Ports: {dataset.scope.ports.join(", ")}
                          </span>
                        )}
                        <span className="text-muted-foreground font-mono text-xs">
                          {dataset.file.split("/").pop()}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Legacy files list */}
      {pcapData?.files && pcapData.files.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium">Available PCAP Files:</p>
          <div className="space-y-2">
            {pcapData.files
              .filter(
                (file: string) =>
                  file.endsWith(".pcap") || file.endsWith(".pcapng")
              )
              .map((file: string) => {
                const isSelected = selectFile === file;
                return (
                  <button
                    key={file}
                    type="button"
                    onClick={() => onDatasetSelect(file)}
                    className={cn(
                      "w-full p-3 bg-background border rounded-md transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "hover:bg-muted/50 hover:border-muted-foreground/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{file}</span>
                      {isSelected && (
                        <span className="text-xs text-primary font-medium">
                          ✓ Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {technique.variants &&
        technique.variants.length > 0 &&
        !technique.datasets && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium">Available Variants:</p>
            <div className="flex flex-wrap gap-2">
              {technique.variants.map((variant, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                >
                  {variant}
                </span>
              ))}
            </div>
          </div>
        )}

      {technique.pcaps_path && !technique.datasets && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">PCAP Path:</span>{" "}
            {technique.pcaps_path}
          </p>
        </div>
      )}
    </div>
  );
}
