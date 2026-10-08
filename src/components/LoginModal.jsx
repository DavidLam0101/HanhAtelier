import { useState } from 'react';
import Modal from './Modal.jsx';
import { useSite } from '../context/SiteContext.jsx';

export default function LoginModal({ onClose }) {
  const { login, showToast } = useSite();
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const ok = await login(password);
    setBusy(false);
    if (ok) {
      showToast('Logged in as admin');
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <Modal title="Admin login" onClose={onClose} width={380} as="form" onSubmit={submit}>
      <label>
        Password
        <input
          type="password" autoFocus required autoComplete="current-password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
        />
      </label>
      {error && <p className="err">Wrong password. Try again.</p>}
      <div className="row">
        <button className="btn ghost" type="button" onClick={onClose}>Cancel</button>
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </div>
    </Modal>
  );
}
