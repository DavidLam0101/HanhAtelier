import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSite } from '../context/SiteContext.jsx';
import LoginModal from './LoginModal.jsx';

const LINKS = [
  { label: 'Home', hash: '' }, // plain "/" → top of the main page
  { label: 'About', hash: '#collections' },
  { label: 'Service', hash: '#prices' },
  { label: 'Contact', hash: '#contact' },
  { label: 'Collections', hash: '#collections' },
];

export default function Navbar() {
  const { isAdmin, logout, showToast } = useSite();
  const [active, setActive] = useState('Home');
  const [loginOpen, setLoginOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <nav className="nav">
      <Link to="/" className="nav-brand" onClick={() => setActive('Home')}>PolishMyGem</Link>
      <div className="nav-links">
        {LINKS.map(({ label, hash }) => (
          // On /profile the links go back to the home page sections
          <Link
            key={label}
            to={!hash ? '/' : pathname === '/' ? hash : `/${hash}`}
            className={active === label ? 'active' : ''}
            onClick={() => setActive(label)}
          >
            {label}
          </Link>
        ))}

        <button
          type="button"
          className={`login-btn ${isAdmin ? 'on' : ''}`}
          onClick={() => {
            if (isAdmin) logout().then(() => showToast('Logged out'));
            else setLoginOpen(true);
          }}
        >
          {isAdmin ? 'Log out' : 'Admin login'}
        </button>

        <Link to="/profile" className="avatar" title="Profile" aria-label="Profile">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="12" cy="8" r="4" fill="currentColor" />
            <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="currentColor" />
          </svg>
        </Link>
      </div>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </nav>
  );
}
