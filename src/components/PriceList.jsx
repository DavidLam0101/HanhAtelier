import { useRef, useState } from 'react';
import EditableText from './EditableText.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { toMoney } from '../lib/format.js';

export default function PriceList() {
  const { prices, priceOps, isAdmin } = useSite();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const nameRef = useRef(null);

  const add = (e) => {
    e.preventDefault();
    priceOps.add({ name: name.trim(), price: toMoney(price) });
    setName('');
    setPrice('');
    nameRef.current.focus(); // ready for the next one
  };

  return (
    <section className="prices" id="prices">
      <div className="wrap">
        <div className="price-box">
          {prices.length === 0 ? (
            <p className="empty">No services listed yet.</p>
          ) : (
            <ul>
              {prices.map((p) => (
                <li key={p.id}>
                  <EditableText className="price-name" editing={isAdmin} value={p.name} label="Service name"
                                onSave={(v) => priceOps.update(p.id, { name: v })} />
                  <span className="dots" />
                  <EditableText className="price-value" editing={isAdmin} value={p.price} label="Price"
                                normalize={toMoney} onSave={(v) => priceOps.update(p.id, { price: v })} />
                  {isAdmin && (
                    <button className="price-remove" aria-label={`Remove ${p.name}`}
                            onClick={() => priceOps.remove(p.id)}>×</button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {isAdmin && (
            <form className="add-price" onSubmit={add}>
              <input ref={nameRef} type="text" required placeholder="Service name" aria-label="Service name"
                     value={name} onChange={(e) => setName(e.target.value)} />
              <input type="number" min="0" step="0.01" required placeholder="Price ($)" aria-label="Price in dollars"
                     value={price} onChange={(e) => setPrice(e.target.value)} />
              <button className="btn" type="submit">+ Add service</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
