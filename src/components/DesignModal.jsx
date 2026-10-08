import { useRef, useState } from 'react';
import Modal from './Modal.jsx';
import EditableTextArea from './EditableTextArea.jsx';
import { useSite } from '../context/SiteContext.jsx';
import { shrinkPhoto } from '../lib/crop.js';
import { uid } from '../lib/format.js';

export const CARD_CROP = { aspect: '1 / 1', outWidth: 800, arch: true };
const NO_DESCRIPTION = 'Describe this design here: the look, the technique, how long it takes and how long it lasts.';

/* Information pop-up for a nail card: a photo gallery plus name, price and description.
   The admin can add/remove gallery photos and edit the description here;
   the card's own photo, name and price are edited on the card. */
export default function DesignModal({ card, onClose }) {
  const { cardOps, isAdmin, showToast } = useSite();
  const fileRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [adding, setAdding] = useState(false);

  const photos = card.photos ?? [];
  // No gallery yet → show the card's own photo so the pop-up isn't empty
  const shown = photos.length ? photos : card.img ? [{ id: 'cover', src: card.img }] : [];
  const current = Math.min(index, Math.max(shown.length - 1, 0));
  const step = (d) => setIndex((current + d + shown.length) % shown.length);

  const addPhotos = async (files) => {
    if (!files.length) return;
    setAdding(true);
    try {
      const added = await Promise.all([...files].map(async (f) => ({ id: uid(), src: await shrinkPhoto(f) })));
      cardOps.update(card.id, { photos: [...photos, ...added] });
      setIndex(photos.length); // jump to the first new photo
      showToast(added.length === 1 ? 'Photo added' : `${added.length} photos added`);
    } catch {
      showToast("Couldn't read one of those photos.");
    } finally {
      setAdding(false);
    }
  };

  const removePhoto = (id) => cardOps.update(card.id, { photos: photos.filter((p) => p.id !== id) });

  return (
    <Modal title={card.name} onClose={onClose} width={1400} showTitle={false} className="sheet-large">
      <button className="design-close" type="button" aria-label="Close" onClick={onClose}>×</button>

      <div className="design-card">
        <div className="gallery">
          <div className="gallery-main">
            {shown.length ? (
              <img src={shown[current].src} alt={`${card.name} photo ${current + 1} of ${shown.length}`} />
            ) : (
              <span className="gallery-empty">{isAdmin ? 'Add photos of this design below.' : 'Photos coming soon'}</span>
            )}
            {shown.length > 1 && (
              <>
                <button className="gallery-nav prev" type="button" aria-label="Previous photo" onClick={() => step(-1)}>‹</button>
                <button className="gallery-nav next" type="button" aria-label="Next photo" onClick={() => step(1)}>›</button>
                <span className="gallery-count">{current + 1} / {shown.length}</span>
              </>
            )}
          </div>

          {(shown.length > 1 || isAdmin) && (
            <div className="gallery-thumbs">
              {shown.map((p, i) => (
                <div key={p.id} className={`gallery-thumb ${i === current ? 'on' : ''}`}>
                  <button type="button" aria-label={`Show photo ${i + 1}`} onClick={() => setIndex(i)}>
                    <img src={p.src} alt="" />
                  </button>
                  {isAdmin && p.id !== 'cover' && (
                    <button className="gallery-remove" type="button" aria-label={`Remove photo ${i + 1}`}
                            onClick={() => removePhoto(p.id)}>×</button>
                  )}
                </div>
              ))}
              {isAdmin && (
                <button className="gallery-add" type="button" disabled={adding} onClick={() => fileRef.current.click()}>
                  {adding ? 'Adding…' : '+ Add photos'}
                </button>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple hidden
                 onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }} />
        </div>

        <div className="design-info">
          <h2>{card.name}</h2>
          <p className="design-price">Price {card.price}</p>
          <EditableTextArea
            className="design-desc"
            editing={isAdmin}
            value={card.description || NO_DESCRIPTION}
            label="Design description"
            rows={8}
            onSave={(description) => cardOps.update(card.id, { description })}
          />
        </div>
      </div>
    </Modal>
  );
}
