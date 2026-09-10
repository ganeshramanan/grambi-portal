// Universal Top Navigation Bar for All Grambi Tools
(function () {
  const currentPath = window.location.pathname;

  const NAV_ITEMS = [
    {
      key: 'DIGITAL_INVOICING',
      name: 'Billing & Invoicing',
      icon: 'ri-bill-line',
      path: '/apps/invoices.html'
    },
    {
      key: 'CUSTOMER_CRM',
      name: 'Retention CRM',
      icon: 'ri-user-follow-line',
      path: '/apps/crm.html'
    },
    {
      key: 'WEBSITE_BUILDER',
      name: 'Website & Leads',
      icon: 'ri-layout-masonry-line',
      path: '/apps/website-customizer.html'
    },
    {
      key: 'SOCIAL_GENERATOR',
      name: 'Social Studio',
      icon: 'ri-magic-line',
      path: '/apps/social-generator.html'
    },
    {
      key: 'WHATSAPP_BROADCAST',
      name: 'WhatsApp Broadcaster',
      icon: 'ri-whatsapp-line',
      path: '/apps/whatsapp.html'
    }
  ];

  function renderNavbar(userData) {
    if (document.getElementById('grambiGlobalNavbar')) return;

    const nav = document.createElement('div');
    nav.id = 'grambiGlobalNavbar';
    nav.className = 'w-full bg-slate-900 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between no-print sticky top-0 z-50 backdrop-blur-md';

    const isSuperAdmin = userData?.role === 'ADMIN';

    const linksHtml = NAV_ITEMS.map(item => {
      const isActive = currentPath.includes(item.path);
      const isAllowed = isSuperAdmin || (userData?.subscriptions && userData.subscriptions.includes(item.key));

      if (isAllowed) {
        return `
          <a href="${item.path}" class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${isActive ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
            <i class="${item.icon}"></i> <span>${item.name}</span>
          </a>
        `;
      } else {
        return `
          <span class="px-3 py-1.5 text-xs text-slate-600 flex items-center gap-1.5 cursor-not-allowed opacity-50">
            <i class="${item.icon}"></i> <span>${item.name}</span>
          </span>
        `;
      }
    }).join('');

    nav.innerHTML = `
      <div class="flex items-center gap-2 overflow-x-auto">
        <a href="/portal.html" class="text-xs text-slate-400 hover:text-white flex items-center gap-1 border border-slate-800 px-2.5 py-1.5 rounded-lg mr-2 hover:bg-slate-800">
          <i class="ri-arrow-left-line"></i> Launchpad
        </a>
        ${linksHtml}
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <button onclick="toggleTheme()" class="p-1.5 text-slate-400 hover:text-white border border-slate-800 rounded-lg hover:bg-slate-800 transition" title="Toggle Theme">
          <i id="themeToggleIcon" class="ri-sun-line text-amber-400"></i>
        </button>
        ${isSuperAdmin ? `
          <a href="/admin.html" class="px-2.5 py-1 text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition">
            <i class="ri-shield-keyhole-line"></i> Admin Hub
          </a>
        ` : ''}
        <button onclick="logoutSession()" class="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 transition font-semibold">
          Sign Out
        </button>
      </div>
    `;

    // Insert at very top of body
    document.body.insertBefore(nav, document.body.firstChild);
  }

  window.logoutSession = function() {
    localStorage.removeItem('grambi_token');
    document.cookie = 'grambi_token=; Max-Age=0; path=/;';
    window.location.href = '/index.html';
  };

  document.addEventListener('DOMContentLoaded', async () => {
    if (!currentPath.includes('/apps/')) return;

    try {
      const token = localStorage.getItem('grambi_token');
      const res = await fetch('/api/auth/me', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const user = await res.json();
        renderNavbar(user);
      }
    } catch (e) {
      console.warn('Navbar init notice:', e);
    }
  });
})();
