// Sync layer: load from Supabase on init, save on changes (debounced)

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let lastSavedJson = '';
let remoteLoaded = false;

export function markRemoteLoaded() { remoteLoaded = true; }

export async function loadRemoteState(): Promise<Record<string, any> | null> {
  try {
    const r = await fetch('/api/sync');
    if (!r.ok) return null;
    const { state } = await r.json();
    return state;
  } catch {
    return null;
  }
}

export function saveRemoteState(state: Record<string, any>) {
  if (!remoteLoaded) return;
  const json = JSON.stringify(state);
  if (json === lastSavedJson) return;

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      lastSavedJson = json;
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: json,
      });
    } catch {
      // Silent fail — localStorage is the fallback
    }
  }, 2000);
}

// Merge by ID: combines local + remote, remote wins on conflicts
function mergeArraysById(local: any[], remote: any[]): any[] {
  const map = new Map<string, any>();
  for (const item of local) if (item?.id) map.set(item.id, item);
  for (const item of remote) if (item?.id) map.set(item.id, item); // remote overwrites
  return Array.from(map.values());
}

export function mergeState(local: Record<string, any>, remote: Record<string, any>): Record<string, any> {
  const merged: Record<string, any> = { ...local };

  const collections = ['companies', 'team', 'brokers', 'tasks', 'kpis', 'activities', 'research', 'customColumns', 'userAccess'];

  for (const key of collections) {
    const l = Array.isArray(local[key]) ? local[key] : [];
    const r = Array.isArray(remote[key]) ? remote[key] : [];
    if (r.length > 0 || l.length > 0) {
      merged[key] = mergeArraysById(l, r);
    }
  }

  if (remote.darkMode !== undefined) merged.darkMode = remote.darkMode;
  if (remote.adminPassword) merged.adminPassword = remote.adminPassword;
  if (remote.currentUserId) merged.currentUserId = remote.currentUserId;

  return merged;
}
