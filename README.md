# HanhAtelier

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Two modes

| | Local preview (no `.env`) | Published (Supabase configured) |
|---|---|---|
| Where edits are saved | this browser only (localStorage) | Supabase — every visitor sees them |
| Owner login | password `10082002`, checked in the browser | the owner's Supabase account, checked by Supabase |
| Photos | inside localStorage (~5 MB total) | Supabase Storage (1 GB on the free plan) |

While logged in, the owner can change the hero photo, add/edit/remove nail designs, gallery
photos, prices, the footer and the profile. Changes save automatically.

## Publishing

### 1. Supabase (database, photos, login) — free, no credit card

1. Sign up at <https://supabase.com> and create a project (any name, choose a region near you).
2. **Create the owner's login:** Authentication → Users → *Add user* → *Create new user*.
   Enter the owner's email and a strong password, and tick *Auto Confirm User*.
3. **Block anyone else from signing up:** Authentication → Sign In / Providers →
   turn off *Allow new users to sign up*.
4. **Create the tables and photo storage:** open [supabase/setup.sql](supabase/setup.sql), replace
   `owner@example.com` (3 places) with the owner's email, then paste it into
   SQL Editor → *New query* → *Run*.
5. Project Settings → API Keys (called "API" in older dashboards): copy the **Project URL** and the
   **anon / publishable** key (never the secret / service_role key).

### 2. Connect the site

Copy `.env.example` to `.env` and fill in the URL, the anon key and the owner's email.
Run `npm run dev`, log in with the owner's password and make an edit, then open the site in a
private window: the edit should be there too.

> The anon key is safe to publish. The security comes from the rules in `setup.sql`:
> anyone can read, only the owner's account can change anything.

### 3. Put it online (Netlify or Vercel, both free)

**Netlify, quickest:** run `npm run build`, then drag the `dist` folder onto
<https://app.netlify.com/drop>.

**Netlify or Vercel from GitHub** (rebuilds automatically after every change): push this folder
to a GitHub repo, import it on Netlify/Vercel, and set
- Build command: `npm run build`, output folder: `dist`
- Environment variables: the three `VITE_…` values from your `.env`

`public/_redirects` (Netlify) and `vercel.json` (Vercel) make links like `/profile` work on refresh.

### 4. Your own domain (optional)

Buy one (e.g. `hanhatelier.com`, about $10–15/year) and add it under the site's
*Domain settings* on Netlify/Vercel; they walk you through it and add HTTPS for free.

## Structure

```
src/
  context/SiteContext.jsx   all site data + admin state
  hooks/useSyncedState.js   useState that saves to Supabase (or localStorage in preview)
  lib/backend.js            Supabase client, loading, saving, photo uploads
  lib/auth.js               owner login / logout
  pages/                    Home, Profile
  components/               Navbar, Hero, NailGrid, NailCard, DesignModal, CropModal, Footer, ...
supabase/setup.sql          one-time database + storage setup
```
