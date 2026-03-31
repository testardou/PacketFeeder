import { ExternalLink } from "lucide-react";
import type { Tactic } from "@/types/mitre";

interface TacticCardProps {
  tactic: Tactic;
}

export function TacticCard({ tactic }: TacticCardProps) {
  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              {tactic.mitre.tactic_id}
            </span>
            <span className="text-muted-foreground">-</span>
            <span className="font-medium">{tactic.mitre.tactic_name}</span>
          </div>
          <p className="text-sm text-muted-foreground">{tactic.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md">
              {tactic.metadata.domain}
            </span>
            <span className="text-muted-foreground">
              {tactic.techniques.length} technique
              {tactic.techniques.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <a
          href={tactic.mitre.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 transition-colors"
          title="View on MITRE ATT&CK"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
