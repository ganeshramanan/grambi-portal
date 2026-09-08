/**
 * Grambi Theme Manager (Dark / Light Mode Toggle)
 * Uses high-priority CSS overrides for clean, high-contrast light and dark modes.
 */

(function initTheme() {
  const THEME_KEY = 'grambi_theme';

  const styleEl = document.createElement('style');
  styleEl.id = 'grambi-theme-styles';
  styleEl.innerHTML = `
    html.light body {
      background-color: #f8fafc !important;
      color: #0f172a !important;
    }
    html.light header {
      background-color: rgba(255, 255, 255, 0.95) !important;
      border-color: #e2e8f0 !important;
    }
    /* Brand Header in Light Mode */
    html.light .bg-gradient-to-r.from-white {
      background-image: none !important;
      color: #0f172a !important;
      -webkit-text-fill-color: #0f172a !important;
    }
    html.light header nav a {
      color: #334155 !important;
    }
    html.light header nav a:hover {
      color: #059669 !important;
    }
    html.light #navAuthArea button:first-of-type,
    html.light header button.text-slate-200,
    html.light header a.text-slate-400 {
      color: #0f172a !important;
      border: 1px solid #cbd5e1 !important;
      border-radius: 0.5rem !important;
      background-color: #f8fafc !important;
    }
    html.light header span#userBadge {
      background-color: #f1f5f9 !important;
      border-color: #cbd5e1 !important;
      color: #334155 !important;
    }
    html.light header button.bg-slate-900 {
      background-color: #f1f5f9 !important;
      border-color: #cbd5e1 !important;
      color: #0f172a !important;
    }
    html.light main, html.light section {
      color: #0f172a !important;
    }
    /* Card Backgrounds */
    html.light div.bg-slate-900,
    html.light div.bg-slate-900\\/50,
    html.light div.bg-slate-900\\/40,
    html.light div.bg-slate-900\\/60,
    html.light div.bg-slate-950\\/60 {
      background-color: #ffffff !important;
      border-color: #e2e8f0 !important;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
    }
    /* Fix Input Fields */
    html.light input,
    html.light textarea,
    html.light select,
    html.light div.bg-slate-950:not(#postCanvas):not(button) {
      background-color: #f8fafc !important;
      border-color: #cbd5e1 !important;
      color: #0f172a !important;
    }
    html.light input:focus,
    html.light textarea:focus {
      background-color: #ffffff !important;
      border-color: #10b981 !important;
    }

    /* ALL FILTER TABS & BUTTONS IN LIGHT MODE (Fixes Black Buttons) */
    html.light button.bg-slate-800,
    html.light button.bg-slate-900,
    html.light button.bg-slate-950,
    html.light button[id^="tabFilter"]:not(.bg-blue-600) {
      background-color: #f1f5f9 !important;
      border: 1px solid #cbd5e1 !important;
      color: #334155 !important;
    }
    html.light button.bg-slate-800:hover,
    html.light button.bg-slate-900:hover,
    html.light button.bg-slate-950:hover,
    html.light button[id^="tabFilter"]:not(.bg-blue-600):hover {
      background-color: #e2e8f0 !important;
      color: #0f172a !important;
    }

    /* Active blue tab in light mode */
    html.light button.bg-blue-600,
    html.light button[id^="tabFilter"].bg-blue-600 {
      background-color: #2563eb !important;
      color: #ffffff !important;
      border: 1px solid #1d4ed8 !important;
    }

    /* Fix Badges & Counters */
    html.light span.bg-slate-900,
    html.light span.bg-slate-800 {
      background-color: #f1f5f9 !important;
      color: #475569 !important;
      border-color: #cbd5e1 !important;
    }

    /* Fix Leads & Analytics Cards in Light Mode */
    html.light div#leadsContainer div.bg-slate-950,
    html.light div#metricViews.text-white,
    html.light div.grid.grid-cols-2.sm\\:grid-cols-4 div.bg-slate-950 {
      background-color: #ffffff !important;
      border-color: #e2e8f0 !important;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05);
    }
    html.light div.grid.grid-cols-2.sm\\:grid-cols-4 div.bg-slate-950 #metricViews {
      color: #0f172a !important;
    }
    html.light div#leadsContainer div.bg-slate-950 .font-bold.text-white {
      color: #0f172a !important;
    }
    html.light div#leadsContainer div.bg-slate-950 span.text-slate-400 {
      color: #475569 !important;
    }
    html.light div#leadsContainer div.bg-slate-900 {
      background-color: #f1f5f9 !important;
      border-color: #e2e8f0 !important;
      color: #334155 !important;
    }
    html.light div#leadsPaginationBar button {
      background-color: #f1f5f9 !important;
      border: 1px solid #cbd5e1 !important;
      color: #0f172a !important;
    }
    html.light div#leadsPaginationBar button:hover:not(:disabled) {
      background-color: #e2e8f0 !important;
    }
    html.light div#leadsContainer select {
      background-color: #f1f5f9 !important;
      border-color: #cbd5e1 !important;
      color: #0f172a !important;
    }

    /* Broadcast Campaign Cards */
    html.light div#campaignList div {
      background-color: #f8fafc !important;
      border-color: #e2e8f0 !important;
    }
    html.light div#campaignList span.text-white {
      color: #0f172a !important;
    }

    /* Primary Emerald Action Button */
    html.light button#sendBtn,
    html.light button.bg-emerald-400 {
      background-color: #10b981 !important;
      color: #ffffff !important;
    }
    html.light button#sendBtn:hover,
    html.light button.bg-emerald-400:hover {
      background-color: #059669 !important;
    }

    /* Typography Overrides */
    html.light .text-white {
      color: #0f172a !important;
    }
    html.light .text-slate-400,
    html.light .text-slate-300 {
      color: #334155 !important;
    }
    html.light .text-slate-500 {
      color: #64748b !important;
    }
    html.light .border-slate-800,
    html.light .border-slate-800\\/80,
    html.light .border-slate-900 {
      border-color: #e2e8f0 !important;
    }
    html.light footer {
      background-color: #ffffff !important;
      border-color: #e2e8f0 !important;
    }
  `;

  if (!document.getElementById('grambi-theme-styles')) {
    document.head.appendChild(styleEl);
  }

  function applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.remove('dark');
      html.classList.add('light');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
    }

    const icons = document.querySelectorAll('#themeToggleIcon');
    icons.forEach(icon => {
      icon.className = theme === 'light' ? 'ri-moon-line text-slate-800 text-base' : 'ri-sun-line text-amber-400 text-base';
    });
  }

  window.toggleTheme = function() {
    const current = localStorage.getItem(THEME_KEY) || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  };

  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
  });
})();
