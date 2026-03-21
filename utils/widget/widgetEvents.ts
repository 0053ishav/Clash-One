type Listener = () => void;

let listeners: Listener[] = [];

export function subscribeWidgetUpdate(fn: Listener) {
  listeners.push(fn);

  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function emitWidgetUpdate() {
  for (const l of listeners) {
    l();
  }
}