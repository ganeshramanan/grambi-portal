/**
 * Grambi Theme Manager (Dark / Light Mode Toggle)
 * Uses high-priority CSS variable injection for instant, flawless theme switching.
 */

(function initTheme() {
  const THEME_KEY = 'grambi_theme';

  // Inject comprehensive CSS theme overrides
  const styleEl = document.createElement('style');
  styleEl.id = 'grambi-theme-styles';
  styleEl.innerHTML = `
    html.light body {
      background-color: #f8fafc !important;
      color: #0f172a !important;
    }
    html.light header {
      background-color: rgba(255, 255, 255, 0.9) !important;
      border-color: #e2e8f0 !important;
    }
    html.light main, html.light section {
      color: #0f172a !important;
    }
    html.light div.bg-slate-900,
    html.light div.bg-slate-900\\/50,
    html.light div.bg-slate-900\\/40,
    html.light div.bg-slate-900\\/60,
    html.light div.bg-slate-950\\/60 {
      background-color: #ffffff !important;
      border-color: #e2e8f0 !important;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
    }
    html.light input,
    html.light textarea,
    html.light select,
    html.light div.bg-slate-950 {
      background-color: #f1f5f9 !important;
      border-color: #cbd5e1 !important;
      color: #0f172a !important;
    }
    html.light input:focus,
    html.light textarea:focus {
      background-color: #ffffff !important;
      border-color: #10b981 !important;
    }
    html.light .text-white {
      color: #0f172a !important;
    }
    html.light .text-slate-400,
    html.light .text-slate-300 {
      color: #475569 !important;
    }
    html.light .text-slate-500 {
      color: #64748b !important;
    }
    html.light .border-slate-800,
    html.light .border-slate-800\\/80,
    html.light .border-slate-900 {
      border-color: #e2e8f0 !important;
    }
    html.light table thead {
      background-color: #f1f5f9 !important;
      border-color: #e2e8f0 !important;
      color: #475569 !important;
    }
    html.light table tbody tr:hover {
      background-color: #f8fafc !important;
    }
    html.light table tbody {
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

    // Update any toggle icons on the page
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

  // Initial load
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);

  // Sync after DOM loads in case icons rendered later
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
  });
})();
