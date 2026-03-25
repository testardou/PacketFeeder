import { ReplayPage } from "@/components/replayPage/ReplayPage";
import { RewriteProvider } from "@/context/RewriteContext";

export default function Replay() {
  return (
    <RewriteProvider>
      <ReplayPage />
    </RewriteProvider>
  );
}
