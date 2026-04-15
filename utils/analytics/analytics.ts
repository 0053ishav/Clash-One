import { posthog } from "./posthog";

let sessionSource: "widget" | "app" | "notification" = "app";

export function setSessionSource(source?: string) {
  if (source === "widget" || source === "notification") {
    sessionSource = source;
  } else {
    sessionSource = "app";
  }
}

export function getSessionSource() {
  return sessionSource;
}


export function track(event: string, props?: Record<string, any>) {
  const payload = {
    event,
    source: sessionSource,
    timestamp: Date.now(),
    ...props,
  };

  console.log("📊", payload);

  // later: send to analytics service
  posthog.capture(event, payload);
}