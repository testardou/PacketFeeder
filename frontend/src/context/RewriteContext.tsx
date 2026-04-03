import { createContext, useContext, useReducer } from "react";
import { rewriteReducer } from "@/hooks/useRewriteReducer";
import type { RewriteState, RewriteValues } from "@/types/types";
import { initialRewriteState } from "@/constants/rewriteKeys";

type RewriteContextType = {
  rewriteState: RewriteState;
  rewriteValues: RewriteValues;
  resetRewrites: () => void;
};

const RewriteContext = createContext<RewriteContextType | null>(null);

interface RewriteProviderProps {
  children: React.ReactNode;
  externalValues?: RewriteValues;
}

export function RewriteProvider({
  children,
  externalValues,
}: RewriteProviderProps) {
  const [rewriteState, dispatch] = useReducer(
    rewriteReducer,
    initialRewriteState,
  );

  const rewriteValues: RewriteValues = {
    rewrites: rewriteState,
    setRewrite: (key, values) =>
      dispatch({ type: "SET", key, payload: values }),
  };

  const resolvedValues = externalValues ?? rewriteValues;

  const resetRewrites = () => dispatch({ type: "RESET" });

  return (
    <RewriteContext.Provider
      value={{ rewriteState, rewriteValues: resolvedValues, resetRewrites }}
    >
      {children}
    </RewriteContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRewriteContext() {
  const ctx = useContext(RewriteContext);
  if (!ctx) throw new Error("useRewriteContext must be inside RewriteProvider");
  return ctx;
}
