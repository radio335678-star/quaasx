/**
 * Web-X-AI² — production search frontend
 * Consumes POST /api/search — XSS-safe DOM renderers, AbortController, a11y.
 */
(function () {
  "use strict";

  const API_BASE =
    (typeof window !== "undefined" && window.WEBX_API_BASE) || "/api/webx";

  const STORAGE_KEY = "webx_last_query";
  const STORAGE_TAB = "webx_last_tab";

  const CHIP_REFINES = {
    overview: "overview",
    usage: "usage examples",
    similar: "similar",
    latest: "latest release",
  };

  const state = {
    query: "",
    baseQuery: "",
    tab: "all",
    activeChip: null,
    abort: null,
    aiConfigured: false,
  };

  const el = {
    landing: document.getElementById("landingView"),
    results: document.getElementById("resultsView"),
    landingForm: document.getElementById("landingForm"),
    resultsForm: document.getElementById("resultsForm"),
    landingInput: document.getElementById("landingInput"),
    resultsInput: document.getElementById("resultsInput"),
    content: document.getElementById("contentContainer"),
    status: document.getElementById("statusBar"),
    aiPanel: document.getElementById("aiPanel"),
    chips: document.getElementById("actionChips"),
    tabs: document.getElementById("tabsBar"),
    clearBtn: document.getElementById("clearSearchBtn"),
  };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  function text(node, value) {
    node.textContent = value == null ? "" : String(value);
  }

  function safeUrl(url) {
    if (!url || typeof url !== "string") return "#";
    const t = url.trim();
    if (/^https?:\/\//i.test(t)) return t;
    if (t.startsWith("//")) return "https:" + t;
    return "#";
  }

  function externalLink(href, className) {
    const a = document.createElement("a");
    a.href = safeUrl(href);
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    if (className) a.className = className;
    return a;
  }

  function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function setStatus(msg, visible) {
    if (!el.status) return;
    text(el.status, msg || "");
    el.status.classList.toggle("is-visible", Boolean(visible && msg));
  }

  function showLanding() {
    el.landing.classList.remove("is-hidden");
    el.results.classList.remove("is-active");
    el.landingInput.focus();
  }

  function showResults() {
    el.landing.classList.add("is-hidden");
    el.results.classList.add("is-active");
    el.resultsInput.focus();
  }

  function persist() {
    try {
      sessionStorage.setItem(STORAGE_KEY, state.query);
      sessionStorage.setItem(STORAGE_TAB, state.tab);
    } catch (_) {
      /* ignore */
    }
  }

  function restoreSession() {
    try {
      const q = sessionStorage.getItem(STORAGE_KEY);
      const t = sessionStorage.getItem(STORAGE_TAB);
      if (q) {
        state.query = q;
        state.baseQuery = q;
        el.landingInput.value = q;
        el.resultsInput.value = q;
        if (t && ["all", "images", "videos", "news", "ai"].includes(t)) {
          state.tab = t;
        }
        showResults();
        setActiveTab(state.tab);
        executeSearch();
      }
    } catch (_) {
      /* ignore */
    }
  }

  function setActiveTab(tabName) {
    state.tab = tabName;
    $$(".tab-item[data-tab]", el.tabs).forEach((btn) => {
      const active = btn.getAttribute("data-tab") === tabName;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function buildQueryFromChip(chipId) {
    const base = state.baseQuery || state.query;
    if (!chipId || !CHIP_REFINES[chipId]) return base;
    const suffix = CHIP_REFINES[chipId];
    const lower = base.toLowerCase();
    if (lower.includes(suffix.toLowerCase())) return base;
    return base + " " + suffix;
  }

  function updateChipUI() {
    $$(".chip[data-chip]", el.chips).forEach((chip) => {
      const id = chip.getAttribute("data-chip");
      chip.classList.toggle("is-active", id === state.activeChip);
    });
  }

  function showAiPanel(show) {
    if (!el.aiPanel) return;
    const on = Boolean(show);
    el.aiPanel.classList.toggle("is-visible", on);
    el.aiPanel.hidden = !on;
    if (on) {
      const close = $("#aiPanelClose");
      if (close) close.focus();
    }
  }

  function renderSkeleton() {
    clearNode(el.content);
    const list = document.createElement("div");
    list.className = "skeleton-list";
    list.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 4; i++) {
      const card = document.createElement("div");
      card.className = "skeleton-card";
      ["skeleton-line skeleton-line--meta", "skeleton-line skeleton-line--title", "skeleton-line skeleton-line--body", "skeleton-line skeleton-line--body-2"].forEach((cls) => {
        const line = document.createElement("div");
        line.className = cls;
        card.appendChild(line);
      });
      list.appendChild(card);
    }
    el.content.appendChild(list);
  }

  function renderStateCard(opts) {
    clearNode(el.content);
    const card = document.createElement("div");
    card.className = "state-card" + (opts.error ? " state-card--error" : "");
    const h = document.createElement("h2");
    text(h, opts.title);
    const p = document.createElement("p");
    text(p, opts.message);
    card.appendChild(h);
    card.appendChild(p);
    if (opts.retry) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-primary";
      text(btn, "Retry search");
      btn.addEventListener("click", () => executeSearch());
      card.appendChild(btn);
    }
    el.content.appendChild(card);
  }

  function chevronSvg() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("aria-hidden", "true");
    const poly = document.createElementNS(ns, "polyline");
    poly.setAttribute("points", "6 9 12 15 18 9");
    svg.appendChild(poly);
    return svg;
  }

  function renderPaa(paa) {
    if (!paa || !paa.length) return null;
    const widget = document.createElement("div");
    widget.className = "paa-widget";
    const heading = document.createElement("div");
    heading.className = "paa-heading";
    text(heading, "People also ask");
    widget.appendChild(heading);

    paa.forEach((item, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "accordion-item";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "accordion-trigger";
      btn.id = "paa-btn-" + idx;
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", "paa-panel-" + idx);
      const label = document.createElement("span");
      text(label, item.question || "");
      btn.appendChild(label);
      btn.appendChild(chevronSvg());

      const panel = document.createElement("div");
      panel.className = "accordion-content";
      panel.id = "paa-panel-" + idx;
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", "paa-btn-" + idx);
      panel.hidden = true;
      text(panel, item.answer || "");

      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        panel.hidden = open;
      });

      wrap.appendChild(btn);
      wrap.appendChild(panel);
      widget.appendChild(wrap);
    });
    return widget;
  }

  function renderInlineThumbs(images, className) {
    if (!images || !images.length) return null;
    const wrap = document.createElement("div");
    wrap.className = className;
    images.forEach((img) => {
      const a = externalLink(img.url || img.thumbnail, "inline-thumb");
      a.title = img.title || "Image";
      const image = document.createElement("img");
      image.src = safeUrl(img.thumbnail || img.url);
      image.alt = img.title || "";
      image.loading = "lazy";
      image.addEventListener("error", () => {
        image.src =
          "data:image/svg+xml," +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90"><rect fill="#f1f3f4" width="100%" height="100%"/><text x="50%" y="50%" fill="#70757a" font-size="10" text-anchor="middle" dy=".3em">Image</text></svg>'
          );
      });
      a.appendChild(image);
      wrap.appendChild(a);
    });
    return wrap;
  }

  function formatDisplayUrl(url) {
    try {
      const u = new URL(safeUrl(url));
      let path = u.pathname + u.search;
      if (path.length > 48) {
        path = path.slice(0, 45) + "…";
      }
      return u.hostname + (path && path !== "/" ? path : "");
    } catch (_) {
      return String(url || "").slice(0, 60);
    }
  }

  function renderResultsStats(count, query) {
    const bar = document.createElement("div");
    bar.className = "results-stats";
    const line = document.createElement("p");
    text(
      line,
      count === 1
        ? "About 1 result"
        : "About " + count + " results"
    );
    bar.appendChild(line);
    if (query) {
      const q = document.createElement("p");
      q.className = "results-stats-query";
      text(q, "for " + query);
      bar.appendChild(q);
    }
    return bar;
  }

  function renderResultCard(item, idx, opts) {
    opts = opts || {};
    const compact = Boolean(opts.compact);
    const card = document.createElement("article");
    card.className = "card-result" + (compact ? " card-result--compact" : "");

    const crumb = externalLink(item.url, "card-breadcrumb");
    if (item.favicon) {
      const fav = document.createElement("img");
      fav.className = "favicon-img";
      fav.src = safeUrl(item.favicon);
      fav.alt = "";
      fav.width = 18;
      fav.height = 18;
      fav.addEventListener("error", () => {
        fav.style.display = "none";
      });
      crumb.appendChild(fav);
    }
    const urlLine = document.createElement("span");
    urlLine.className = "card-url-line";
    text(urlLine, formatDisplayUrl(item.url));
    crumb.appendChild(urlLine);
    card.appendChild(crumb);

    const title = externalLink(item.url, "card-title-link");
    text(title, item.title || item.url || "Untitled");
    card.appendChild(title);

    if (item.description) {
      const snip = document.createElement("div");
      snip.className = "card-snippet";
      text(snip, item.description);
      card.appendChild(snip);
    }

    if (!compact && item.content) {
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "raw-toggle-btn";
      toggle.setAttribute("aria-expanded", "false");
      const rawId = "raw-box-" + idx;
      toggle.setAttribute("aria-controls", rawId);
      text(toggle, "Cached page text");

      const raw = document.createElement("pre");
      raw.className = "raw-text-details";
      raw.id = rawId;
      raw.hidden = true;
      text(raw, item.content);

      toggle.addEventListener("click", () => {
        const open = !raw.hidden;
        raw.hidden = open;
        toggle.setAttribute("aria-expanded", open ? "false" : "true");
        text(toggle, open ? "Cached page text" : "Hide cached page text");
      });

      card.appendChild(toggle);
      card.appendChild(raw);
    }

    return card;
  }

  function renderAllView(data) {
    clearNode(el.content);
    const results = data.results || [];
    const paa = data.paa || [];
    const count = data.result_count != null ? data.result_count : results.length;

    if (!results.length && !paa.length) {
      renderStateCard({
        title: "No results found",
        message: "Try a different query, or paste a full URL to fetch a page directly.",
        retry: true,
      });
      return;
    }

    const layout = document.createElement("div");
    layout.className = "all-layout";

    const mainCol = document.createElement("div");
    mainCol.className = "results-main";

    if (count > 0) {
      mainCol.appendChild(renderResultsStats(count, data.query));
    }

    const list = document.createElement("div");
    list.className = "results-list";
    list.id = "main-results";

    const paaEl = renderPaa(paa);
    if (paaEl) list.appendChild(paaEl);

    results.forEach((item, idx) => {
      list.appendChild(renderResultCard(item, idx));
    });
    mainCol.appendChild(list);
    layout.appendChild(mainCol);

    el.content.appendChild(layout);
  }

  function renderMediaGrid(items, emptyTitle) {
    clearNode(el.content);
    if (!items || !items.length) {
      renderStateCard({
        title: emptyTitle,
        message: "Nothing matched this query. Try broader keywords.",
        retry: true,
      });
      return;
    }
    const grid = document.createElement("div");
    grid.className = "media-grid";
    items.forEach((item) => {
      const a = externalLink(item.url || item.thumbnail, "media-card");
      const img = document.createElement("img");
      img.className = "media-thumb";
      img.src = safeUrl(item.thumbnail || item.url);
      img.alt = item.title || "";
      img.loading = "lazy";
      img.addEventListener("error", () => {
        img.src =
          "data:image/svg+xml," +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="112"><rect fill="#f1f3f4" width="100%" height="100%"/><text x="50%" y="50%" fill="#70757a" font-size="12" text-anchor="middle" dy=".3em">Unavailable</text></svg>'
          );
      });
      const info = document.createElement("div");
      info.className = "media-info";
      const title = document.createElement("span");
      title.className = "media-title";
      text(title, item.title || "Untitled");
      info.appendChild(title);
      a.appendChild(img);
      a.appendChild(info);
      grid.appendChild(a);
    });
    el.content.appendChild(grid);
  }

  function renderNewsEmpty() {
    renderStateCard({
      title: "News index coming soon",
      message:
        "Web-X-AI² News is not wired yet. Use All or AI Mode for live results.",
      retry: false,
    });
  }

  function renderAiView(data) {
    clearNode(el.content);
    const wrap = document.createElement("div");
    wrap.className = "ai-answer-wrap";

    const overview = document.createElement("section");
    overview.className = "ai-overview-card";
    overview.setAttribute("aria-label", "AI Mode answer");

    const header = document.createElement("div");
    header.className = "ai-answer-header";
    const h = document.createElement("h2");
    text(h, "AI Mode");
    header.appendChild(h);
    const sub = document.createElement("span");
    sub.className = "ai-answer-sub";
    text(sub, "From live web pages");
    header.appendChild(sub);
    overview.appendChild(header);

    const body = document.createElement("div");
    body.className = "ai-answer-body";
    const paragraphs = String(data.answer || "").split(/\n\n+/);
    paragraphs.forEach((para) => {
      const trimmed = para.trim();
      if (!trimmed) return;
      if (/^[-*•]\s/m.test(trimmed)) {
        const ul = document.createElement("ul");
        ul.className = "ai-answer-list";
        trimmed.split(/\n/).forEach((line) => {
          const m = line.match(/^[-*•]\s+(.*)/);
          if (m) {
            const li = document.createElement("li");
            text(li, m[1]);
            ul.appendChild(li);
          }
        });
        if (ul.childNodes.length) body.appendChild(ul);
      } else {
        const p = document.createElement("p");
        text(p, trimmed);
        body.appendChild(p);
      }
    });
    overview.appendChild(body);
    wrap.appendChild(overview);

    const sources = data.sources || [];
    if (sources.length) {
      const srcSection = document.createElement("section");
      srcSection.className = "ai-sources-section";
      const srcHeading = document.createElement("h3");
      srcHeading.className = "ai-sources-heading";
      text(srcHeading, "Sources");
      srcSection.appendChild(srcHeading);

      const srcList = document.createElement("ol");
      srcList.className = "ai-source-list";
      sources.forEach((item, idx) => {
        const li = document.createElement("li");
        li.className = "ai-source-item";
        const num = document.createElement("span");
        num.className = "ai-source-num";
        text(num, String(idx + 1));
        li.appendChild(num);

        const linkWrap = document.createElement("div");
        linkWrap.className = "ai-source-body";
        const a = externalLink(item.url, "ai-source-link");
        if (item.favicon) {
          const fav = document.createElement("img");
          fav.className = "favicon-img";
          fav.src = safeUrl(item.favicon);
          fav.alt = "";
          fav.width = 16;
          fav.height = 16;
          a.appendChild(fav);
        }
        const titleSpan = document.createElement("span");
        titleSpan.className = "ai-source-title";
        text(titleSpan, item.title || item.domain || "Source");
        a.appendChild(titleSpan);
        linkWrap.appendChild(a);
        const urlSmall = document.createElement("span");
        urlSmall.className = "ai-source-url";
        text(urlSmall, formatDisplayUrl(item.url));
        linkWrap.appendChild(urlSmall);
        li.appendChild(linkWrap);
        srcList.appendChild(li);
      });
      srcSection.appendChild(srcList);
      wrap.appendChild(srcSection);
    }

    el.content.appendChild(wrap);
  }

  function renderAiError(data, statusCode) {
    const heavy = Boolean(data.heavy_traffic) || statusCode === 503;
    const msg =
      data.error ||
      (heavy
        ? "We're experiencing heavy traffic right now. Please try again in a moment."
        : "AI Mode is unavailable. Check your local .env setup and try again.");
    renderStateCard({
      error: true,
      title: heavy ? "Heavy traffic" : "AI Mode unavailable",
      message: msg,
      retry: Boolean(state.query),
    });
  }

  async function fetchConfig() {
    try {
      const res = await fetch(`${API_BASE}/config`);
      if (!res.ok) return;
      const data = await res.json();
      state.aiConfigured = Boolean(data.ai_configured);
    } catch (_) {
      /* ignore */
    }
  }

  async function executeSearch() {
    if (!state.query) return;

    if (state.abort) {
      state.abort.abort();
    }
    state.abort = new AbortController();

    showAiPanel(false);
    const statusMsg =
      state.tab === "ai"
        ? "Reading live web pages…"
        : "Fetching web results…";
    setStatus(statusMsg, true);
    renderSkeleton();
    persist();

    if (state.tab === "news") {
      setStatus("", false);
      try {
        const response = await fetch(`${API_BASE}/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: state.query, tab: "news" }),
          signal: state.abort.signal,
        });
        if (!response.ok) {
          renderNewsEmpty();
          return;
        }
        const data = await response.json();
        const news = data.news || data.results || [];
        if (!news.length) {
          renderNewsEmpty();
          return;
        }
        clearNode(el.content);
        const list = document.createElement("div");
        list.className = "results-list";
        news.forEach((item, idx) => list.appendChild(renderResultCard(item, idx)));
        el.content.appendChild(list);
      } catch (err) {
        if (err.name === "AbortError") return;
        renderNewsEmpty();
      }
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: state.query, tab: state.tab }),
        signal: state.abort.signal,
      });

      const data = await response.json();
      setStatus("", false);

      if (state.tab === "ai") {
        if (data.ok && data.answer) {
          renderAiView(data);
        } else {
          renderAiError(data, response.status);
        }
        return;
      }

      if (!response.ok) {
        throw new Error("Search failed (" + response.status + ")");
      }

      if (state.tab === "images") {
        renderMediaGrid(data.images || [], "No images found");
      } else if (state.tab === "videos") {
        renderMediaGrid(data.videos || [], "No videos found");
      } else {
        renderAllView(data);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      setStatus("", false);
      if (state.tab === "ai") {
        renderAiError({ error: String(err.message || err) }, 502);
        return;
      }
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      renderStateCard({
        error: true,
        title: offline ? "You are offline" : "Search error",
        message: offline
          ? "Reconnect and retry. Web-X-AI² needs network access."
          : String(err.message || err),
        retry: true,
      });
    }
  }

  function runSearch(source, opts) {
    opts = opts || {};
    let q = "";
    if (source === "landing") {
      q = el.landingInput.value.trim();
      el.resultsInput.value = q;
    } else {
      q = el.resultsInput.value.trim();
      el.landingInput.value = q;
    }
    if (!q) return;

    state.baseQuery = q;
    state.query = buildQueryFromChip(state.activeChip);
    if (state.activeChip) {
      el.resultsInput.value = state.query;
    }
    if (opts.tab) {
      state.tab = opts.tab;
    }
    showResults();
    setActiveTab(state.tab);
    executeSearch();
  }

  function onTabClick(tabName) {
    if (tabName === "soon") return;
    if (tabName === "images" || tabName === "videos") {
      return;
    }
    if (tabName === "ai" && !state.aiConfigured) {
      showResults();
      setActiveTab("ai");
      showAiPanel(true);
      if (state.query) {
        renderStateCard({
          error: true,
          title: "AI Mode not configured",
          message:
            "Add your API keys to .env in C:\\scrapling\\agentic_scraper (see .env.example).",
          retry: false,
        });
      }
      return;
    }
    setActiveTab(tabName);
    showAiPanel(false);
    if (state.query) executeSearch();
  }

  function onChipClick(chipId) {
    if (chipId === "clear") {
      state.activeChip = null;
      state.query = state.baseQuery;
      el.resultsInput.value = state.baseQuery;
      el.landingInput.value = state.baseQuery;
      updateChipUI();
      if (state.baseQuery) executeSearch();
      return;
    }
    state.activeChip = state.activeChip === chipId ? null : chipId;
    updateChipUI();
    if (!state.baseQuery) return;
    state.query = buildQueryFromChip(state.activeChip);
    el.resultsInput.value = state.query;
    executeSearch();
  }

  function bind() {
    el.landingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      runSearch("landing");
    });

    el.resultsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      state.baseQuery = el.resultsInput.value.trim();
      state.activeChip = null;
      updateChipUI();
      runSearch("results");
    });

    if (el.clearBtn) {
      el.clearBtn.addEventListener("click", () => {
        el.resultsInput.value = "";
        el.resultsInput.focus();
      });
    }

    $$(".tab-item[data-tab]", el.tabs).forEach((btn) => {
      btn.addEventListener("click", () => onTabClick(btn.getAttribute("data-tab")));
    });

    $$(".chip[data-chip]", el.chips).forEach((chip) => {
      chip.addEventListener("click", () => onChipClick(chip.getAttribute("data-chip")));
    });

    $$("[data-quick]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const q = btn.getAttribute("data-quick");
        el.landingInput.value = q;
        state.activeChip = null;
        updateChipUI();
        runSearch("landing");
      });
    });

    $$("[data-ai-search]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const q = el.landingInput.value.trim();
        if (!q) {
          el.landingInput.focus();
          return;
        }
        state.activeChip = null;
        updateChipUI();
        runSearch("landing", { tab: "ai" });
      });
    });

    $$("[data-ai-open]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (el.results.classList.contains("is-active") || state.query) {
          showResults();
          showAiPanel(true);
        } else {
          const foot = document.getElementById("about");
          if (foot) foot.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    });

    const aiClose = $("#aiPanelClose");
    if (aiClose) {
      aiClose.addEventListener("click", () => showAiPanel(false));
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        showAiPanel(false);
        if (document.activeElement === el.resultsInput && el.resultsInput.value) {
          el.resultsInput.value = "";
        }
      }
    });

    const brandHome = $("#brandHome");
    if (brandHome) {
      brandHome.addEventListener("click", (e) => {
        e.preventDefault();
        showLanding();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    bind();
    showAiPanel(false);
    await fetchConfig();
    restoreSession();
  });
})();
