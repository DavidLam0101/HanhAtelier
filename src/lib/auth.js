import { OWNER_EMAIL, supabase } from './backend.js';

/*
 * Owner login.
 *  - Supabase mode: a real account (OWNER_EMAIL + its password), checked by Supabase.
 *  - Local preview: the password below, checked in the browser (not secure, preview only).
 */
const PREVIEW_PASSWORD = '10082002';
const SESSION_KEY = 'hanh-admin';

export async function signIn(password) {
  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email: OWNER_EMAIL, password });
    return !error;
  }
  const ok = password === PREVIEW_PASSWORD;
  if (ok) try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
  return ok;
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
  else try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
}

/** Is the owner already logged in (e.g. from a previous visit)? */
export async function initialSession() {
  if (supabase) return !!(await supabase.auth.getSession()).data.session;
  try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch { return false; }
}

/** Calls back when the login state changes (e.g. the session expires). */
export function watchSession(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(!!session));
  return () => data.subscription.unsubscribe();
}
