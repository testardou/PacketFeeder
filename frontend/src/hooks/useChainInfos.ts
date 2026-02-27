import { useMutation } from "@tanstack/react-query";
import { API_CONFIG } from "@/config/api";
import type { ChainItem, ChainInfosResponse } from "@/components/chainbuilder/types";

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

async function postChainInfos(items: ChainItem[]): Promise<ChainInfosResponse> {
  const res = await fetch(`${API_CONFIG.API_BASE}/chain-infos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: toApiItems(items) }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to fetch chain infos");
  }
  return data;
}

export function useChainInfos() {
  return useMutation<ChainInfosResponse, Error, ChainItem[]>({
    mutationFn: postChainInfos,
  });
}
