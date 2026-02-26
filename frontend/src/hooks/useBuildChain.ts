import { useMutation } from "@tanstack/react-query";
import { API_CONFIG } from "@/config/api";
import type { ChainItem } from "@/components/chainbuilder/types";

export interface BuildChainResponse {
  file: string;
  packet_count: number;
  duration: number;
}

function toApiItems(items: ChainItem[]) {
  return items.map((item) => {
    if (item.type === "pcap") {
      return {
        type: "pcap" as const,
        pcap_file: item.pcapFile,
        technique_id: item.techniqueId ?? null,
        tactic_id: item.tacticId ?? null,
      };
    }
    return {
      type: "sleep" as const,
      duration: item.duration,
    };
  });
}

async function postBuildChain(
  items: ChainItem[]
): Promise<BuildChainResponse> {
  const res = await fetch(`${API_CONFIG.API_BASE}/build-chain/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: toApiItems(items) }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to build chain");
  }
  return data;
}

export function useBuildChain() {
  return useMutation<BuildChainResponse, Error, ChainItem[]>({
    mutationFn: postBuildChain,
  });
}
