import { useState } from 'react';
import Modal from './Modal.jsx';
import { CARD_CROP } from './DesignModal.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { usePhotoPicker } from '../hooks/usePhotoPicker.jsx';
import { toMoney } from '../lib/format.js';

export default function AddCardModal({ onClose }) {
  const { cardOps, showToast } = useSite();
  const { pick, picker } = usePhotoPicker(CARD_CROP);
  const [img, setImg] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const submit = (e) => {
    e.preventDefault();
    cardOps.add({ name: name.trim(), price: toMoney(price), img, description: description.trim() });
    showToast(img ? 'Nail design added' : 'Nail design added. Add a photo anytime.');
    onClose();
  };

  return (
    <Modal title="Add nail design" onClose={onClose} as="form" onSubmit={submit}>
      <div className="row row-start">
        <div className="preview" style={img ? { backgroundImage: `url(${img})` } : undefined} />
        <button className="btn ghost" type="button" onClick={() => pick(setImg)}>
          {img ? 'Change photo' : 'Choose photo'}
        </button>
      </div>
      <label>
        Service name
        <input type="text" required autoFocus placeholder="Name"
               value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Price ($)
        <input type="number" min="0" step="0.01" required placeholder="60"
               value={price} onChange={(e) => setPrice(e.target.value)} />
      </label>
      <label>
        Description (optional, shown on the design's page)
        <textarea rows={4} placeholder="Description"
                  value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <div className="row">
        <button className="btn ghost" type="button" onClick={onClose}>Cancel</button>
        <button className="btn" type="submit">Add to collection</button>
      </div>
      {picker}
    </Modal>
  );
}
