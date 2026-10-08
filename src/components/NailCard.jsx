import { useState } from 'react';
import EditableText from './EditableText.jsx';
import DesignModal, { CARD_CROP } from './DesignModal.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { usePhotoPicker } from '../hooks/usePhotoPicker.jsx';
import { toMoney } from '../lib/format.js';

/* Visitors: the whole card opens the design's information pop-up.
   Admin: the card's photo, name and price are edited right here,
   and "View details" opens the pop-up (gallery + description). */
export default function NailCard({ card }) {
  const { isAdmin, cardOps } = useSite();
  const { pick, picker } = usePhotoPicker(CARD_CROP);
  const [open, setOpen] = useState(false);
  const popup = open && <DesignModal card={card} onClose={() => setOpen(false)} />;

  const arch = (
    <div className="arch" style={card.img ? { backgroundImage: `url(${card.img})` } : undefined}>
      {!card.img && <span className="arch-placeholder">Photo coming soon</span>}
      {isAdmin && (
        <>
          <button className="chip arch-photo-btn" type="button" onClick={() => pick((img) => cardOps.update(card.id, { img }))}>
            Change photo
          </button>
          <button className="remove-btn" type="button" aria-label={`Remove ${card.name}`} onClick={() => cardOps.remove(card.id)}>
            ×
          </button>
        </>
      )}
    </div>
  );

  if (!isAdmin) {
    return (
      <>
        <button type="button" className="card card-link" onClick={() => setOpen(true)}>
          {arch}
          <div className="cap">
            <h3>{card.name}</h3>
            <p>Price {card.price}</p>
          </div>
        </button>
        {popup}
      </>
    );
  }

  return (
    <article className="card">
      {arch}
      <div className="cap">
        <h3>
          <EditableText editing value={card.name} label="Service name"
                        onSave={(name) => cardOps.update(card.id, { name })} />
        </h3>
        <p>
          Price{' '}
          <EditableText editing value={card.price} label="Price" normalize={toMoney}
                        onSave={(price) => cardOps.update(card.id, { price })} />
        </p>
        <button type="button" className="card-details" onClick={() => setOpen(true)}>
          View details & photos →
        </button>
      </div>
      {picker}
      {popup}
    </article>
  );
}
