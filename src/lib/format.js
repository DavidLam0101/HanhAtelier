/** "60" | "$60.5" | 60 → "$60" / "$60.50". Returns null for invalid input. */
export function toMoney(input) {
  const n = parseFloat(String(input).replace(/[^0-9.]/g, ''));
  if (Number.isNaN(n) || n < 0) return null;
  return '$' + (Number.isInteger(n) ? n : n.toFixed(2));
}

/** Unique id for list keys (React needs stable keys, not array indexes). */
export const uid = () => crypto.randomUUID?.() ?? String(Date.now() + Math.random());
