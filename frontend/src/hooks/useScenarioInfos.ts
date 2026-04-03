import { useMutation } from "@tanstack/react-query";
import { API_CONFIG } from "@/config/api";
import type {
  ScenarioItem,
  ScenarioInfosResponse,
} from "@/components/scenariobuilder/types";

function toApiItems(items: ScenarioItem[]) {
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

async function postScenarioInfos(
  items: ScenarioItem[],
): Promise<ScenarioInfosResponse> {
  const res = await fetch(`${API_CONFIG.API_BASE}/scenario-infos/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: toApiItems(items) }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? "Failed to fetch scenario infos");
  }
  return data;
}

export function useScenarioInfos() {
  return useMutation<ScenarioInfosResponse, Error, ScenarioItem[]>({
    mutationFn: postScenarioInfos,
  });
}
