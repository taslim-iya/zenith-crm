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

// Remote wins for all collections
export function mergeState(local: Record<string, any>, remote: Record<string, any>): Record<string, any> {
  const merged: Record<string, any> = { ...local };

  const collections = ['companies', 'team', 'brokers', 'tasks', 'kpis', 'activities', 'research', 'customColumns', 'userAccess'];

  for (const key of collections) {
    if (remote[key] && Array.isArray(remote[key]) && remote[key].length > 0) {
      merged[key] = remote[key];
    }
  }

  if (remote.darkMode !== undefined) merged.darkMode = remote.darkMode;
  if (remote.adminPassword) merged.adminPassword = remote.adminPassword;
  if (remote.currentUserId) merged.currentUserId = remote.currentUserId;

  return merged;
}
