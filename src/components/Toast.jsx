import { useSite } from '../context/SiteContext.jsx';

export default function Toast() {
  const { toast, hideToast } = useSite();
  if (!toast) return null;
  return (
    <div className="toast" role="status">
      <span>{toast.msg}</span>
      {toast.undo && (
        <button onClick={() => { toast.undo(); hideToast(); }}>Undo</button>
      )}
    </div>
  );
}
