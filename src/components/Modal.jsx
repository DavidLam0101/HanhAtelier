import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Stack of open modals so Escape only closes the top one
// (e.g. the crop modal opened on top of "Add nail design").
const stack = [];

/** Backdrop + sheet. Closes on Escape or a click on the backdrop. */
export default function Modal({ title, onClose, children, width = 560, showTitle = true, className = '', as: Tag = 'div', ...rest }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const id = Symbol();
    stack.push(id);
    const onKey = (e) => {
      if (e.key === 'Escape' && stack[stack.length - 1] === id) closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      stack.splice(stack.indexOf(id), 1);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  // Portal to <body> so page layout rules (e.g. the card grid) never size the pop-up
  return createPortal(
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <Tag className={`sheet ${className}`} role="dialog" aria-modal="true" aria-label={title}
           style={{ width: `min(${width}px, 100%)` }} {...rest}>
        {showTitle && <h3>{title}</h3>}
        {children}
      </Tag>
    </div>,
    document.body
  );
}
