# Harshit Rai — Developer Portfolio

A high-performance, responsive personal developer portfolio engineered with **React 18**, **Vite 6**, and **Tailwind CSS**, powered by **Firebase** and deployed on **Vercel**.

🌐 **Production URL:** [https://harshit-rai-portfolio.vercel.app/](https://harshit-rai-portfolio.vercel.app/)

---

## 📌 Overview

This repository contains the production source code for the personal developer portfolio of **Harshit Rai**, a Computer Engineering undergraduate specializing in full-stack web applications, C++ systems programming, and algorithmic problem solving.

The platform is designed to provide recruiters, engineering teams, and collaborators with an interactive, accessible, and comprehensive showcase of engineering projects, real-time platform activity, verified technical skills, and academic background.

---

## 🚀 Key Features

### 🔍 Project Search & Multi-Faceted Filtering
- **Real-Time Client-Side Search:** Instant filtering across project titles, descriptions, categories, and technical stacks without redundant network requests.
- **Dynamic Category & Tech Filters:** Filter projects by domain (Web, Systems, Embedded, Mobile) and specific technologies (React, C++, Node.js, Arduino, etc.) with active indicator badges.
- **Combined Search & Filter State:** Smooth combination of search query and category filters with dedicated empty states and a one-click "Clear Filters" reset.

### ⚡ Performance, UX & Motion
- **Accessible Skeleton Loaders:** Custom, motion-safe pulse skeletons for asynchronous operations (projects catalog, GitHub repositories, LeetCode statistics, Spotify playback, and admin tables).
- **Graceful Error Fallbacks:** Network-resilient UI with informative, user-friendly messages and retry buttons (no raw error traces exposed).
- **Smart Scroll-to-Top:** Automatically resets scroll position upon route transitions while preserving smooth scrolling for in-page anchors (`#projects`, `#about`, `#contact`).
- **One-Click Email Copy:** Interactive action copying Harshit's verified email (`harshittrrai@gmail.com`) directly to the clipboard with visual toast feedback and robust manual fallback.

### 🌐 Live Ecosystem Integrations
- **GitHub Integration:** Fetches public repositories, follower counts, and language breakdowns via the GitHub REST API.
- **LeetCode Integration:** Displays verified problem-solving metrics (Easy, Medium, Hard breakdown) and algorithmic topic proficiencies.
- **Spotify Real-Time Audio:** Shows currently playing focus tracks or curated programming soundtracks via the Spotify API.

### 🔒 Modernized Admin Console 2.0
- **Restricted Single-Admin Authentication:** Secured exclusively for Harshit Rai (`harshittrrai@gmail.com`) via Firebase Authentication and route-level protection guards.
- **Project Catalog Management:** Create, edit, feature, and toggle visibility of engineering projects with Firestore persistence.
- **Message & Feedback Moderation:** Review contact inquiries, archive messages, and approve public testimonial feedback.
- **Analytics Dashboard:** Monitor visit events and page views with localized tracking and administrative reset capabilities.
- **Portaled Modals & Unified Notifications:** Accessible modal dialogs and centralized toast notification system supporting Success, Error, Warning, and Info alerts.

### 📈 Technical SEO & Search Discoverability
- **Schema.org Structured Data Graph:** Comprehensive JSON-LD `@graph` linking `WebSite`, `ProfilePage`, and `Person` entities with cross-referenced `@id`s and verified `sameAs` social profiles.
- **Project Detail SEO & Breadcrumbs:** Unique title (`${project.title} | Harshit Rai`), metadata descriptions, and `BreadcrumbList` + `SoftwareSourceCode` schemas.
- **Strict Indexation Controls:** Verified `public/robots.txt` and XML sitemap (`public/sitemap.xml`) with dynamic `noindex, nofollow` on admin routes and 404 error states.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, React DOM |
| **Routing** | React Router DOM 6 (SPA with deep-link rewrites) |
| **Styling & Icons** | Tailwind CSS 3, PostCSS, Autoprefixer, Lucide React |
| **Build & Tooling** | Vite 6, ESLint 9 |
| **Testing Suite** | Vitest 2, React Testing Library, JSDOM |
| **Backend & Cloud** | Firebase 12 (Cloud Firestore, Authentication, Cloud Storage) |
| **Hosting & CDN** | Vercel Edge Network |

---

## 📁 Project Structure

```text
├── public/                 # Static assets, sitemap.xml, robots.txt, webmanifest
├── src/
│   ├── components/         # Reusable UI components (Hero, Projects, SEO, Modals, Toasts)
│   ├── config/             # Central site configuration (metadata, URLs, social links)
│   ├── context/            # Global React contexts (AuthContext, ThemeContext)
│   ├── data/               # Seed data, portfolio facts, and local fallbacks
│   ├── pages/              # Route view pages (HomePage, ProjectDetail, Admin, Legal)
│   ├── services/           # Firebase APIs, GitHub, LeetCode, Spotify, input validation
│   ├── App.jsx             # Root application component and route definitions
│   └── main.jsx            # React 18 DOM mount and top-level providers
├── tests/                  # Vitest unit & integration test suites
│   ├── components/         # Component rendering, search/filter, and SEO tests
│   ├── context/            # Theme and state provider tests
│   ├── routes/             # ProtectedRoute guard tests
│   └── services/           # Validation and service tests
├── index.html              # HTML5 entrypoint with pre-rendered SEO & Schema.org graph
├── tailwind.config.js      # Design tokens, color palettes, and animation utilities
├── vite.config.js          # Vite configuration and build chunk optimizations
└── vercel.json             # Vercel SPA routing rewrites and cache headers
```

---

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### 1. Clone & Install

```bash
git clone https://github.com/harshzzzr/Harshit-Rai-Portfolio.git
cd Harshit-Rai-Portfolio
npm install
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Populate the required environment variables:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 3. Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts the local development server at `http://localhost:5173` |
| **Build** | `npm run build` | Bundles and minifies production assets into `dist/` |
| **Preview** | `npm run preview` | Locally serves the production `dist/` build |
| **Lint** | `npm run lint` | Runs ESLint across all JavaScript and JSX source files |
| **Test** | `npm test` | Executes all 13 test suites via Vitest |

---

## 🧪 Testing & Quality Assurance

The codebase includes comprehensive unit and integration testing covering UI interactions, services, route guards, input validation, and SEO:

```bash
npm test
```

- **13 Test Suites / 61 Unit Tests** passing with zero warnings.
- **Covered Areas:** Search & filter behavior, contact form validation, feedback sanitization, protected route authentication guards, theme switching, project services, copy-to-clipboard action, and SEO metadata/canonical/structured data synchronization.

---

## 📬 Contact & Verified Profiles

- **Email:** [harshittrrai@gmail.com](mailto:harshittrrai@gmail.com)
- **GitHub:** [@harshzzzr](https://github.com/harshzzzr)
- **LinkedIn:** [harshit-rai-](https://www.linkedin.com/in/harshit-rai-/)
- **LeetCode:** [GkKWasfX4F](https://leetcode.com/u/GkKWasfX4F/)
- **Spotify:** [Harshit Rai](https://open.spotify.com/user/31b6a5xevyjjpxunwv3fr2f662mu)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
