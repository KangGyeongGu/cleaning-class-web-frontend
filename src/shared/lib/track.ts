import type { TrackRequest } from "@/shared/lib/analytics-schema";

export function track(input: TrackRequest): void {
  if (typeof window === "undefined") return;
  fetch("/api/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    keepalive: true,
  }).catch(() => {
    void 0;
  });
}
