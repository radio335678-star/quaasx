"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect } from "react";

const WEBX_STYLE_ID = "webx-stylesheet";

function injectStylesheet(id: string, href: string) {
  if (document.getElementById(id)) {
    return;
  }
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function removeStylesheet(id: string) {
  document.getElementById(id)?.remove();
}

export function WebXShell() {
  useEffect(() => {
    injectStylesheet(WEBX_STYLE_ID, "/web-x/webx.css");

    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const ping = () => {
      fetch(`${base}/api/webx/warmup`, { method: "GET" }).catch(() => {});
    };
    ping();
    const heartbeat = window.setInterval(ping, 20_000);

    return () => {
      window.clearInterval(heartbeat);
      removeStylesheet(WEBX_STYLE_ID);
    };
  }, []);

  return (
    <div className="webx-root">
      <a className="skip-link" href="#contentContainer">
        Skip to results
      </a>

      <div className="landing-view" id="landingView">
        <header className="top-nav" role="banner">
          <Link className="nav-link" href="/app">
            ← AI² Chat
          </Link>
          <a className="nav-link" href="#about" data-ai-open>
            About
          </a>
          <a className="nav-link" href="#about" data-ai-open>
            How it works
          </a>
        </header>

        <main className="landing-center" role="main">
          <div aria-label="Web-X-AI²" className="brand-mark brand-mark--lg">
            Web-X-AI²
          </div>
          <p className="brand-tagline">
            Open-web search · stealth fetch · AI Mode answers
          </p>

          <form
            aria-label="Web search"
            className="search-form"
            id="landingForm"
            onSubmit={(e) => e.preventDefault()}
            role="search"
          >
            <div className="search-pill">
              <svg
                aria-hidden="true"
                fill="none"
                height="20"
                stroke="#8a8a8a"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="20"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
              </svg>
              <label className="sr-only" htmlFor="landingInput">
                Search query
              </label>
              <input
                autoComplete="off"
                className="pill-input"
                enterKeyHint="search"
                id="landingInput"
                name="q"
                placeholder="Ask Web-X-AI² or type a URL"
                required
                type="text"
              />
              <div className="pill-controls">
                <button
                  className="ai-mode-btn"
                  data-ai-search
                  title="Search with AI Mode"
                  type="button"
                >
                  <span>AI Mode</span>
                </button>
                <button
                  aria-label="Search"
                  className="icon-btn icon-btn--accent"
                  type="submit"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="20"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    width="20"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" x2="16.65" y1="21" y2="16.65" />
                  </svg>
                </button>
              </div>
            </div>
          </form>

          <div aria-label="Quick searches" className="shortcuts-grid">
            <button
              className="shortcut-item"
              data-quick="Ayurveda Sanskrit Shloka"
              type="button"
            >
              <div aria-hidden="true" className="shortcut-circle">
                A
              </div>
              <span>Ayurveda</span>
            </button>
            <button
              className="shortcut-item"
              data-quick="Python 3.13 features"
              type="button"
            >
              <div aria-hidden="true" className="shortcut-circle">
                P
              </div>
              <span>Python 3.13</span>
            </button>
            <button
              className="shortcut-item"
              data-quick="Charaka Samhita"
              type="button"
            >
              <div aria-hidden="true" className="shortcut-circle">
                C
              </div>
              <span>Charaka</span>
            </button>
          </div>
        </main>

        <footer className="landing-footer" id="about">
          Web-X-AI² · Web Intelligence · QUAASX
        </footer>
      </div>

      <div className="results-view" id="resultsView">
        <header className="results-sticky-header">
          <div className="header-top-row">
            <a
              aria-label="Web-X-AI² home"
              className="brand-mark brand-mark--sm"
              href="/app/web-x"
              id="brandHome"
            >
              Web-X-AI²
            </a>

            <form
              aria-label="Refine search"
              className="search-form"
              id="resultsForm"
              onSubmit={(e) => e.preventDefault()}
              role="search"
            >
              <div className="results-search-pill">
                <label className="sr-only" htmlFor="resultsInput">
                  Search query
                </label>
                <input
                  autoComplete="off"
                  className="pill-input"
                  enterKeyHint="search"
                  id="resultsInput"
                  name="q"
                  required
                  type="text"
                />
                <div className="pill-controls">
                  <button
                    aria-label="Clear search"
                    className="icon-btn"
                    id="clearSearchBtn"
                    type="button"
                  >
                    <svg
                      aria-hidden="true"
                      fill="none"
                      height="18"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      width="18"
                    >
                      <line x1="18" x2="6" y1="6" y2="18" />
                      <line x1="6" x2="18" y1="6" y2="18" />
                    </svg>
                  </button>
                  <button
                    aria-label="Search"
                    className="icon-btn icon-btn--accent"
                    type="submit"
                  >
                    <svg
                      aria-hidden="true"
                      fill="none"
                      height="18"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                      width="18"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" x2="16.65" y1="21" y2="16.65" />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>

          <nav
            aria-label="Search modes"
            className="tabs-bar"
            id="tabsBar"
            role="tablist"
          >
            <button
              aria-selected="false"
              className="tab-item"
              data-tab="ai"
              role="tab"
              type="button"
            >
              AI Mode
            </button>
            <button
              aria-selected="true"
              className="tab-item active"
              data-tab="all"
              role="tab"
              type="button"
            >
              All
            </button>
            <button
              aria-disabled="true"
              className="tab-item is-soon"
              data-tab="soon"
              disabled
              role="tab"
              title="Coming soon"
              type="button"
            >
              Images
            </button>
            <button
              aria-disabled="true"
              className="tab-item is-soon"
              data-tab="soon"
              disabled
              role="tab"
              title="Coming soon"
              type="button"
            >
              Videos
            </button>
            <button
              aria-selected="false"
              className="tab-item"
              data-tab="news"
              role="tab"
              type="button"
            >
              News
            </button>
            <button
              aria-disabled="true"
              className="tab-item is-soon"
              data-tab="soon"
              disabled
              role="tab"
              title="Coming soon"
              type="button"
            >
              Maps
            </button>
            <button
              aria-disabled="true"
              className="tab-item is-soon"
              data-tab="soon"
              disabled
              role="tab"
              title="Coming soon"
              type="button"
            >
              Shopping
            </button>
          </nav>
        </header>

        <main className="results-body" role="main">
          <div aria-label="Refine query" className="action-chips" id="actionChips">
            <button className="chip" data-chip="overview" type="button">
              Overview
            </button>
            <button className="chip" data-chip="usage" type="button">
              Usage examples
            </button>
            <button className="chip" data-chip="similar" type="button">
              Similar words
            </button>
            <button className="chip" data-chip="latest" type="button">
              Latest release
            </button>
            <button className="chip chip-clear" data-chip="clear" type="button">
              Clear refine
            </button>
          </div>

          <div aria-label="AI Mode info" className="ai-panel" id="aiPanel" role="region">
            <h2>AI Mode</h2>
            <p>
              Web-X-AI² fetches live pages first, then answers your question from
              those excerpts with cited sources. AI keys stay on your laptop — run
              the local Web-X server to enable AI Mode.
            </p>
            <div className="ai-panel-actions">
              <button className="btn-text" id="aiPanelClose" type="button">
                Dismiss
              </button>
            </div>
          </div>

          <div aria-live="polite" className="status-bar" id="statusBar" role="status" />

          <div id="contentContainer" tabIndex={-1} />
        </main>
      </div>

      <Script
        onLoad={() => {
          const boot = (
            window as Window & { __webxBoot?: () => void }
          ).__webxBoot;
          boot?.();
        }}
        src="/web-x/webx-app.js"
        strategy="afterInteractive"
      />
    </div>
  );
}
