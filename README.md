# Harshit Rai — Developer Portfolio

A high-performance, responsive developer portfolio engineered with **React 18**, **Vite 6**, **Tailwind CSS**, and **Firebase 11**, deployed on **Vercel** with global edge caching and Single Page Application (SPA) routing.

- **Production Live URL:** [harshit-rai-portfolio.vercel.app](https://harshit-rai-portfolio.vercel.app)
- **Primary Domain:** [harshitrai.com](https://harshitrai.com)
- **GitHub Repository:** [harshzzzr/Harshit-Rai-Portfolio](https://github.com/harshzzzr/Harshit-Rai-Portfolio)
- **Author:** [Harshit Rai (harshzzzr)](https://github.com/harshzzzr)

---

## Architecture & Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18.3 | Concurrent rendering, route-level code splitting (`React.lazy`, `Suspense`) |
| **Build Tool & Bundler** | Vite 6.0 | ESNext modules, Rollup chunk splitting, lightning-fast HMR |
| **Styling & Design System** | Tailwind CSS 3.4 | Custom semantic palette, dark/light theme support, responsive (320px–1920px) |
| **Routing** | React Router DOM 6.28 | Client-side routing with protected admin routes and deep-linking support |
| **Backend & Cloud Services** | Firebase 11.19 | Cloud Firestore, Firebase Storage, Firebase Authentication |
| **Icons** | Lucide React | Lightweight, accessible SVG icons |
| **Primary Deployment** | Vercel Edge Network | Automated CI/CD from `master`, SPA rewrite engine, custom HTTP headers |
| **Secondary Hosting** | Firebase Hosting | Configured via `firebase.json` with multi-region CDN fallbacks |

---

## Major Recent Implementations

### 1. Vercel Production Deployment & SPA Deep-Linking
- Configured dedicated [`vercel.json`](./vercel.json) tailored for Vite Single Page Applications:
  - **Catch-All SPA Rewrites:** Routes all deep requests `/(.*)` to `/index.html` preventing HTTP 404 errors upon direct navigation or browser refresh on sub-routes (`/privacy`, `/terms`, `/admin/login`, `/projects/:id`).
  - **Asset Caching:** 1-year immutable cache header (`public, max-age=31536000, immutable`) for hashed assets under `/assets/`.
  - **Production Security Headers:** Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`, and restrictive `Permissions-Policy`.

### 2. Hardened Single-Administrator Authentication
- **Strict Account Restriction:**
  - Admin access is locked down exclusively to **`harshittrrai@gmail.com`**.
  - All unauthorized email addresses are rejected at the authentication gateway with explicit access denial.
  - Eradicated all legacy demo credentials (`admin@harshitrai.dev`, `admin@harshitrai.com`, `admin123`).
- **Pristine, Blank Input Experience:**
  - In [`src/pages/AdminLoginPage.jsx`](./src/pages/AdminLoginPage.jsx), removed all placeholder values so both email and password boxes are completely clean on load with zero prewritten text or dot symbols.
  - Added `autoComplete="off"` and `autoComplete="new-password"` along with disabled spell-checking and capitalization to suppress intrusive browser credential autofill.
- **Dual Layer Session Management:**
  - Integrates seamlessly with live Firebase Authentication tokens while maintaining an authenticated fallback session for administrative continuity.

### 3. Database & Storage Security Rules
- **Firestore Rules ([`firestore.rules`](./firestore.rules)):**
  - Public read access is strictly limited to verified, published entries (`resource.data.visible == true`).
  - Contact messages enforce strict schema validation (`name`, `email`, `subject`, `message`, length bounds).
  - All create, update, and delete privileges on administrative collections are restricted strictly to `harshittrrai@gmail.com`.
- **Storage Rules ([`storage.rules`](./storage.rules)):**
  - Image assets limited to verified MIME types under 5 MB.
  - Resume files limited to PDF under 10 MB.
  - Upload and deletion rights restricted exclusively to `harshittrrai@gmail.com`.

### 4. Legal Compliance & Governance
- **Privacy Policy Page ([`/privacy`](https://harshit-rai-portfolio.vercel.app/privacy)):** Transparent disclosure covering analytics telemetry, contact forms, data retention, user rights under GDPR/CCPA, and third-party services.
- **Terms & Conditions Page ([`/terms`](https://harshit-rai-portfolio.vercel.app/terms)):** Clear intellectual property boundaries, licensing, acceptable use, liability limits, and governing jurisdiction.

### 5. Verified Git Commit Identity
- Re-attributed all 34 commits across the repository history to the author's verified GitHub identity **`harshzzzr` (`harshittrrai@gmail.com`)**.
- Replaced outdated noreply handles, ensuring all repository contributions, timestamps, and commit graphs correctly attribute to [github.com/harshzzzr](https://github.com/harshzzzr).

### 6. Engineering UI & Anti-Slop Principles
- **No AI Slop / Vibe-Coded Aesthetics:** Zero purple gradients, zero pill-shaped buttons, zero generic copy, zero fake review carousels, and zero fabricated customer statistics.
- **Accessible & High-Contrast:** Built using clean slate palettes, monospaced typography accents for engineering data, accessible ARIA landmarks, and keyboard focus outlines.

---

## Project Structure

```text
Portfolio/
├── .env.example              # Environment variables template
├── .firebaserc               # Firebase project target binding
├── .gitignore                # Git ignore rules (.env, dist/, node_modules/)
├── firebase.json             # Firebase Hosting rewrites & security rules mapping
├── firestore.indexes.json    # Firestore composite index definitions
├── firestore.rules           # Cloud Firestore granular security rules
├── index.html                # HTML5 entry with JSON-LD, SEO tags & font preloads
├── package.json              # Project scripts and dependencies
├── postcss.config.js         # PostCSS configuration for Tailwind
├── storage.rules             # Firebase Cloud Storage access control rules
├── tailwind.config.js        # Tailwind CSS theme extensions & typography
├── vercel.json               # Vercel SPA rewrites, caching & security headers
├── vite.config.js            # Vite build pipeline & Rollup code splitting
│
├── public/                   # Static production assets
│   ├── favicon.svg           # High-resolution vector favicon
│   ├── robots.txt            # Search engine crawler policies
│   ├── site.webmanifest      # Progressive Web App manifest
│   ├── sitemap.xml           # XML sitemap for SEO discovery
│   └── images/               # Open Graph and social share previews
│
└── src/
    ├── App.jsx               # Top-level routing, suspense boundaries, layout
    ├── main.jsx              # Application bootstrap & DOM root mounting
    ├── components/           # Reusable UI modules
    │   ├── Navbar.jsx        # Responsive navigation with dark mode toggle
    │   ├── Footer.jsx        # Semantic footer, version tag, legal links
    │   ├── Hero.jsx          # Engineering introduction & key specializations
    │   ├── About.jsx         # Academic background & technical foundations
    │   ├── Skills.jsx        # Categorized technical competencies
    │   ├── Projects.jsx      # Project grid with filtering & detail views
    │   ├── Experience.jsx    # Engineering experience & internship timeline
    │   ├── Contact.jsx       # Contact form with Firestore persistence
    │   ├── ProtectedRoute.jsx# Auth guard for admin console access
    │   ├── SEO.jsx           # Dynamic document title & meta tags injector
    │   └── admin/            # Administrative management suites
    │       ├── ProjectManager.jsx     # CRUD suite for portfolio projects
    │       ├── SkillManager.jsx       # Skill & proficiency level editor
    │       ├── MessageViewer.jsx      # Inbox for incoming contact submissions
    │       └── AnalyticsDashboard.jsx # Telemetry, view counts & referral data
    ├── context/              # Global React contexts
    │   ├── AuthContext.jsx   # Authentication state, login & logout dispatchers
    │   └── ThemeContext.jsx  # Dark/Light theme state with localStorage sync
    ├── data/
    │   └── portfolioData.js  # Static fallback data for offline resilience
    ├── firebase/
    │   ├── config.js         # Firebase SDK initialization & verification
    │   └── collections.js    # Standardized Firestore collection identifiers
    ├── layouts/
    │   ├── MainLayout.jsx    # Public shell with Navbar and Footer
    │   └── AdminLayout.jsx   # Admin console shell with sidebar navigation
    ├── pages/                # Route views (code-split)
    │   ├── HomePage.jsx             # Primary portfolio single-page presentation
    │   ├── ProjectDetailPage.jsx    # In-depth architectural case studies
    │   ├── PrivacyPolicyPage.jsx    # Legal privacy disclosures
    │   ├── TermsPage.jsx            # Legal terms of service
    │   ├── AdminLoginPage.jsx       # Hardened single-account login gateway
    │   ├── AdminDashboardPage.jsx   # Central administrative operations panel
    │   └── NotFoundPage.jsx         # Custom 404 error experience
    └── services/             # Data access & operational services
        ├── authService.js    # Single-admin authentication & session logic
        ├── projectService.js # Firestore project sync with local cache
        ├── messageService.js # Contact form transmission & inbox management
        ├── analyticsService.js# Privacy-focused view & referral telemetry
        └── storageService.js # File upload pipeline to Cloud Storage
```

---

## Environment Variables

Copy `.env.example` to `.env` in the root directory to configure the environment:

```bash
cp .env.example .env
```

| Variable | Required | Description |
| :--- | :---: | :--- |
| `VITE_FIREBASE_API_KEY` | Yes | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | Firebase Auth domain (`*.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase Project ID (`harshit-rai-portfolio`) |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | Cloud Storage bucket address |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | Cloud Messaging sender identifier |
| `VITE_FIREBASE_APP_ID` | Yes | Firebase Web App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Optional | Google Analytics measurement ID |
| `VITE_GITHUB_USERNAME` | Yes | Verified GitHub username (`harshzzzr`) |
| `VITE_GITHUB_URL` | Yes | Verified GitHub profile URL |
| `VITE_LINKEDIN_URL` | Yes | Verified LinkedIn profile URL |
| `VITE_LEETCODE_USERNAME` | Yes | Verified LeetCode username (`GkKWasfX4F`) |
| `VITE_LEETCODE_URL` | Yes | Verified LeetCode profile URL |
| `VITE_SPOTIFY_USERNAME` | Optional | Verified Spotify user identifier |
| `VITE_SPOTIFY_URL` | Optional | Verified Spotify profile URL |

> [!IMPORTANT]
> Never commit `.env` or any private credentials to source control. The `.gitignore` file explicitly ignores `.env` and `.env.*` files.

---

## Getting Started

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/harshzzzr/Harshit-Rai-Portfolio.git
cd Harshit-Rai-Portfolio

# Install dependencies
npm install
```

### Local Development
```bash
npm run dev
```
The application will start on `http://localhost:5173`.

### Production Build
```bash
npm run build
```
Generates an optimized, minified production build in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```
Spins up a local HTTP server to preview the contents of `dist/`.

---

## Deployment Workflows

### 1. Vercel (Production)
- Pushing to branch `master` automatically triggers a zero-downtime deployment on Vercel.
- Environment variables must be mirrored in the **Vercel Dashboard > Project Settings > Environment Variables**.
- SPA rewrites, clean URLs, and HTTP security headers are handled via [`vercel.json`](./vercel.json).

### 2. Firebase (Rules & Indexes)
Deploy updated Firestore security rules, indexes, and Storage rules using the Firebase CLI:
```bash
# Deploy Firestore security rules and composite indexes
firebase deploy --only firestore

# Deploy Storage security rules
firebase deploy --only storage

# Deploy Firebase Hosting (if using Firebase as CDN)
firebase deploy --only hosting
```

---

## Developer Profiles & Contact

- **Name:** Harshit Rai
- **Email:** [harshittrrai@gmail.com](mailto:harshittrrai@gmail.com)
- **GitHub:** [@harshzzzr](https://github.com/harshzzzr)
- **LinkedIn:** [harshit-rai-](https://www.linkedin.com/in/harshit-rai-/)
- **LeetCode:** [GkKWasfX4F](https://leetcode.com/u/GkKWasfX4F/)
- **Spotify:** [Harshit Rai](https://open.spotify.com/user/31b6a5xevyjjpxunwv3fr2f662mu)

---

## License

This project is licensed under the MIT License — see the [Terms & Conditions](/terms) page for additional details.
