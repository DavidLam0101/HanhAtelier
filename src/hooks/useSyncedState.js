import { useEffect, useRef, useState } from 'react';
import { initialValue, saveValue, supabase, swapUploadedPhotos } from '../lib/backend.js';

/**
 * useState that saves itself: to Supabase when it's configured (only while the
 * owner is logged in), otherwise to localStorage. Saves are debounced, so typing
 * doesn't send a request per key press.
 */
export function useSyncedState(key, fallback, { canSave, onError }) {
  const [value, setValue] = useState(() => initialValue(key, fallback));
  const lastSaved = useRef(JSON.stringify(value));

  useEffect(() => {
    const json = JSON.stringify(value);
    if (json === lastSaved.current) return;
    if (supabase && !canSave) return; // visitors never write

    const timer = setTimeout(async () => {
      try {
        const saved = await saveValue(key, value);
        lastSaved.current = JSON.stringify(saved);
        // Photos now live at public URLs: swap them in without losing newer edits
        if (saved !== value) setValue((cur) => swapUploadedPhotos(cur));
      } catch (err) {
        console.error(`Saving "${key}" failed:`, err);
        onError?.();
      }
    }, supabase ? 600 : 0);
    return () => clearTimeout(timer);
  }, [key, value, canSave]);

  return [value, setValue];
}
