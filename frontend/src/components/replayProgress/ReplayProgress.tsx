import type { ReplayProgressType } from "../../types/types";
import { Progress } from "@/components/ui/progress";
import { RealtimeProgress } from "@/components/realtimeProgress/RealtimeProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

interface IReplayProgressProps {
  socketData: ReplayProgressType | null;
  mode?: string;
  loading?: boolean;
}

export const ReplayProgress = ({
  socketData,
  mode,
  loading,
}: IReplayProgressProps) => {
  if (!socketData) return null;

  if (loading) return <p className="text-gray-500">Analyse en cours…</p>;
  return (
    <div className="w-full flex flex-row gap-4 mb-4 items-stretch">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>{Number(socketData?.progress.toFixed(2))} %</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={Math.floor(socketData?.progress ?? 0)} />
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Packet Index</CardTitle>
        </CardHeader>
        <CardContent>{socketData?.index}</CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Timestamp</CardTitle>
        </CardHeader>
        <CardContent>{socketData?.timestamp}</CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Size</CardTitle>
        </CardHeader>
        <CardContent>{socketData?.size} bytes</CardContent>
      </Card>
      {mode === "realTime" && <RealtimeProgress socketData={socketData} />}
    </div>
  );
};
