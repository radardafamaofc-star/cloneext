import { nanoid } from 'nanoid';

export interface LicenseKey {
  id: string;
  key: string;
  label: string;
  type: 'trial' | 'pro' | 'lifetime';
  status: 'active' | 'expired' | 'revoked';
  createdAt: string;
  expiresAt: string | null;
}

const STORAGE_KEY = 'lovable_license_keys';

function loadKeys(): LicenseKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveKeys(keys: LicenseKey[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function getKeys(): LicenseKey[] {
  return loadKeys();
}

export function generateKey(
  label: string,
  type: LicenseKey['type'],
  durationDays: number | null
): LicenseKey {
  const now = new Date();
  const key: LicenseKey = {
    id: nanoid(12),
    key: `LI-${type.toUpperCase()}-${nanoid(24)}`,
    label,
    type,
    status: 'active',
    createdAt: now.toISOString(),
    expiresAt: durationDays
      ? new Date(now.getTime() + durationDays * 86400000).toISOString()
      : null,
  };
  const keys = loadKeys();
  keys.unshift(key);
  saveKeys(keys);
  return key;
}

export function revokeKey(id: string): boolean {
  const keys = loadKeys();
  const key = keys.find((k) => k.id === id);
  if (!key) return false;
  key.status = 'revoked';
  saveKeys(keys);
  return true;
}

export function deleteKey(id: string): boolean {
  const keys = loadKeys();
  const filtered = keys.filter((k) => k.id !== id);
  if (filtered.length === keys.length) return false;
  saveKeys(filtered);
  return true;
}
