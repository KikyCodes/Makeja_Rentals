# Makeja Rentals 🏠

The #1 rental marketplace for students and young professionals in Machakos, Kenya.

## Tech Stack

- **Frontend**: Next.js 16 + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Deployment**: Netlify + @netlify/plugin-nextjs

## Getting Started

### 1. Install dependencies

```bash
node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. Run `supabase-schema.sql` in your Supabase SQL editor
3. Create Storage buckets: `property-images` (public) and `avatars` (public)
4. Enable Google Auth in Authentication → Providers

### 3. Configure environment

```bash
cp .env.local.example .env.local
# Fill in your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 4. Run dev server

```bash
node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deploy to Netlify

1. Push to GitHub: `git init && git add . && git commit -m "Initial commit"`
2. Connect repo to Netlify
3. Set env vars in Netlify dashboard (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`)
4. Build command: `npm run build` — Netlify picks this up from `netlify.toml`

## Project Structure

```
src/
├── app/               # Next.js App Router pages
│   ├── page.tsx       # Homepage
│   ├── listings/      # Property browser + detail
│   ├── roommates/     # Roommate finder
│   ├── dashboard/     # Landlord dashboard + add listing
│   ├── admin/         # Admin panel
│   ├── auth/          # Login / signup
│   ├── saved/         # Saved properties
│   └── profile/       # User profile
├── components/        # All UI components
├── lib/               # Supabase clients, utils, constants
└── types/             # TypeScript interfaces
```

## Monetization Ideas

1. Featured listings — KES 500/month to boost visibility
2. Verified landlord badge — KES 1,000 one-time fee
3. Premium tenant — KES 200/month for early access alerts
4. M-Pesa deposit handling (future)
5. Landlord analytics pro plan

## Roadmap

- [ ] Real-time messaging (Supabase Realtime)
- [ ] M-Pesa integration for deposits
- [ ] Interactive map with property markers
- [ ] Mobile app (React Native)
- [ ] AI listing recommendations
- [ ] Virtual property tours

---

Made with ❤️ for Machakos students.
