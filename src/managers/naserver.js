const NOTES_CONFIG_KEY = 'naServerNotesConfig';

export function loadNAServerNotesConfig() {
  try {
    const raw = localStorage.getItem(NOTES_CONFIG_KEY);
    return raw ? JSON.parse(raw) : { enabled: false, baseUrl: '', token: '' };
  } catch (_) {
    return { enabled: false, baseUrl: '', token: '' };
  }
}

export function saveNAServerNotesConfig(config) {
  const normalized = {
    enabled: !!config.enabled,
    baseUrl: (config.baseUrl || '').trim(),
    token: (config.token || '').trim()
  };
  localStorage.setItem(NOTES_CONFIG_KEY, JSON.stringify(normalized));
  if (normalized.enabled && normalized.baseUrl && normalized.token) {
    localStorage.removeItem('firebaseConfigEnv');
  }
}

export function isNAServerNotesEnabled() {
  const config = loadNAServerNotesConfig();
  return !!(config.enabled && config.baseUrl && config.token);
}

async function requestNotes(path, options = {}) {
  const config = loadNAServerNotesConfig();
  const baseUrl = (config.baseUrl || '').replace(/\/+$/, '');
  if (!baseUrl || !config.token) {
    throw new Error('NAServer notes config is incomplete');
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.token}`
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || `NAServer request failed with status ${response.status}`);
  }
  return payload;
}

export async function listServerNotes() {
  return requestNotes('/api/notes/');
}

export async function createServerNote(note) {
  return requestNotes('/api/notes/', {
    method: 'POST',
    body: note
  });
}

export async function updateServerNote(id, note) {
  return requestNotes(`/api/notes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: note
  });
}

export async function deleteServerNote(id) {
  return requestNotes(`/api/notes/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

export async function toggleServerPin(id) {
  return requestNotes(`/api/notes/${encodeURIComponent(id)}/pin`, {
    method: 'POST'
  });
}
