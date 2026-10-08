import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { SiteProvider } from './context/SiteContext.jsx';
import { loadSiteData } from './lib/backend.js';
import { initialSession } from './lib/auth.js';
import './index.css';

// Load the saved content (and whether the owner is logged in) before the first
// render, so visitors never see the placeholder content flash by.
Promise.all([loadSiteData(), initialSession().catch(() => false)]).then(([, isAdmin]) => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <SiteProvider initialAdmin={isAdmin}>
          <App />
        </SiteProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
});
