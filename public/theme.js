/**
 * Grambi Theme Manager (Dark / Light Mode Toggle)
 * Auto-initializes theme on page load and provides a global toggleTheme() function.
 */

(function initTheme() {
  const savedTheme = localStorage.getItem('grambi_theme') || 'dark';
  applyTheme(savedTheme);

  function applyTheme(theme) {
    const html = document.documentElement;
    const body = document.body;

    if (theme === 'light') {
      html.classList.remove('dark');
      html.classList.add('light');
      body.classList.remove('bg-slate-950', 'text-slate-100');
      body.classList.add('bg-slate-50', 'text-slate-900');
    } else {
      html.classList.remove('light');
      html.classList.add('dark');
      body.classList.remove('bg-slate-50', 'text-slate-900');
      body.classList.add('bg-slate-950', 'text-slate-100');
    }

    // Update toggle icons if present on page
    const icon = document.getElementById('themeToggleIcon');
    if (icon) {
      icon.className = theme === 'light' ? 'ri-moon-line text-slate-700' : 'ri-sun-line text-amber-400';
    }
  }

  window.toggleTheme = function() {
    const current = localStorage.getItem('grambi_theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('grambi_theme', next);
    applyTheme(next);
  };
})();
