import { useState } from 'react';
import NailCard from './NailCard.jsx';
import AddCardModal from './AddCardModal.jsx';
import { useSite } from '../context/SiteContext.jsx';

/* 3 → 2 → 1 columns; a leftover card on the last row is centred (see .grid in index.css) */
export default function NailGrid() {
  const { cards, isAdmin } = useSite();
  const [adding, setAdding] = useState(false);

  return (
    <section className="collections" id="collections">
      <div className="wrap">
        <div className="grid">
          {cards.map((card) => <NailCard key={card.id} card={card} />)}
          {isAdmin && (
            <button className="add-tile" onClick={() => setAdding(true)}>+ Add nail design</button>
          )}
        </div>
      </div>
      {adding && <AddCardModal onClose={() => setAdding(false)} />}
    </section>
  );
}
