/* ==========================================================================
   Anikit Kumar Chaudhary — Portfolio
   Vanilla JS: i18n loader, theme + nav controls, hero "service mesh" canvas,
   content rendering from language files, scroll reveal, contact form.
   No build step — designed to run as-is on GitHub Pages.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * 1. CONFIG
   * ------------------------------------------------------------------ */
  var SUPPORTED_LANGS = ["en", "ne", "de"];
  var DEFAULT_LANG = "en";
  var STORAGE_KEY = "akc-portfolio-lang";
  var THEME_KEY = "akc-portfolio-theme";

  // Skills data shared across languages — only the category *labels* are
  // translated (via skills.categories.* in each lang file). Add / remove
  // items here; they appear identically in every language.
  var SKILLS_DATA = [
    { key: "languages",     items: ["Java", "TypeScript", "JavaScript", "Python", "SQL"] },
    { key: "backend",       items: ["Spring Boot", "Node.js", "REST APIs", "Microservices", "OAuth2", "JWT"] },
    { key: "frontend",      items: ["React", "Angular", "TypeScript", "Tailwind CSS", "HTML5", "CSS3"] },
    { key: "databases",     items: ["PostgreSQL", "Oracle", "Redis"] },
    { key: "cloud",         items: ["Docker", "Jenkins", "GitHub Actions", "AWS (EC2, S3, Lambda)"] },
    { key: "security",      items: ["OWASP", "OAuth2", "JWT", "Secure API Development"] },
    { key: "testing",       items: ["JUnit", "JUnit 5", "Unit Testing", "Integration Testing"] },
    { key: "tools",         items: ["Git", "Linux", "IntelliJ IDEA", "VS Code"] },
    { key: "methodologies", items: ["Agile", "Scrum", "CI/CD", "Code Review"] }
  ];

  var cache = {};      // lang -> parsed JSON
  var currentLang = DEFAULT_LANG;

  /* ------------------------------------------------------------------ *
   * 2. HELPERS
   * ------------------------------------------------------------------ */
  function byPath(obj, path) {
    return path.split(".").reduce(function (acc, key) {
      return acc && typeof acc === "object" ? acc[key] : undefined;
    }, obj);
  }

  function detectBrowserLang() {
    try {
      var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
      for (var i = 0; i < langs.length; i++) {
        var code = (langs[i] || "").slice(0, 2).toLowerCase();
        if (SUPPORTED_LANGS.indexOf(code) !== -1) return code;
      }
    } catch (e) { /* ignore */ }
    return DEFAULT_LANG;
  }

  function getStoredLang() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function storeLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }
  function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function storeTheme(theme) {
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* ignore */ }
  }

  function fetchLang(lang) {
    if (cache[lang]) return Promise.resolve(cache[lang]);
    return fetch("lang/" + lang + ".json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load " + lang + ".json");
        return res.json();
      })
      .then(function (data) {
        cache[lang] = data;
        return data;
      });
  }

  /* ------------------------------------------------------------------ *
   * 3. APPLY TRANSLATIONS
   * ------------------------------------------------------------------ */
  function applyTranslations(data, lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = "ltr"; // none of the three languages are RTL

    // Plain text content: [data-i18n="a.b.c"]
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var val = byPath(data, el.getAttribute("data-i18n"));
      if (typeof val === "string") el.textContent = val;
    });

    // Attributes: [data-i18n-attr="attr1:path1|attr2:path2"]
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split("|").forEach(function (pair) {
        var parts = pair.split(":");
        var attr = parts[0], path = parts[1];
        var val = byPath(data, path);
        if (typeof val === "string") el.setAttribute(attr, val);
      });
    });

    // Active state on language switcher
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang ? "true" : "false");
    });

    renderSkills(data);
    renderExperience(data);
    renderEducation(data);
    renderProjects(data);
    initMetricCounters();
    initSpotlightCards();
  }

  /* ------------------------------------------------------------------ *
   * 4. DYNAMIC SECTIONS
   * ------------------------------------------------------------------ */
  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function renderSkills(data) {
    var grid = document.getElementById("skills-grid");
    if (!grid) return;
    grid.innerHTML = "";
    SKILLS_DATA.forEach(function (cat) {
      var label = byPath(data, "skills.categories." + cat.key) || cat.key;
      var card = el("div", "skill-card reveal");
      card.appendChild(el("h3", null, label));
      var row = el("div", "tag-row");
      cat.items.forEach(function (item) {
        row.appendChild(el("span", "tag", item));
      });
      card.appendChild(row);
      grid.appendChild(card);
    });
    observeReveals();
  }

  function renderExperience(data) {
    var wrap = document.getElementById("experience-timeline");
    if (!wrap) return;
    wrap.innerHTML = "";
    var items = byPath(data, "experience.items") || [];
    items.forEach(function (job) {
      var item = el("div", "timeline-item reveal");
      item.appendChild(el("div", "dates", job.dates));
      item.appendChild(el("h3", null, job.role));
      item.appendChild(el("div", "role-company", "<strong>" + job.company + "</strong> — " + job.location));
      var ul = el("ul", "bullets");
      (job.bullets || []).forEach(function (b) { ul.appendChild(el("li", null, b)); });
      item.appendChild(ul);
      var tags = el("div", "tag-row");
      (job.tech || []).forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
      item.appendChild(tags);
      wrap.appendChild(item);
    });
    observeReveals();
  }

  function renderEducation(data) {
    var grid = document.getElementById("education-grid");
    if (grid) {
      grid.innerHTML = "";
      var items = byPath(data, "education.items") || [];
      items.forEach(function (edu) {
        var card = el("div", "edu-card reveal");
        card.appendChild(el("div", "dates", edu.dates));
        card.appendChild(el("h3", null, edu.degree));
        card.appendChild(el("div", "school", edu.school + " — " + edu.location));
        if (edu.extra) card.appendChild(el("div", "extra", edu.extra));
        if (edu.website) {
          var website = document.createElement("a");
          website.className = "edu-website";
          website.href = edu.website;
          website.target = "_blank";
          website.rel = "noopener noreferrer";
          website.textContent = edu.website.replace(/^https?:\/\//, "");
          card.appendChild(website);
        }
        grid.appendChild(card);
      });
    }

    var internWrap = document.getElementById("internship-timeline");
    if (internWrap) {
      internWrap.innerHTML = "";
      var intern = byPath(data, "education.internshipItem");
      if (intern) {
        var item = el("div", "timeline-item reveal");
        item.appendChild(el("div", "dates", intern.dates));
        item.appendChild(el("h3", null, intern.role));
        item.appendChild(el("div", "role-company", "<strong>" + intern.company + "</strong>"));
        var ul = el("ul", "bullets");
        (intern.bullets || []).forEach(function (b) { ul.appendChild(el("li", null, b)); });
        item.appendChild(ul);
        var tags = el("div", "tag-row");
        (intern.tech || []).forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
        if (intern.tech && intern.tech.length) item.appendChild(tags);
        internWrap.appendChild(item);
      }
    }
    observeReveals();
  }

  function renderProjects(data) {
    var grid = document.getElementById("projects-grid");
    if (!grid) return;
    grid.innerHTML = "";
    var items = byPath(data, "projects.items") || [];
    var liveLabel = byPath(data, "projects.liveLabel") || "Live";
    var codeLabel = byPath(data, "projects.codeLabel") || "Code";

    items.forEach(function (proj) {
      var card = el("div", "project-card reveal");

      var thumb = el("div", "project-thumb");
      if (proj.image) {
        var projectImage = document.createElement("img");
        projectImage.src = proj.image;
        projectImage.alt = proj.imageAlt || proj.title;
        projectImage.loading = "lazy";
        projectImage.decoding = "async";
        thumb.appendChild(projectImage);
      }
      thumb.appendChild(el("span", null, proj.title));
      card.appendChild(thumb);

      var body = el("div", "project-body");
      body.appendChild(el("div", "subtitle", proj.subtitle || ""));
      body.appendChild(el("h3", null, proj.title));
      if (proj.dates) body.appendChild(el("div", "project-dates", proj.dates));
      body.appendChild(el("p", null, proj.description));

      var tags = el("div", "tag-row");
      (proj.tech || []).forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
      body.appendChild(tags);

      var links = el("div", "project-links");
      if (proj.liveUrl) {
        var liveA = document.createElement("a");
        liveA.href = proj.liveUrl; liveA.target = "_blank"; liveA.rel = "noopener noreferrer";
        liveA.textContent = "↗ " + liveLabel;
        links.appendChild(liveA);
      }
      if (proj.codeUrl) {
        var codeA = document.createElement("a");
        codeA.href = proj.codeUrl; codeA.target = "_blank"; codeA.rel = "noopener noreferrer";
        codeA.textContent = "</> " + codeLabel;
        links.appendChild(codeA);
      }
      body.appendChild(links);

      card.appendChild(body);
      grid.appendChild(card);
    });
    observeReveals();
  }

  /* ------------------------------------------------------------------ *
   * 5. LANGUAGE SWITCHING
   * ------------------------------------------------------------------ */
  function setLanguage(lang, persist) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) lang = DEFAULT_LANG;
    var overlay = document.getElementById("page-transition");
    if (overlay) overlay.classList.add("active");

    fetchLang(lang)
      .then(function (data) {
        currentLang = lang;
        applyTranslations(data, lang);
        if (persist) storeLang(lang);
      })
      .catch(function () {
        // Fall back to English if a language file fails to load
        if (lang !== DEFAULT_LANG) return setLanguage(DEFAULT_LANG, false);
      })
      .then(function () {
        if (overlay) setTimeout(function () { overlay.classList.remove("active"); }, 120);
      });
  }

  function initLanguage() {
    var stored = getStoredLang();
    var initial = stored && SUPPORTED_LANGS.indexOf(stored) !== -1 ? stored : detectBrowserLang();
    setLanguage(initial, false);

    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLanguage(btn.getAttribute("data-lang"), true);
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 6. THEME TOGGLE
   * ------------------------------------------------------------------ */
  function initTheme() {
    var stored = getStoredTheme();
    var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    var theme = stored || (prefersLight ? "light" : "dark");
    document.body.setAttribute("data-theme", theme);

    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", next);
        storeTheme(next);
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * 7. MOBILE NAV
   * ------------------------------------------------------------------ */
  function initNav() {
    var menuToggle = document.getElementById("menu-toggle");
    var navLinks = document.getElementById("nav-links");
    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 8. SCROLL REVEAL
   * ------------------------------------------------------------------ */
  var revealObserver;
  function observeReveals() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (elm) { elm.classList.add("is-visible"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    }
    document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (elm) {
      revealObserver.observe(elm);
    });
  }

  /* ------------------------------------------------------------------ *
   * 9. HERO "SERVICE MESH" BACKGROUND
   * A lightweight animated node-and-link graph, echoing the microservice
   * topologies the CV describes. Pure SVG, no canvas, respects
   * prefers-reduced-motion.
   * ------------------------------------------------------------------ */
  function initHeroMesh() {
    var svg = document.getElementById("hero-mesh");
    if (!svg) return;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var W = 1200, H = 800;
    var NODE_COUNT = 16;
    var nodes = [];
    for (var i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 2 + Math.random() * 2.5
      });
    }

    // Connect each node to its 2 nearest neighbours for a mesh feel
    var links = [];
    nodes.forEach(function (n, i) {
      var dists = nodes.map(function (m, j) { return { j: j, d: Math.hypot(n.x - m.x, n.y - m.y) }; })
        .filter(function (o) { return o.j !== i; })
        .sort(function (a, b) { return a.d - b.d; });
      for (var k = 0; k < 2; k++) {
        var pair = [i, dists[k].j].sort().join("-");
        if (links.indexOf(pair) === -1) links.push(pair);
      }
    });

    var ns = "http://www.w3.org/2000/svg";
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);

    links.forEach(function (pairKey, idx) {
      var parts = pairKey.split("-").map(Number);
      var a = nodes[parts[0]], b = nodes[parts[1]];
      var line = document.createElementNS(ns, "line");
      line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
      line.setAttribute("stroke", "var(--border)");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);

      // Animated "packet" traveling along the link
      if (!reduceMotion) {
        var packet = document.createElementNS(ns, "circle");
        packet.setAttribute("r", "2.4");
        packet.setAttribute("fill", idx % 2 === 0 ? "var(--accent)" : "var(--accent-2)");
        var animate = document.createElementNS(ns, "animateMotion");
        animate.setAttribute("dur", (6 + Math.random() * 8).toFixed(1) + "s");
        animate.setAttribute("repeatCount", "indefinite");
        animate.setAttribute("path", "M" + a.x + "," + a.y + " L" + b.x + "," + b.y);
        animate.setAttribute("begin", (Math.random() * 6).toFixed(1) + "s");
        packet.appendChild(animate);
        svg.appendChild(packet);
      }
    });

    nodes.forEach(function (n) {
      var circle = document.createElementNS(ns, "circle");
      circle.setAttribute("cx", n.x); circle.setAttribute("cy", n.y); circle.setAttribute("r", n.r);
      circle.setAttribute("fill", "var(--text-faint)");
      svg.appendChild(circle);
    });
  }

  /* ------------------------------------------------------------------ *
   * 10. STICKY NAV BACKGROUND ON SCROLL
   * ------------------------------------------------------------------ */
  function initHeaderScrollState() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function update() {
      header.style.borderBottomColor = window.scrollY > 8 ? "var(--border)" : "transparent";
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * 11. PAGE FEEDBACK
   * Keep navigation and reading position connected to the content currently
   * on screen. These small signals make a long portfolio easier to explore.
   * ------------------------------------------------------------------ */
  function initScrollProgress() {
    var bar = document.getElementById("scroll-progress-bar");
    if (!bar) return;
    function update() {
      var available = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (available > 0 ? (window.scrollY / available) * 100 : 0) + "%";
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function initActiveNavigation() {
    if (!("IntersectionObserver" in window)) return;
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
    var sections = links.map(function (link) { return document.querySelector(link.getAttribute("href")); }).filter(Boolean);
    if (!sections.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
    sections.forEach(function (section) { observer.observe(section); });
  }

  function initMetricCounters() {
    var metrics = document.querySelectorAll(".count-up:not([data-count-ready])");
    if (!metrics.length) return;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function animate(metric) {
      var original = metric.textContent.trim();
      var numberMatch = original.match(/(\d+(?:\.\d+)?)/);
      if (!numberMatch || reduceMotion) { metric.dataset.countReady = "true"; return; }
      var target = Number(numberMatch[1]);
      var decimals = (numberMatch[1].split(".")[1] || "").length;
      var prefix = original.slice(0, numberMatch.index);
      var suffix = original.slice(numberMatch.index + numberMatch[1].length);
      var start = performance.now();
      var duration = 900;
      metric.dataset.countReady = "true";
      function frame(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        metric.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    if (!("IntersectionObserver" in window)) {
      metrics.forEach(animate);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.7 });
    metrics.forEach(function (metric) { observer.observe(metric); });
  }

  function initSpotlightCards() {
    document.querySelectorAll(".facts-card, .skill-card, .edu-card, .project-card").forEach(function (card) {
      if (card.dataset.spotlightReady) return;
      card.dataset.spotlightReady = "true";
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--spotlight-x", (event.clientX - rect.left) + "px");
        card.style.setProperty("--spotlight-y", (event.clientY - rect.top) + "px");
      });
    });
  }

  function initHeroPointer() {
    var portrait = document.querySelector(".hero-portrait");
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!portrait || reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    portrait.addEventListener("pointermove", function (event) {
      var rect = portrait.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      portrait.style.transform = "perspective(700px) rotateX(" + (-y * 5) + "deg) rotateY(" + (x * 5) + "deg)";
    });
    portrait.addEventListener("pointerleave", function () { portrait.style.transform = ""; });
  }

  /* ------------------------------------------------------------------ *
   * 12. FOOTER YEAR
   * ------------------------------------------------------------------ */
  function initFooterYear() {
    var yearEl = document.getElementById("footer-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------ *
   * 12. CONTACT FORM (Formspree / EmailJS ready)
   *
   * Default wiring uses Formspree: replace the `action` attribute on the
   * <form id="contact-form"> in index.html with your own endpoint,
   * e.g. https://formspree.io/f/xxxxabcd — no JS changes required.
   *
   * To use EmailJS instead: include the EmailJS SDK script tag in
   * index.html, then swap the fetch() call below for
   * emailjs.send(SERVICE_ID, TEMPLATE_ID, formValues, PUBLIC_KEY).
   * ------------------------------------------------------------------ */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    var status = document.getElementById("form-status");
    var submitBtn = document.getElementById("form-submit");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = byPath(cache[currentLang], "contact") || {};
      var formData = new FormData(form);

      if (form.getAttribute("action").indexOf("YOUR_FORM_ID") !== -1) {
        status.textContent = "Set your Formspree endpoint in the form's \"action\" attribute (see README.md).";
        status.className = "form-status error";
        return;
      }

      submitBtn.disabled = true;
      status.className = "form-status";
      status.textContent = data.formSending || "Sending…";

      fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            status.textContent = data.formSuccess || "Thanks — your message has been sent.";
            status.className = "form-status success";
            form.reset();
          } else {
            throw new Error("Form submission failed");
          }
        })
        .catch(function () {
          status.textContent = data.formError || "Something went wrong. Please try again, or email me directly.";
          status.className = "form-status error";
        })
        .then(function () { submitBtn.disabled = false; });
    });
  }

  /* ------------------------------------------------------------------ *
   * INIT
   * ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initNav();
    initHeroMesh();
    initHeaderScrollState();
    initScrollProgress();
    initActiveNavigation();
    initHeroPointer();
    initFooterYear();
    initContactForm();
    initLanguage();
  });
})();
