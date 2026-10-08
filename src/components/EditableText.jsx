import { useEffect, useState } from 'react';

/**
 * Plain text for visitors; an inline input for the admin.
 * Commits on blur or Enter, reverts on Escape.
 * `normalize` can reformat or reject (return null) the value, e.g. prices.
 */
export default function EditableText({ value, onSave, editing, normalize, className, label }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  if (!editing) return <span className={className}>{value}</span>;

  const commit = () => {
    const trimmed = draft.trim();
    const next = trimmed ? (normalize ? normalize(trimmed) : trimmed) : null;
    if (next == null) setDraft(value); // invalid → revert
    else if (next !== value) onSave(next);
    else setDraft(next);
  };

  return (
    <input
      className={`inline-edit ${className ?? ''}`}
      value={draft}
      aria-label={label}
      size={Math.max(draft.length, 3)}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') { setDraft(value); e.currentTarget.blur(); }
      }}
    />
  );
}
