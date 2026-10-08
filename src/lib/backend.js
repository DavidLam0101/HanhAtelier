import { createClient } from '@supabase/supabase-js';

/*
 * Where the site's content lives.
 *  - With VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY set (see .env.example):
 *    everything is stored in Supabase, so every visitor sees the owner's edits.
 *  - Without them: falls back to this browser's localStorage (local preview only).
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const OWNER_EMAIL = import.meta.env.VITE_OWNER_EMAIL;

const TABLE = 'site'; // rows of { key, value (jsonb) }
const BUCKET = 'photos';

/* ---------- Loading ---------- */

let loaded = {};

/** Fetches every saved value once, before the app renders. */
export async function loadSiteData() {
  if (!supabase) return;
  // Don't leave visitors on "Loading…" if Supabase is slow or down
  const timeout = new Promise((resolve) =>
    setTimeout(() => resolve({ error: { message: 'timed out after 6s' } }), 6000));
  const { data, error } = await Promise.race([supabase.from(TABLE).select('key, value'), timeout]);
  if (error) {
    console.error('Could not load site content:', error.message);
    return;
  }
  loaded = Object.fromEntries(data.map((row) => [row.key, row.value]));
}

/** Initial value for a key: the saved one, else the default. */
export function initialValue(key, fallback) {
  if (supabase) return key in loaded ? loaded[key] : fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/* ---------- Saving ---------- */

// data: URL → public URL, so a photo is uploaded only once
const uploaded = new Map();

async function uploadPhoto(dataUrl) {
  if (uploaded.has(dataUrl)) return;
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type });
  if (error) throw error;
  uploaded.set(dataUrl, supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
}

const isPhoto = (v) => typeof v === 'string' && v.startsWith('data:image/');

/** Every inline photo (data: URL) anywhere inside a value. */
function findPhotos(value, out = []) {
  if (isPhoto(value)) out.push(value);
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => findPhotos(v, out));
  return out;
}

/** Same value with uploaded photos swapped for their public URLs. */
export function swapUploadedPhotos(value) {
  if (isPhoto(value)) return uploaded.get(value) ?? value;
  if (Array.isArray(value)) return value.map(swapUploadedPhotos);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, swapUploadedPhotos(v)]));
  }
  return value;
}

/**
 * Saves one key. In Supabase mode, photos are uploaded to storage first and
 * the row stores their URLs. Returns the value as saved.
 */
export async function saveValue(key, value) {
  if (!supabase) {
    localStorage.setItem(key, JSON.stringify(value)); // throws when storage is full
    return value;
  }
  await Promise.all(findPhotos(value).map(uploadPhoto));
  const clean = swapUploadedPhotos(value);
  const { error } = await supabase.from(TABLE).upsert({ key, value: clean, updated_at: new Date().toISOString() });
  if (error) throw error;
  return clean;
}
