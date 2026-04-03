import { initialRewriteState } from "@/constants/rewriteKeys";
import type {
  NewValuesPcapType,
  RewriteKey,
  RewriteState,
} from "@/types/types";

type RewriteAction =
  | { type: "SET"; key: RewriteKey; payload: NewValuesPcapType[] }
  | { type: "RESET" };

export const rewriteReducer = (
  state: RewriteState,
  action: RewriteAction,
): RewriteState => {
  if (action.type === "SET") return { ...state, [action.key]: action.payload };
  if (action.type === "RESET") return initialRewriteState;
  return state;
};
