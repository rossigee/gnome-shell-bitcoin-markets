import GLib from '@girs/glib-2.0';

const sourceIds = new Set<number>();

function trackSource(sourceId: number): number {
  sourceIds.add(sourceId);
  return sourceId;
}

function untrackSource(sourceId: number): boolean {
  return sourceIds.delete(sourceId);
}

export function sourceRemove(sourceId: number): boolean {
  if (!untrackSource(sourceId)) {
    return false;
  }

  return GLib.source_remove(sourceId);
}

/**
 * Add single-shot timeout
 * @param intervalMS
 * @param callback
 */
export function timeoutAdd(intervalMS: number, callback: () => void): number {
  const sourceId = trackSource(GLib.timeout_add(GLib.PRIORITY_DEFAULT, intervalMS, () => {
    untrackSource(sourceId);
    callback();
    return GLib.SOURCE_REMOVE;
  }));
  return sourceId;
}

export function idleAdd(callback: () => void): number {
  const sourceId = trackSource(GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
    untrackSource(sourceId);
    callback();
    return GLib.SOURCE_REMOVE;
  }));

  return sourceId;
}

export function timeoutRemove(sourceId: number): void {
  sourceRemove(sourceId);
}

export function removeAllTimeouts() {
  for (const sourceId of [...sourceIds]) {
    sourceRemove(sourceId);
  }
}
