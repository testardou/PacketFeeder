import { RewriteProvider } from "@/context/RewriteContext";
import { FilePage } from "@/components/filePage.tsx/FilePage";

export const Files = () => {
  return (
    <RewriteProvider>
      <FilePage />
    </RewriteProvider>
  );
};
