# Family Tree (Node + Express + EJS + Mongoose)

Family tree project based on the Stitch design direction in this folder, with:
- Public family tree + member profile pages
- Single-admin login and member management
- SEO support (`title`, `description`, canonical)
- Open Graph + Twitter metadata

## Tech Stack
- Node.js
- Express
- EJS
- Mongoose
- express-session + connect-mongo

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` values, especially:
   - `MONGODB_URI`
   - `SESSION_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
4. (Optional) Seed sample members:
   ```bash
   npm run seed
   ```
5. Start app:
   ```bash
   npm run dev
   ```

Open `http://localhost:3000`.

## Routes
- `GET /` public family tree
- `GET /dashboard` home dashboard
- `GET /news` news and events feed
- `GET /calendar` family calendar
- `GET /map` family map
- `GET /gallery` achievements gallery
- `GET /discussions` discussion boards
- `GET /recipes` family recipes
- `GET /archives` digital attic archives
- `GET /members/:slug` profile details
- `GET /admin/login` admin login
- `GET /admin` admin dashboard (protected)
- `GET /admin/members/new` create member form (protected)
- `GET /admin/members/:id/edit` edit member form (protected)
- `GET /admin/content/:type` manage module entries (protected)
- `GET /admin/content/:type/new` add module entry (protected)
- `GET /admin/content/:type/:id/edit` edit module entry (protected)

## Notes
- This version uses one admin account from environment variables.
- Member and module images can be set via URL or direct upload.
- You can upload images from admin forms; files are stored in `public/uploads`.
- All public pages are dynamic and powered by MongoDB content collections.
- You can ask for next changes (tree connectors, uploads, richer roles, etc.) and we can extend it.
