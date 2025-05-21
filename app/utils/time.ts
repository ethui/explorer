import {
  formatDistanceToNow,
  formatDistanceToNowStrict,
  formatDuration,
  intervalToDuration,
} from "date-fns";
import { isEmpty } from "lodash-es";

export function formatRelativeTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  const diff = Date.now() - date.getTime();

  if (diff < 60000) {
    return formatDistanceToNowStrict(date, { unit: "second", addSuffix: true });
  }

  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatTimeInterval(start: bigint, end: bigint): string {
  if (!start || !end) return "0s";

  const duration = intervalToDuration({
    start: Number(start) * 1000,
    end: Number(end) * 1000,
  });

  return isEmpty(duration) ? "0s" : formatDuration(duration);
}
