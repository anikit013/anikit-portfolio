/* ==========================================================================
   Anikit Kumar Chaudhary — Portfolio
   Vanilla JS: i18n loader, theme + nav controls, hero "service mesh" canvas,
   content rendering from language files, interactive terminal CLI,
   project filtering, copy email toast, scroll reveal, contact form.
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
  var EMAIL_ADDRESS = "anikit781@gmail.com";

  // Skills data shared across languages — only the category *labels* are
  // translated (via skills.categories.* in each lang file).
  var SKILLS_DATA = [
    { key: "languages",     items: ["Java", "TypeScript", "JavaScript", "Python", "SQL"] },
    { key: "backend",       items: ["Spring Boot", "Node.js", "REST APIs", "Microservices", "OAuth2", "JWT"] },
    { key: "frontend",      items: ["React", "Angular", "Tailwind CSS", "HTML5", "CSS3"] },
    { key: "databases",     items: ["PostgreSQL", "Oracle", "Redis"] },
    { key: "cloud",         items: ["Docker", "Jenkins", "GitHub Actions", "AWS", "CI/CD"] },
    { key: "security",      items: ["OWASP", "OAuth2", "JWT", "Secure API Development", "JUnit", "Unit Testing"] },
    { key: "tools",         items: ["Git", "Linux", "IntelliJ IDEA", "VS Code", "Agile", "Scrum", "Code Review"] },
    { key: "ai",            items: ["Cursor", "ChatGPT", "Claude", "Gemini", "Prompt Engineering", "AI Agents", "MCP", "AI-Assisted Development"] }
  ];

  var cache = {};      // lang -> parsed JSON
  var currentLang = DEFAULT_LANG;
  var currentFilter = "all";

  /* ------------------------------------------------------------------ *
   * 2. HELPERS
   * ------------------------------------------------------------------ */
  function byPath(obj, path) {
    if (!obj || !path) return undefined;
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
   * 3. TOAST NOTIFICATIONS
   * ------------------------------------------------------------------ */
  var toastTimer = null;
  function showToast(message, duration) {
    var toast = document.getElementById("toast");
    if (!toast) return;
    duration = duration || 3000;
    toast.textContent = message;
    toast.classList.add("visible");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("visible");
    }, duration);
  }

  /* ------------------------------------------------------------------ *
   * 4. APPLY TRANSLATIONS
   * ------------------------------------------------------------------ */
  function applyTranslations(data, lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = "ltr";

    // Plain text content: [data-i18n="a.b.c"]
    document.querySelectorAll("[data-i18n]").forEach(function (elm) {
      var val = byPath(data, elm.getAttribute("data-i18n"));
      if (typeof val === "string") elm.textContent = val;
    });

    // Attributes: [data-i18n-attr="attr1:path1|attr2:path2"]
    document.querySelectorAll("[data-i18n-attr]").forEach(function (elm) {
      elm.getAttribute("data-i18n-attr").split("|").forEach(function (pair) {
        var parts = pair.split(":");
        var attr = parts[0], path = parts[1];
        var val = byPath(data, path);
        if (typeof val === "string") elm.setAttribute(attr, val);
      });
    });

    // Active state on language switcher
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      var isActive = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    renderSkills(data);
    renderExperience(data);
    renderEducation(data);
    renderProjects(data);
    updateFilterLabels(data);
    initMetricCounters();
    initSpotlightCards();
  }

  /* ------------------------------------------------------------------ *
   * 5. DYNAMIC SECTIONS
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
      var trainingList = byPath(data, "education.trainingItems") || (byPath(data, "education.internshipItem") ? [byPath(data, "education.internshipItem")] : []);
      trainingList.forEach(function (intern) {
        var item = el("div", "timeline-item reveal");
        item.appendChild(el("div", "dates", intern.dates));
        item.appendChild(el("h3", null, intern.role));
        var compHtml = "<strong>" + intern.company + "</strong>" + (intern.location ? " — " + intern.location : "");
        item.appendChild(el("div", "role-company", compHtml));
        var ul = el("ul", "bullets");
        (intern.bullets || []).forEach(function (b) { ul.appendChild(el("li", null, b)); });
        item.appendChild(ul);
        var tags = el("div", "tag-row");
        (intern.tech || []).forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
        if (intern.tech && intern.tech.length) item.appendChild(tags);
        internWrap.appendChild(item);
      });
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
    var enterpriseDefault = byPath(data, "projects.enterpriseLabel") || "Enterprise System";

    var filteredItems = items.filter(function (proj) {
      if (currentFilter === "all") return true;
      return proj.category === currentFilter;
    });

    if (filteredItems.length === 0) {
      var emptyMsg = el("p", "projects-empty", "No projects found in this category.");
      grid.appendChild(emptyMsg);
      return;
    }

    filteredItems.forEach(function (proj) {
      var card = el("div", "project-card reveal");
      card.setAttribute("data-category", proj.category || "backend");

      var thumb = el("div", "project-thumb");

      // Picture with WebP and PNG fallback
      if (proj.image) {
        var picture = document.createElement("picture");
        var webpSrc = proj.image.replace(/\.png$/, ".webp");
        var sourceWebp = document.createElement("source");
        sourceWebp.srcset = webpSrc;
        sourceWebp.type = "image/webp";
        picture.appendChild(sourceWebp);

        var projectImage = document.createElement("img");
        projectImage.src = proj.image;
        projectImage.alt = proj.imageAlt || proj.title;
        projectImage.loading = "lazy";
        projectImage.decoding = "async";
        picture.appendChild(projectImage);
        thumb.appendChild(picture);
      }

      // Project Badge
      if (proj.badge) {
        var badge = el("span", "project-badge", proj.badge);
        thumb.appendChild(badge);
      }

      thumb.appendChild(el("span", "project-title-overlay", proj.title));
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
        liveA.className = "project-link-btn live";
        liveA.innerHTML = "<span>↗</span> " + liveLabel;
        links.appendChild(liveA);
      }
      if (proj.codeUrl) {
        var codeA = document.createElement("a");
        codeA.href = proj.codeUrl; codeA.target = "_blank"; codeA.rel = "noopener noreferrer";
        codeA.className = "project-link-btn code";
        codeA.innerHTML = "<span>&lt;/&gt;</span> " + codeLabel;
        links.appendChild(codeA);
      }
      if (!proj.liveUrl && !proj.codeUrl) {
        var entSpan = el("span", "project-link-badge", "🔒 " + (proj.statusLabel || enterpriseDefault));
        links.appendChild(entSpan);
      }
      body.appendChild(links);

      card.appendChild(body);
      grid.appendChild(card);
    });
    observeReveals();
  }

  function updateFilterLabels(data) {
    var filtersObj = byPath(data, "projects.filters");
    if (!filtersObj) return;
    document.querySelectorAll(".project-filters button").forEach(function (btn) {
      var cat = btn.getAttribute("data-filter");
      if (filtersObj[cat]) {
        btn.textContent = filtersObj[cat];
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 6. PROJECT FILTERS
   * ------------------------------------------------------------------ */
  function initProjectFilters() {
    var container = document.getElementById("project-filters");
    if (!container) return;

    container.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      var filter = btn.getAttribute("data-filter");
      if (filter === currentFilter) return;

      currentFilter = filter;
      container.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });

      var activeData = cache[currentLang] || {};
      renderProjects(activeData);
    });
  }

  /* ------------------------------------------------------------------ *
   * 7. LANGUAGE SWITCHING
   * ------------------------------------------------------------------ */
  function setLanguage(lang, persist) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) lang = DEFAULT_LANG;
    var overlay = document.getElementById("page-transition");
    if (overlay) overlay.classList.add("active");

    fetchLang(lang)
      .then(function (data) {
        currentLang = lang;
        applyTranslations(data, lang);
        if (persist) {
          storeLang(lang);
          showToast("Language changed to " + lang.toUpperCase(), 2000);
        }
      })
      .catch(function () {
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
   * 8. THEME TOGGLE
   * ------------------------------------------------------------------ */
  function initTheme() {
    var stored = getStoredTheme();
    var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
    var theme = stored || (prefersLight ? "light" : "dark");
    document.body.setAttribute("data-theme", theme);

    var toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var current = document.body.getAttribute("data-theme");
        var next = current === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", next);
        storeTheme(next);
        showToast("Switched to " + next + " theme", 2000);
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * 9. COPY EMAIL FUNCTIONALITY
   * ------------------------------------------------------------------ */
  function initEmailCopy() {
    document.querySelectorAll(".copy-email-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(EMAIL_ADDRESS).then(function () {
            var data = cache[currentLang] || {};
            var msg = byPath(data, "contact.copiedToast") || "Email copied to clipboard!";
            showToast(msg);
          }).catch(function () {
            showToast("Email: " + EMAIL_ADDRESS);
          });
        } else {
          // Fallback
          var ta = document.createElement("textarea");
          ta.value = EMAIL_ADDRESS;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
          showToast("Email copied to clipboard!");
        }
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 10. INTERACTIVE TERMINAL CLI
   * ------------------------------------------------------------------ */
  function initTerminalCLI() {
    var overlay = document.getElementById("cli-overlay");
    var form = document.getElementById("cli-form");
    var input = document.getElementById("cli-input");
    var output = document.getElementById("cli-output");
    var trigger = document.getElementById("hero-terminal-trigger");
    var closeBtn = document.getElementById("cli-close-btn");
    var closeX = document.getElementById("cli-close-x");

    if (!overlay || !form || !input || !output) return;

    var history = [];
    var historyIndex = -1;

    function openCLI() {
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      setTimeout(function () { input.focus(); }, 100);
    }

    function closeCLI() {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
    }

    if (trigger) {
      trigger.addEventListener("click", openCLI);
      trigger.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCLI(); }
      });
    }

    if (closeBtn) closeBtn.addEventListener("click", closeCLI);
    if (closeX) closeX.addEventListener("click", closeCLI);

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeCLI();
    });

    function printLine(text, className) {
      var p = document.createElement("p");
      p.className = "cli-line " + (className || "");
      p.innerHTML = text;
      output.appendChild(p);
      output.scrollTop = output.scrollHeight;
    }

    var commands = {
      help: function () {
        printLine("<span class='cli-hl'>Available commands:</span>");
        printLine("  <span class='cli-cmd'>whoami</span>      - About Anikit Kumar Chaudhary");
        printLine("  <span class='cli-cmd'>skills</span>      - Technical stack &amp; capabilities");
        printLine("  <span class='cli-cmd'>projects</span>    - Featured engineering projects");
        printLine("  <span class='cli-cmd'>contact</span>     - How to reach out");
        printLine("  <span class='cli-cmd'>email</span>       - Copy email address to clipboard");
        printLine("  <span class='cli-cmd'>cv</span>          - Download CV / Resume");
        printLine("  <span class='cli-cmd'>theme</span>       - Toggle Dark / Light theme");
        printLine("  <span class='cli-cmd'>clear</span>       - Clear terminal screen");
        printLine("  <span class='cli-cmd'>exit</span>        - Close terminal");
      },
      whoami: function () {
        printLine("<span class='cli-hl'>Anikit Kumar Chaudhary</span> — Software Engineer");
        printLine("3+ years building Java/Spring Boot applications, microservices and REST APIs");
        printLine("for telecom and enterprise systems.");
        printLine("Education: M.Sc. Applied Computer Science @ Hochschule Schmalkalden, Germany.");
        printLine("Status: <span class='cli-success'>Available for 20 hours per week — Werkstudent &amp; part-time roles in Germany.</span>");
      },
      skills: function () {
        printLine("<span class='cli-hl'>Technical Skills:</span>");
        printLine("  Languages : Java, TypeScript, JavaScript, Python, SQL");
        printLine("  Backend   : Spring Boot, Node.js, REST APIs, Microservices, OAuth2, JWT");
        printLine("  Frontend  : React, Angular, Tailwind CSS, HTML5, CSS3");
        printLine("  Databases : PostgreSQL, Oracle, Redis");
        printLine("  Cloud/Ops : Docker, Jenkins, GitHub Actions, AWS, CI/CD");
        printLine("  Security  : OWASP, Secure API Dev, JUnit, Unit Testing");
        printLine("  AI Tools  : Cursor, ChatGPT, Claude, Gemini, Prompt Engineering, AI Agents, MCP");
      },
      projects: function () {
        printLine("<span class='cli-hl'>Featured Projects:</span>");
        printLine("  1. <strong>HSM Developer Hub</strong> [Open Source] - React, Vite, Supabase, Prisma");
        printLine("     <a href='https://github.com/anikit013/hsm-developer-hub' target='_blank' class='cli-link'>github.com/anikit013/hsm-developer-hub</a>");
        printLine("  2. <strong>Telecom Analytics Platform</strong> [Enterprise] - Spring Boot, Redis, Angular (5M+ users)");
        printLine("  3. <strong>Microservices Migration</strong> [Enterprise] - Docker, Jenkins, AWS");
        printLine("  4. <strong>Air Quality ML Prediction</strong> [AI] - Python, XGBoost, Scikit-learn");
        printLine("     <a href='https://github.com/anikit013/Air-Quality-Index-Machine-Learning' target='_blank' class='cli-link'>github.com/anikit013/Air-Quality-Index-Machine-Learning</a>");
      },
      contact: function () {
        printLine("<span class='cli-hl'>Contact Channels:</span>");
        printLine("  Phone    : <a href='tel:+4915565762881' class='cli-link'>+49 155 6576 2881</a>");
        printLine("  Email    : <a href='mailto:anikit781@gmail.com' class='cli-link'>anikit781@gmail.com</a>");
        printLine("  LinkedIn : <a href='https://linkedin.com/in/anikit013' target='_blank' class='cli-link'>linkedin.com/in/anikit013</a>");
        printLine("  GitHub   : <a href='https://github.com/anikit013' target='_blank' class='cli-link'>github.com/anikit013</a>");
        printLine("  Location : Schmalkalden, Germany");
      },
      email: function () {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(EMAIL_ADDRESS);
          printLine("<span class='cli-success'>Copied '" + EMAIL_ADDRESS + "' to clipboard!</span>");
        } else {
          printLine("Email: " + EMAIL_ADDRESS);
        }
        showToast("Email copied to clipboard!");
      },
      cv: function () {
        printLine("Initiating CV download...");
        var a = document.createElement("a");
        a.href = "assets/Anikit_CV.pdf";
        a.download = "Anikit_Kumar_Chaudhary_CV.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      theme: function () {
        var current = document.body.getAttribute("data-theme");
        var next = current === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", next);
        storeTheme(next);
        printLine("Theme set to <span class='cli-hl'>" + next + "</span>.");
        showToast("Theme: " + next);
      },
      clear: function () {
        output.innerHTML = "";
      },
      exit: function () {
        closeCLI();
      },
      quit: function () {
        closeCLI();
      }
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var raw = input.value.trim();
      input.value = "";
      if (!raw) return;

      history.push(raw);
      historyIndex = history.length;

      printLine("<span class='cli-prompt'>visitor@akc:~$</span> " + raw);

      var cmd = raw.toLowerCase().split(" ")[0];
      if (commands[cmd]) {
        commands[cmd]();
      } else {
        printLine("Command not recognized: '<span class='cli-danger'>" + cmd + "</span>'. Type <span class='cli-hl'>help</span> for valid commands.", "cli-error");
      }
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          input.value = history[historyIndex] || "";
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex < history.length - 1) {
          historyIndex++;
          input.value = history[historyIndex] || "";
        } else {
          historyIndex = history.length;
          input.value = "";
        }
      } else if (e.key === "Escape") {
        closeCLI();
      }
    });

    // Make trigger globally accessible for shortcuts
    window._akcOpenCLI = openCLI;
    window._akcCloseCLI = closeCLI;
  }

  /* ------------------------------------------------------------------ *
   * 11. KEYBOARD SHORTCUTS
   * ------------------------------------------------------------------ */
  function initKeyboardShortcuts() {
    window.addEventListener("keydown", function (e) {
      var activeEl = document.activeElement;
      var isInput = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.isContentEditable);

      // Backtick toggles CLI
      if (e.key === "`") {
        if (!isInput) {
          e.preventDefault();
          var overlay = document.getElementById("cli-overlay");
          if (overlay && overlay.classList.contains("open")) {
            if (window._akcCloseCLI) window._akcCloseCLI();
          } else {
            if (window._akcOpenCLI) window._akcOpenCLI();
          }
        }
      }

      // Escape closes CLI or mobile nav
      if (e.key === "Escape") {
        if (window._akcCloseCLI) window._akcCloseCLI();
        var navLinks = document.getElementById("nav-links");
        if (navLinks && navLinks.classList.contains("open")) {
          navLinks.classList.remove("open");
          var menuToggle = document.getElementById("menu-toggle");
          if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
        }
      }

      // 't' toggles theme if not typing
      if ((e.key === "t" || e.key === "T") && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        var toggle = document.getElementById("theme-toggle");
        if (toggle) toggle.click();
      }

      // 'c' copies email if not typing
      if ((e.key === "c" || e.key === "C") && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        var copyBtn = document.querySelector(".copy-email-btn");
        if (copyBtn) copyBtn.click();
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * 12. MOBILE NAV
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
   * 13. SCROLL REVEAL
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
      }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    }
    document.querySelectorAll(".reveal:not(.is-visible)").forEach(function (elm) {
      revealObserver.observe(elm);
    });
  }

  /* ------------------------------------------------------------------ *
   * 14. HERO "SERVICE MESH" BACKGROUND
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
   * 15. STICKY NAV BACKGROUND ON SCROLL
   * ------------------------------------------------------------------ */
  function initHeaderScrollState() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function update() {
      header.classList.toggle("scrolled", window.scrollY > 12);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * 16. PAGE FEEDBACK & INTERACTIONS
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
    document.querySelectorAll(".facts-card, .skill-card, .edu-card, .project-card, .about-card-portrait, .contact-card").forEach(function (card) {
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
      portrait.style.transform = "perspective(700px) rotateX(" + (-y * 6) + "deg) rotateY(" + (x * 6) + "deg)";
    });
    portrait.addEventListener("pointerleave", function () { portrait.style.transform = ""; });
  }

  function initFooterYear() {
    var yearEl = document.getElementById("footer-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------------------------ *
   * 17. CONTACT FORM (Optional Formspree Support)
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
        // Compose default email client
        var name = (document.getElementById("name") || {}).value || "";
        var email = (document.getElementById("email") || {}).value || "";
        var message = (document.getElementById("message") || {}).value || "";
        var mailtoUrl = "mailto:" + EMAIL_ADDRESS + "?subject=" + encodeURIComponent("Message from " + name + " via Portfolio") + "&body=" + encodeURIComponent("From: " + name + " (" + email + ")\n\n" + message);
        window.location.href = mailtoUrl;
        if (status) {
          status.className = "form-status success";
          status.textContent = "Opening your email client to send message...";
        }
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (status) {
        status.className = "form-status";
        status.textContent = data.formSending || "Sending…";
      }

      fetch(form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            if (status) {
              status.textContent = data.formSuccess || "Thanks — your message has been sent.";
              status.className = "form-status success";
            }
            form.reset();
            showToast("Message sent successfully!");
          } else {
            throw new Error("Form submission failed");
          }
        })
        .catch(function () {
          if (status) {
            status.textContent = data.formError || "Something went wrong. Please try again, or email me directly.";
            status.className = "form-status error";
          }
        })
        .then(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
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
    initProjectFilters();
    initEmailCopy();
    initTerminalCLI();
    initKeyboardShortcuts();
    initContactForm();
    initLanguage();
  });
})();
