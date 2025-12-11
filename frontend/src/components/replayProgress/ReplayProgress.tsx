import type { ReplayProgressType } from "../../types/types";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

interface IReplayProgressProps {
  socketData: ReplayProgressType | null;
  mode?: string;
}

export const ReplayProgress = ({ socketData, mode }: IReplayProgressProps) => {
  return (
    <div className="w-full flex flex-row gap-4 items-center mb-4 items-stretch">
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
      {mode === "realTime" && (
        <>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Remaining Time</CardTitle>
            </CardHeader>
            <CardContent>
              {dayjs((socketData?.remaining_time ?? 0) * 1000)
                .utc()
                .format("HH:mm:ss.SSS")}
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Next Packet In</CardTitle>
            </CardHeader>
            <CardContent>
              {dayjs((socketData?.next_packet ?? 0) * 1000)
                .utc()
                .format("HH:mm:ss.SSS")}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
