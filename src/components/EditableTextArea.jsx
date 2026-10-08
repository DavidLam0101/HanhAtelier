import { useEffect, useState } from 'react';

/**
 * Multi-line version of EditableText: a paragraph for visitors, a textarea for the admin.
 * Commits on blur, reverts on Escape; an empty value reverts too.
 */
export default function EditableTextArea({ value, onSave, editing, className, label, rows = 6 }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  if (!editing) return <p className={className}>{value}</p>;

  const commit = () => {
    const text = draft.trim();
    if (!text) setDraft(value);
    else if (text !== value) onSave(text);
  };

  return (
    <textarea
      className={`inline-edit ${className ?? ''}`}
      aria-label={label}
      value={draft}
      rows={rows}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') { setDraft(value); e.currentTarget.blur(); }
      }}
    />
  );
}
