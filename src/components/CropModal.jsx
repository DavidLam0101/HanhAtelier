import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Modal from './Modal.jsx';
import { exportCrop, fitRect, moveRect, parseAspect, resizeRect } from '../lib/crop.js';

// Corner and edge handles: [name, sx, sy] where s = which side is being dragged
const HANDLES = [
  ['nw', -1, -1], ['n', 0, -1], ['ne', 1, -1], ['e', 1, 0],
  ['se', 1, 1], ['s', 0, 1], ['sw', -1, 1], ['w', -1, 0],
];

/**
 * The whole photo stays visible; drag the box to move it and the
 * corner / edge handles to resize it. The box keeps the slot's ratio.
 * aspect: CSS aspect ratio of the result, e.g. "1 / 1" or "5 / 2"
 * arch:   outline the arched card shape inside the box
 * round:  outline a circle inside the box (profile photo)
 */
export default function CropModal({ file, aspect, outWidth, arch, round, onDone, onCancel }) {
  const imgRef = useRef(null);
  const drag = useRef(null);
  const [src, setSrc] = useState(null);
  const [rect, setRect] = useState(null); // crop box in the photo's own pixels
  const [scale, setScale] = useState(1); // on-screen px per photo px
  const ratio = parseAspect(aspect);

  // Object URL for the chosen file, revoked when the modal closes
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Track the displayed size so the box stays on the photo when the window resizes
  useLayoutEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const ro = new ResizeObserver(() => img.naturalWidth && setScale(img.clientWidth / img.naturalWidth));
    ro.observe(img);
    return () => ro.disconnect();
  }, [src]);

  const onLoad = () => {
    const img = imgRef.current;
    setScale(img.clientWidth / img.naturalWidth);
    setRect(fitRect(img.naturalWidth, img.naturalHeight, ratio));
  };

  const startDrag = (e, handle) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { handle, x: e.clientX, y: e.clientY, start: rect };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const img = imgRef.current;
    const size = { W: img.naturalWidth, H: img.naturalHeight };
    const dx = (e.clientX - d.x) / scale, dy = (e.clientY - d.y) / scale;
    setRect(d.handle
      ? resizeRect(d.start, d.handle, dx, dy, ratio, size, 48 / scale)
      : moveRect(d.start, dx, dy, size));
  };
  const endDrag = () => (drag.current = null);

  const box = rect && {
    left: rect.x * scale, top: rect.y * scale, width: rect.w * scale, height: rect.h * scale,
  };

  return (
    <Modal title="Crop photo" onClose={onCancel} width={720}>
      <p className="hint">
        Drag the box to move it, or drag its corners and edges to resize.
        {rect && <span className="crop-size"> {Math.round(rect.w)} × {Math.round(rect.h)}</span>}
      </p>

      <div className="crop-stage">
        <div className="crop-photo">
          {src && <img ref={imgRef} src={src} alt="Photo being cropped" onLoad={onLoad} draggable={false} />}
          {box && (
            <div
              className="crop-box"
              style={box}
              onPointerDown={(e) => startDrag(e, null)}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <span className="crop-grid" aria-hidden="true" />
              {arch && <span className="crop-arch" aria-hidden="true" />}
              {round && <span className="crop-arch crop-round" aria-hidden="true" />}
              {HANDLES.map(([name, sx, sy]) => (
                <span
                  key={name}
                  className={`crop-handle h-${name}`}
                  onPointerDown={(e) => startDrag(e, { sx, sy })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="row">
        <button className="btn ghost" type="button" onClick={onCancel}>Cancel</button>
        <button className="btn" type="button" disabled={!rect}
                onClick={() => onDone(exportCrop(imgRef.current, rect, outWidth))}>
          Apply
        </button>
      </div>
    </Modal>
  );
}
