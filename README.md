# සත්කාර (Sathkara)

ඔබගේ සත්කාර සදා මතකයේ තබාගන්න — A digital merit/donation record book ("pin potha") platform.

## Current stage: Setup + Design System

This is **Stage 1** of the project. Included so far:

- Next.js 14 App Router project structure
- Tailwind CSS with the Sathkara color palette
- Poppins (English) + Noto Sans Sinhala fonts
- Sinhala/English language toggle (saved in localStorage)
- Minimal homepage with hero banner
- Firebase config file (Firestore + Auth ready, not yet wired to UI)
- Cloudinary config file (ready for image uploads, not yet wired to UI)

## Not yet built (coming in later stages)

- Auth (signup/login)
- User profile create/edit (bio, profile picture)
- Add donation form (title, date, location, description, category, image, public/private toggle)
- Homepage donation feed
- Single donation page (with donor profile link)
- Single user profile page
- Well-wish comments
- Admin panel

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and fill in your Firebase + Cloudinary credentials:
   ```bash
   cp .env.local.example .env.local
   ```

   - Firebase values: Firebase Console → Project Settings → General → Your apps
   - Cloudinary values: Cloudinary Dashboard

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## Deploy

Push this project to a GitHub repo, then import it on [vercel.com](https://vercel.com). Add the same environment variables from `.env.local` into Vercel's Project Settings → Environment Variables before deploying.
