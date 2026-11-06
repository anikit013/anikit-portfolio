# Anikit Kumar Chaudhary — Portfolio

A modern, high-performance multilingual (English / नेपाली / Deutsch) portfolio site engineered with vanilla HTML5, CSS3, and JavaScript — zero build step, zero frameworks, ready for GitHub Pages.

## ✨ Features

- **Service Mesh Aesthetic**: Tailored for a backend & distributed systems engineer with animated SVG data packet mesh, deep signal-navy surfaces, amber/teal data-link accents, and mouse spotlights.
- **Interactive Developer CLI (`zsh`)**: Press `` ` `` (backtick) or click `$ whoami` in the hero to launch an interactive terminal with commands (`help`, `whoami`, `skills`, `projects`, `contact`, `email`, `cv`, `theme`, `clear`, `exit`) and command history navigation (Up/Down arrow keys).
- **Trilingual i18n**: Real-time seamless switching across English (`en`), German (`de`), and Nepali (`ne`) with automatic browser language detection and persistence.
- **Project Filtering & WebP Optimization**: Categorised tabs (`All`, `Backend & Cloud`, `Full-Stack`, `AI & Machine Learning`), project badges (`[Open Source]`, `[Enterprise Core]`), and lightweight next-gen WebP images (>90% payload reduction).
- **German Werkstudent Positioning**: Clear availability badges, working permissions (20h/wk semester / 40h/wk break), and location context for German recruiters and hiring managers.
- **1-Click Copy & Toast System**: Non-intrusive floating toasts for email copy, theme changes, and CLI actions.
- **Zero-Flicker Pre-Render**: Full initial English content pre-rendered in `index.html` for instant First Contentful Paint and SEO/social scraper visibility.
- **Open Graph Ready**: High-resolution `og-cover.jpg` with dark mode branding for rich social sharing cards on LinkedIn, Twitter/X, and WhatsApp.
- **Print / PDF Optimized**: Clean `@media print` rules for clean single/two-page resume printout via `Ctrl+P` / `Cmd+P`.

## 📁 Folder Structure

```
.
├── index.html                 ← Complete pre-rendered HTML5 application
├── README.md                  ← Project documentation
├── .nojekyll                  ← Bypasses Jekyll processing on GitHub Pages
├── assets/
│   ├── css/
│   │   └── style.css          ← Modern design tokens, glassmorphism, responsive & print styles
│   ├── js/
│   │   └── main.js            ← i18n, interactive CLI, filtering, copy toast, mesh animation
│   ├── img/
│   │   ├── hero-portrait.png  ← Hero portrait with 3D perspective orbit
│   │   ├── about-portrait.png ← Integrated about bio portrait
│   │   ├── og-cover.jpg       ← 1200x630px Open Graph card for social previews
│   │   └── projects/          ← Next-gen WebP & high-res PNG project thumbnails
│   └── Anikit_CV.pdf          ← Downloadable CV
└── lang/
    ├── en.json                ← English text & project metadata
    ├── ne.json                ← Nepali text & project metadata
    └── de.json                ← German text & project metadata
```

## ⌨️ Keyboard Shortcuts

- ` ` ` (Backtick): Open / close interactive CLI terminal
- `T`: Toggle Dark / Light theme
- `C`: Copy contact email to clipboard
- `Escape`: Close CLI or mobile navigation
