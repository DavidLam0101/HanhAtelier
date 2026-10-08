import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSyncedState } from '../hooks/useSyncedState.js';
import { signIn, signOut, watchSession } from '../lib/auth.js';
import { supabase } from '../lib/backend.js';
import { uid } from '../lib/format.js';

/* Example content — the owner replaces it in admin mode */
const DEFAULT_CARDS = [
  { name: 'Gel Manicure', price: '$45',
    description: 'Shaping, cuticle care and a long-lasting gel colour of your choice, cured for a glossy finish that stays chip-free for up to three weeks.' },
  { name: 'Hand-Painted Nail Art', price: '$70',
    description: 'Custom designs painted by hand, from delicate florals to bold patterns. Bring a reference photo or let us design something just for you.' },
  { name: 'Chrome Almond Set', price: '$60',
    description: 'Almond-shaped extensions finished with a mirror chrome powder for a high-shine, modern look.' },
].map((c) => ({ ...c, id: uid(), img: null }));

const DEFAULT_PRICES = [
  ['Classic Manicure', '$25'], ['Gel Manicure', '$45'], ['Gel-X Extensions', '$65'],
  ['Acrylic Full Set', '$55'], ['Acrylic Fill', '$40'], ['French Tips', '$10'],
  ['Chrome Powder', '$15'], ['Nail Art (per nail)', '$5'], ['Classic Pedicure', '$35'],
  ['Gel Pedicure', '$50'], ['Gel Removal', '$10'], ['Nail Repair', '$5'],
].map(([name, price]) => ({ id: uid(), name, price }));

const DEFAULT_FOOTER = {
  titles: { address: 'Nails studio', hours: 'Business hours', contact: 'Contact information' },
  address: ['Address, Florida', 'US postal code'],
  hours: [
    ['Monday', '9:30 am – 7:00 pm'], ['Tuesday', '9:30 am – 7:00 pm'],
    ['Wednesday', '9:30 am – 7:00 pm'], ['Thursday', '9:30 am – 7:00 pm'],
    ['Friday', '9:30 am – 7:00 pm'], ['Saturday', '9:30 am – 6:00 pm'],
    ['Sunday', '10:00 am – 3:00 pm'],
  ],
  contact: ['Phone #: 239 848 6904', 'IG: @something', 'Gmail: HanhSomething'],
};

const DEFAULT_PROFILE = {
  photo: null,
  description: 'Write a few words about yourself and your studio here (admin).',
};

const SiteContext = createContext(null);

export function SiteProvider({ initialAdmin = false, children }) {
  const [toast, setToast] = useState(null); // { msg, undo? }
  const timer = useRef();

  const showToast = useCallback((msg, undo) => {
    clearTimeout(timer.current);
    setToast({ msg, undo });
    timer.current = setTimeout(() => setToast(null), 4500);
  }, []);

  const [isAdmin, setIsAdmin] = useState(initialAdmin);
  useEffect(() => watchSession(setIsAdmin), []);
  const login = async (password) => { const ok = await signIn(password); if (ok) setIsAdmin(true); return ok; };
  const logout = async () => { await signOut(); setIsAdmin(false); };

  const onSaveError = () =>
    showToast(supabase
      ? "Couldn't save that change. Check your internet connection and try again."
      : "Couldn't save — browser storage is full. Try a smaller photo.");
  const sync = { canSave: isAdmin, onError: onSaveError };

  const [hero, setHero] = useSyncedState('jni-hero', null, sync);
  const [cards, setCards] = useSyncedState('jni-cards', DEFAULT_CARDS, sync);
  const [prices, setPrices] = useSyncedState('jni-prices', DEFAULT_PRICES, sync);
  const [bookUrl, setBookUrl] = useSyncedState('jni-book', '', sync);
  const [storedFooter, setStoredFooter] = useSyncedState('jni-footer', DEFAULT_FOOTER, sync);
  // Defaults fill in fields that older saved footers don't have yet (e.g. titles)
  const footer = { ...DEFAULT_FOOTER, ...storedFooter };
  const setFooter = (update) => setStoredFooter((f) => update({ ...DEFAULT_FOOTER, ...f }));

  const [profile, setProfile] = useSyncedState('jni-profile', DEFAULT_PROFILE, sync);

  /* Generic list helpers, shared by cards and prices */
  const listOps = (list, setList) => ({
    add: (item) => setList((l) => [...l, { id: uid(), ...item }]),
    update: (id, patch) => setList((l) => l.map((it) => (it.id === id ? { ...it, ...patch } : it))),
    remove: (id) => {
      // Side effects (the toast) stay outside the state updater
      const index = list.findIndex((it) => it.id === id);
      if (index < 0) return;
      const removed = list[index];
      setList((l) => l.filter((it) => it.id !== id));
      showToast(`Removed “${removed.name}”`, () =>
        setList((cur) => [...cur.slice(0, index), removed, ...cur.slice(index)])
      );
    },
  });

  const value = {
    hero, setHero,
    cards, cardOps: listOps(cards, setCards),
    prices, priceOps: listOps(prices, setPrices),
    bookUrl, setBookUrl,
    footer, setFooter,
    profile, setProfile,
    isAdmin, login, logout,
    toast, showToast, hideToast: () => setToast(null),
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);
