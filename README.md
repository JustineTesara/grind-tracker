# GRIND. — Routine Tracker

<div align="center">

![GRIND Banner](https://img.shields.io/badge/GRIND-Routine%20Tracker-3dd68c?style=for-the-badge&labelColor=0d0d0f)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white&labelColor=0d0d0f)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white&labelColor=0d0d0f)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white&labelColor=0d0d0f)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase&logoColor=white&labelColor=0d0d0f)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-ffffff?style=flat-square&logo=vercel&logoColor=white&labelColor=0d0d0f)

**A full-stack fitness tracking web app — built from scratch as a personal portfolio project.**

[Live Demo](https://grind-tracker-kappa.vercel.app) · [Report Bug](https://github.com/JustineTesara/grind-tracker/issues) · [Request Feature](https://github.com/JustineTesara/grind-tracker/issues)

</div>

---

## 📸 Screenshots

| Calendar Dashboard                                                    | Log Activity                                                         | Weekly Summary                                                             |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| ![Calendar](https://placehold.co/320x200/141416/3dd68c?text=Calendar) | ![Log](https://placehold.co/320x200/141416/ff6b35?text=Log+Activity) | ![Summary](https://placehold.co/320x200/141416/3b9eff?text=Weekly+Summary) |

> Replace the placeholders above with actual screenshots of your app.

---

## ✨ Features

### 🗓️ Calendar Dashboard

- Monthly calendar view with color-coded activity pills
- Click any day to log a new activity or view existing entries
- Month navigation with previous/next controls
- Today's date highlighted with a green accent

### 🏋️ Activity Logging

- **Running** — distance (km), duration, training zone, notes
- **Cycling** — distance (km), duration, training zone, notes
- **Gym** — exercise search with autocomplete, sets × reps × weight (kg/lbs toggle)
- **Rest Day** — recovery day tracking
- Edit and delete existing activities
- Effort level with cardio zone classification (Z1–Z5)

### 📊 Weekly & Monthly Summary

- Progress bars for running distance, cycling distance, gym sessions, and active days
- Active days count and total minutes per week
- Export weekly or monthly data as a **CSV spreadsheet** (Excel-compatible)

### ⚡ Coach Feedback

- Personalized weekly feedback based on logged activities
- Fitness score (0–100) calculated from cardio, strength, and consistency
- Color-coded improvement tips (good / warning / needs work)

### 🔐 Authentication

- Email and password sign up / log in via Supabase Auth
- Protected routes — dashboard only accessible when logged in
- Secure Row Level Security — users can only access their own data

### 📱 Responsive Design

- Fully responsive across desktop, tablet, and mobile
- Hamburger menu with animated drawer on mobile
- Dark minimal theme throughout

---

## 🛠️ Tech Stack

| Layer           | Technology              | Purpose                                 |
| --------------- | ----------------------- | --------------------------------------- |
| Frontend        | React 18 + Vite         | UI framework and fast dev server        |
| Styling         | Tailwind CSS v4         | Utility-first dark theme                |
| Routing         | React Router v6         | Client-side page navigation             |
| Database        | PostgreSQL (Supabase)   | Managed database with real-time support |
| Auth            | Supabase Auth           | Email/password authentication with JWT  |
| Backend         | Supabase Edge Functions | Serverless API close to the database    |
| Deployment      | Vercel                  | Frontend CDN with CI/CD on git push     |
| Version Control | Git + GitHub            | Source control and collaboration        |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account

### 1. Clone the repository

```bash
git clone https://github.com/JustineTesara/grind-tracker.git
cd grind-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

Create a new project at [supabase.com](https://supabase.com), then run the following SQL in the **SQL Editor**:

```sql
-- Create activities table
create table public.activities (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references auth.users on delete cascade not null,
  date              date not null,
  type              text check (type in ('run','cycle','gym','rest')) not null,
  duration_hours    integer default 0,
  duration_minutes  integer default 0,
  distance          numeric(6,2),
  workout_list      text,
  effort            integer check (effort between 1 and 10),
  notes             text,
  weight_unit       text default 'kg' check (weight_unit in ('kg', 'lbs')),
  created_at        timestamptz default now()
);

-- Enable Row Level Security
alter table public.activities enable row level security;

-- Users can only access their own data
create policy "Users manage own activities"
  on public.activities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Build for production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
grind-tracker/
├── public/
├── src/
│   ├── components/
│   │   ├── ActivityDetailModal.jsx   # View/edit/delete activity
│   │   ├── Calendar.jsx              # Monthly calendar grid
│   │   ├── ExerciseSearch.jsx        # Autocomplete exercise input
│   │   ├── LogActivityModal.jsx      # Log/edit activity form
│   │   ├── Sidebar.jsx               # Navigation (desktop + mobile drawer)
│   │   └── Topbar.jsx                # Header with month nav and log button
│   ├── context/
│   │   └── AuthContext.jsx           # Global auth state via Supabase
│   ├── hooks/
│   ├── lib/
│   │   ├── api.js                    # Supabase CRUD operations
│   │   ├── exercises.js              # Exercise database for autocomplete
│   │   ├── exportData.js             # CSV export + stats computation
│   │   ├── supabase.js               # Supabase client singleton
│   │   └── zones.js                  # Cardio training zone definitions
│   ├── pages/
│   │   ├── Auth.jsx                  # Login and signup page
│   │   └── Dashboard.jsx             # Main app page
│   ├── App.jsx                       # Routes and auth protection
│   ├── index.css                     # Global styles + Tailwind import
│   └── main.jsx                      # React entry point
├── .env                              # Local environment variables (not committed)
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## 🌐 Deployment

This project is deployed on **Vercel** with automatic deployments on every push to `main`.

### Deploy your own

1. Push this repo to GitHub
2. Import the project at [vercel.com](https://vercel.com)
3. Set the **Root Directory** to `grind-tracker`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**

---

## 🗺️ Roadmap

- [ ] Strava API integration — auto-import runs and rides
- [ ] Push notifications for workout reminders
- [ ] Export as PDF monthly report
- [ ] PWA support for offline use and home screen install
- [ ] Heart rate zone analysis from GPS watch data
- [ ] Social features — share weekly stats

---

## 👩‍💻 About the Developer

**Justine Tesara** — IT Graduate | Aspiring Software Developer

This project was built as part of my personal portfolio to demonstrate full-stack development skills including React frontend architecture, Supabase backend integration, PostgreSQL database design, authentication, responsive UI design, and cloud deployment.

- 🔗 GitHub: [@JustineTesara](https://github.com/JustineTesara)
- 📧 justine.tesara0907@gmail.com

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with 💚 by Justine Tesara**

_Track every rep. Every km. Every day._

</div>
