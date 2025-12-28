/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ReplayProgressType } from "@/types/types";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

interface IReplayProgressProps {
  socketData: ReplayProgressType | null;
}

export const RealtimeProgress = ({ socketData }: IReplayProgressProps) => {
  const [nextPacketCountdown, setNextPacketCountdown] = useState<number>(0);
  const [remainingTimeCountdown, setRemainingTimeCountdown] =
    useState<number>(0);

  useEffect(() => {
    if (!socketData?.next_packet || socketData.next_packet <= 0) {
      setNextPacketCountdown(0);
      return;
    }

    // Initialize countdown with the next_packet value
    const initialValue = socketData.next_packet;
    setNextPacketCountdown(initialValue);

    // Update countdown every 100ms for smooth decrement
    const interval = setInterval(() => {
      setNextPacketCountdown((prev) => {
        const newValue = prev - 0.1;
        return newValue > 0 ? newValue : 0;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [socketData?.next_packet]);

  useEffect(() => {
    if (!socketData?.remaining_time || socketData.remaining_time <= 0) {
      setRemainingTimeCountdown(0);
      return;
    }

    // Initialize countdown with the remaining_time value
    const initialValue = socketData.remaining_time;
    setRemainingTimeCountdown(initialValue);

    // Update countdown every 100ms for smooth decrement
    const interval = setInterval(() => {
      setRemainingTimeCountdown((prev) => {
        const newValue = prev - 0.1;
        return newValue > 0 ? newValue : 0;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [socketData?.remaining_time]);

  return (
    <>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Remaining Time</CardTitle>
        </CardHeader>
        <CardContent>
          {remainingTimeCountdown > 0
            ? dayjs(remainingTimeCountdown * 1000)
                .utc()
                .format("HH:mm:ss.SSS")
            : "00:00:00.000"}
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Next Packet In</CardTitle>
        </CardHeader>
        <CardContent>
          {nextPacketCountdown > 0
            ? dayjs(nextPacketCountdown * 1000)
                .utc()
                .format("HH:mm:ss.SSS")
            : "00:00:00.000"}
        </CardContent>
      </Card>
    </>
  );
};
