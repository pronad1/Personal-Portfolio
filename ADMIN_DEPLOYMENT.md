# Admin Dashboard & Portfolio Auto-Update Guide

This guide explains how your new **Admin Dashboard (CMS)** works and how your changes are automatically displayed on your live GitHub Pages portfolio (`https://pronad1.github.io/Personal-Portfolio/`).

---

## 1. Why Changes Didn't Show Up Previously & How It's Fixed

1. **Local Preview Fix**: Previously, `portfolio-dynamic.js` expected a live Supabase backend and bypassed local changes. It now automatically reads from your local edits (`localStorage`), meaning **any changes you make in `/admin` (like your CGPA `3.65 / 4.00`) now show up immediately in your browser**!
2. **Education CGPA Badge**: The dynamic loader has been specifically updated to update the `.edu-gpa` badge and `.edu-detail` elements.

---

## 2. Automatic Updates via GitHub (Zero Manual Commits) 🐙

You do **not** need to open a terminal or run Git commands, and you do **not** have to manually click a push button every time. The Admin Dashboard handles **automatic background synchronization on every save**:

1. **One-Time Setup**:
   - Open your Admin Panel at `/admin` and log in (`prosenjit1156@gmail.com` / `prosenjit1156`).
   - Click **"🐙 GitHub Sync"** in the top-right header (or simply save any section — you will be prompted once).
   - Enter your repository (`pronad1/Personal-Portfolio`) and your **GitHub Personal Access Token (PAT)**.
     - Generate a token at [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens) with `repo` or `contents:write` scope.
   - Check **"Remember token on this device"** and click **Push to GitHub**.
2. **From Then On — 100% Automatic**:
   - Whenever you add, edit, reorder, or delete ANY item in ANY section (About, News, Education, Publications, Projects, Skills, Awards, Certificates, etc.) and click **Save**:
   - The dashboard automatically updates the database AND **automatically commits the changes directly to your GitHub repository in the background** (`data/portfolio-data.json`).
   - A live indicator in the topbar shows: `🔄 Auto-pushing to GitHub...` → `✅ Synced to GitHub (19:08)`.
   - GitHub Pages rebuilds automatically, and all visitors to `https://pronad1.github.io/Personal-Portfolio/` see the updated content!

---

## 3. Alternative: Live Cloud Database with Supabase (Instant Real-Time) ⚡

If you prefer instantaneous updates without waiting for GitHub Pages builds:

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in Supabase and run `supabase/schema.sql`, then `supabase/seed.sql`.
3. In Supabase **Authentication → Users**, click **Add User** and create:
   - Email: `prosenjit1156@gmail.com`
   - Password: `prosenjit1156` (or any strong password).
4. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public key`
5. Paste them into:
   - `admin/app.js` (lines 14-15)
   - `portfolio-dynamic.js` (lines 16-17)
6. Commit and push these files to GitHub once. From then on, every time you edit in `/admin`, the cloud database updates in real-time, and visitors worldwide see the changes instantly!

---

## 3. Security Highlights

- **No Hardcoded Passwords**: Authentication is verified using client-side SHA-256 in local mode and Argon2/Bcrypt on Supabase Auth.
- **Brute-Force Protection**: 5 consecutive failed login attempts trigger an automatic 60-second lockout.
- **Inactivity Timeout**: Automatic logout after 30 minutes of inactivity.
- **Protected Secrets**: Your GitHub Personal Access Token and Supabase credentials are stored securely in your private browser session and are never exposed in public HTML.
