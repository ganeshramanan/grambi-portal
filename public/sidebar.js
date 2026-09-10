// Shared Universal Sidebar Navigation for all Grambi Apps
(function () {
  const currentPath = window.location.pathname;

  const NAV_ITEMS = [
    {
      key: 'DIGITAL_INVOICING',
      name: 'Billing & Invoicing',
      icon: 'ri-bill-line',
      path: '/apps/invoices.html',
      badge: 'UPI Pay',
      badgeColor: 'amber'
    },
    {
      key: 'CUSTOMER_CRM',
      name: 'Retention CRM',
      icon: 'ri-user-follow-line',
      path: '/apps/crm.html',
      badge: 'Reminders',
      badgeColor: 'cyan'
    },
    {
      key: 'WEBSITE_BUILDER',
      name: 'Website & Leads',
      icon: 'ri-layout-masonry-line',
      path: '/apps/website-customizer.html',
      badge: 'vCard',
      badgeColor: 'blue'
    },
    {
      key: 'SOCIAL_GENERATOR',
      name: 'Social Media Studio',
      icon: 'ri-magic-line',
      path: '/apps/social-generator.html',
      badge: 'Calendar',
      badgeColor: 'pink'
    },
    {
      key: 'WHATSAPP_BROADCAST',
      name: 'WhatsApp Broadcaster',
      icon: 'ri-whatsapp-line',
      path: '/apps/whatsapp.html',
      badge: 'Meta API',
      badgeColor: 'emerald'
    }
  ];

  function renderSidebar(userData) {
    // Check if sidebar already exists
    if (document.getElementById('grambiGlobalSidebar')) return;

    // Create Sidebar Container
    const sidebar = document.createElement('aside');
    sidebar.id = 'grambiGlobalSidebar';
    sidebar.className = 'w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-50 backdrop-blur-md transition-all duration-300 select-none no-print';

    const initial = (userData?.businessName || 'G').trim().charAt(0).toUpperCase();
    const isSuperAdmin = userData?.role === 'ADMIN';

    const navLinksHtml = NAV_ITEMS.map(item => {
      const isActive = currentPath.includes(item.path);
      const isAllowed = isSuperAdmin || (userData?.subscriptions && userData.subscriptions.includes(item.key));

      if (isAllowed) {
        return `
          <a href="${item.path}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}">
            <div class="flex items-center gap-2.5">
              <i class="${item.icon} text-base ${isActive ? 'text-emerald-400' : 'text-slate-400'}"></i>
              <span>${item.name}</span>
            </div>
            ${item.badge ? `<span class="text-[9px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}">${item.badge}</span>` : ''}
          </a>
        `;
      } else {
        return `
          <div class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-500 opacity-60 cursor-not-allowed">
            <div class="flex items-center gap-2.5">
              <i class="${item.icon} text-base text-slate-600"></i>
              <span>${item.name}</span>
            </div>
            <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-500">Locked</span>
          </div>
        `;
      }
    }).join('');

    sidebar.innerHTML = `
      <!-- Brand & Business Header -->
      <div class="p-5 border-b border-slate-800/80">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-600 text-slate-950 font-black flex items-center justify-center text-lg shadow-md shadow-emerald-500/20">
            ${initial}
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="font-bold text-sm text-white truncate leading-tight">${userData?.businessName || 'My Business'}</h2>
            <span class="text-[10px] text-emerald-400 font-mono block truncate">${isSuperAdmin ? 'Super Admin' : 'Active Account'}</span>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="p-3 space-y-1.5 flex-grow overflow-y-auto">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 block">Modules & Tools</span>
        ${navLinksHtml}
      </div>

      <!-- Bottom Profile & Quick Actions -->
      <div class="p-3.5 border-t border-slate-800/80 space-y-2 bg-slate-950/40">
        <div class="flex items-center justify-between px-2 text-xs">
          <button onclick="toggleTheme()" class="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition" title="Toggle Theme">
            <i class="ri-sun-line text-amber-400"></i>
          </button>
          ${isSuperAdmin ? `
            <a href="/admin.html" class="px-2.5 py-1 text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition">
              <i class="ri-shield-keyhole-line"></i> Admin
            </a>
          ` : ''}
          <a href="/portal.html" class="text-[11px] text-slate-400 hover:text-white flex items-center gap-1">
            <i class="ri-grid-fill text-slate-500"></i> Apps
          </a>
        </div>

        <button onclick="logoutSession()" class="w-full py-2 px-3 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition font-semibold flex items-center justify-center gap-1.5">
          <i class="ri-logout-box-r-line"></i> Sign Out
        </button>
      </div>
    `;

    // Wrap Body contents with flex layout
    const body = document.body;
    body.className = `${body.className} flex flex-row min-h-screen`;

    // Insert Sidebar as first child
    body.insertBefore(sidebar, body.firstChild);

    // Ensure main workspace takes remaining width
    const mainWrapper = document.createElement('div');
    mainWrapper.id = 'grambiMainWrapper';
    mainWrapper.className = 'flex-1 flex flex-col min-w-0 overflow-y-auto h-screen';

    // Move existing children (except sidebar) into mainWrapper
    const existingChildren = Array.from(body.children).filter(c => c !== sidebar);
    existingChildren.forEach(c => mainWrapper.appendChild(c));
    body.appendChild(mainWrapper);
  }

  window.logoutSession = function() {
    localStorage.removeItem('grambi_token');
    document.cookie = 'grambi_token=; Max-Age=0; path=/;';
    window.location.href = '/index.html';
  };

  // Auto initialize sidebar on page load
  document.addEventListener('DOMContentLoaded', async () => {
    // Only inject on authenticated /apps/ or /portal pages
    if (!currentPath.includes('/apps/') && !currentPath.includes('portal.html') && !currentPath.includes('admin.html')) {
      return;
    }

    try {
      const token = localStorage.getItem('grambi_token');
      const res = await fetch('/api/auth/me', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const user = await res.json();
        renderSidebar(user);
      }
    } catch (e) {
      console.warn('Sidebar init failed:', e);
    }
  });
})();
