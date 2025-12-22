import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ReplayProgressType } from "@/types/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

interface IReplayProgressProps {
  socketData: ReplayProgressType | null;
}

export const RealtimeProgress = ({ socketData }: IReplayProgressProps) => {
  return (
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
  );
};
