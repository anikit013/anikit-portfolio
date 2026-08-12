# Anikit Kumar Chaudhary — Portfolio

A multilingual (English / नेपाली / Deutsch) personal portfolio site built with
plain HTML, CSS and vanilla JavaScript — no build tools, no frameworks.
Designed to be hosted for free on GitHub Pages.

## 1. Folder structure

```
.
├── index.html              ← the whole site (one page, all sections)
├── README.md                ← this file
├── .nojekyll                 ← tells GitHub Pages not to run Jekyll processing
├── assets/
│   ├── css/
│   │   └── style.css        ← all styling (colors, type, layout, responsive)
│   ├── js/
│   │   └── main.js          ← language switching, theme, animations, form
│   ├── img/
│   │   ├── profile.jpg       ← ADD YOUR OWN PHOTO HERE (see img/README.txt)
│   │   └── README.txt
│   └── resume.pdf            ← the "Download CV" file (currently your CV PDF —
│                                 swap it for a polished export whenever you like)
└── lang/
    ├── en.json                ← English text (default)
    ├── ne.json                ← Nepali text
    └── de.json                ← German text
```

Every visible word in the site — nav labels, buttons, headings, bullet
points, form placeholders, image alt text — comes from the three files in
`/lang`. `index.html` never contains hard-coded copy; it only contains
`data-i18n="section.key"` markers that `main.js` fills in at runtime.

## 2. Editing translations

Open `lang/en.json`, `lang/ne.json` or `lang/de.json`. Each file has the
same structure (`meta`, `nav`, `hero`, `about`, `skills`, `experience`,
`education`, `projects`, `contact`, `footer`) — edit the value of any key
and it updates that piece of text on the site, in that language only.

- Job history, education entries and project cards live as **arrays** inside
  `experience.items`, `education.items` and `projects.items`. Copy an
  existing object inside the array and edit it to add a new job, degree, or
  project — do it in all three files to keep languages in sync.
- The **skills** shown (e.g. "Java", "Docker") are the same across all
  languages and are defined once in `assets/js/main.js` inside the
  `SKILLS_DATA` array near the top of the file. Only the *category labels*
  ("Backend", "Cloud & DevOps"...) are translated, via `skills.categories`
  in each language file.
- Validate a file after editing (optional, needs Python):
  `python3 -c "import json; json.load(open('lang/en.json', encoding='utf-8'))"`

## 3. Swapping in your own content/images

- **Photo**: replace `assets/img/profile.jpg` with a square photo (500×500px
  or larger). If you don't add one, the site automatically shows your
  initials instead — nothing breaks.
- **Resume**: replace `assets/resume.pdf` with your own PDF. The filename
  must stay `resume.pdf` (or update the `href` in the "Download CV" button
  in `index.html`).
- **Social preview image** (optional): add `assets/img/og-cover.jpg`
  (1200×630px) if you want a nice image to show up when your site link is
  shared on LinkedIn, etc.
- **Contact form**: the form posts to Formspree. Go to
  [formspree.io](https://formspree.io), create a free form, and paste your
  endpoint into the `action="..."` attribute of
  `<form id="contact-form">` in `index.html`:
  ```html
  <form class="contact-form" id="contact-form" action="https://formspree.io/f/your-real-id" method="POST">
  ```
  No JavaScript changes are needed. If you'd rather use **EmailJS**, add
  their SDK `<script>` tag to `index.html` and swap the `fetch()` call in
  the `initContactForm()` function of `assets/js/main.js` for
  `emailjs.send(SERVICE_ID, TEMPLATE_ID, formValues, PUBLIC_KEY)` — see the
  comment directly above that function in the file.
- **LinkedIn / GitHub links and email**: search `index.html` for
  `anikit013` and `anikit781@gmail.com` and replace with your own.

## 4. Running it locally

Because the site loads `lang/*.json` with `fetch()`, opening `index.html`
directly from your file system (`file://...`) will fail in most browsers
due to CORS restrictions on local file access. Serve it with any static
server instead, for example:

```bash
# Python 3
python3 -m http.server 8000
# then open http://localhost:8000
```

or use the VS Code "Live Server" extension, or `npx serve`.

## 5. Deploying to GitHub Pages (free)

1. **Create a repository.**
   - For a root-domain-style site (`https://yourusername.github.io`),
     name the repo exactly `yourusername.github.io`.
   - For a project page instead (`https://yourusername.github.io/reponame`),
     name it anything you like, e.g. `portfolio`.
2. **Push the code.**
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio site"
   git branch -M main
   git remote add origin https://github.com/yourusername/yourrepo.git
   git push -u origin main
   ```
   (Or use GitHub's web UI: "Add file" → "Upload files" → drag the whole
   folder in → commit.)
3. **Enable GitHub Pages.**
   Repo → **Settings** → **Pages** → under "Build and deployment", set
   **Source** to "Deploy from a branch", **Branch** to `main` and folder to
   `/ (root)` → **Save**.
4. **Verify the live URL.**
   GitHub shows the URL at the top of the Pages settings once it's built
   (usually within a minute or two):
   - `https://yourusername.github.io` (if you used the root-domain repo name), or
   - `https://yourusername.github.io/reponame` (for a project repo).
5. **Custom domain (optional, later).**
   - Buy a domain from any registrar.
   - In the same **Settings → Pages** screen, enter it under "Custom domain"
     — GitHub creates a `CNAME` file in your repo automatically.
   - At your domain registrar, add a `CNAME` record pointing your subdomain
     (e.g. `www`) to `yourusername.github.io`, or `A` records for an apex
     domain pointing to GitHub's IPs (185.199.108.153, .109.153, .110.153,
     .111.153).
   - Wait for DNS to propagate (up to 24h), then re-check "Enforce HTTPS"
     in the Pages settings.

## 6. Redeploying after edits

GitHub Pages rebuilds automatically on every push to the branch you
selected in step 3. Just commit and push your changes:

```bash
git add .
git commit -m "Update content"
git push
```

The live site updates within a minute or two — no other steps required.

## 7. What's already built in

- Language auto-detection on first visit (falls back to English), with the
  user's manual choice remembered via `localStorage`.
- Dark/light theme toggle, remembered via `localStorage`.
- Sticky header, smooth-scroll navigation, mobile hamburger menu.
- Scroll-triggered fade/slide-in animations, hover states, an animated
  "service-mesh" graphic in the hero section — all pure CSS/SVG, no
  dependencies, and disabled automatically for users with
  `prefers-reduced-motion` enabled.
- Semantic HTML5, ARIA labels on icon-only buttons, visible keyboard focus
  states, and per-language `<title>`/meta description/Open Graph tags.
