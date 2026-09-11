// Universal Top Navigation Bar & Quick Location/vCard Dispatcher for All Grambi Tools
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

  let currentMerchantData = null;

  function renderNavbar(userData) {
    if (document.getElementById('grambiGlobalNavbar')) return;
    currentMerchantData = userData;

    const nav = document.createElement('div');
    nav.id = 'grambiGlobalNavbar';
    nav.className = 'w-full bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between no-print sticky top-0 z-50 backdrop-blur-md';

    const isSuperAdmin = userData?.role === 'ADMIN';

    // Desktop Navbar Links
    const linksHtml = NAV_ITEMS
      .filter(item => isSuperAdmin || (userData?.subscriptions && userData.subscriptions.includes(item.key)))
      .map(item => {
        const isActive = currentPath.includes(item.path);
        return `
          <a href="${item.path}" class="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
            <i class="${item.icon}"></i> <span>${item.name}</span>
          </a>
        `;
      }).join('');

    nav.innerHTML = `
      <!-- Desktop & Tablet Navigation Row -->
      <div class="hidden md:flex items-center gap-2 overflow-x-auto">
        <a href="/portal.html" class="text-xs text-slate-400 hover:text-white flex items-center gap-1 border border-slate-800 px-2.5 py-1.5 rounded-lg mr-2 hover:bg-slate-800 shrink-0">
          <i class="ri-arrow-left-line"></i> Launchpad
        </a>
        ${linksHtml}
      </div>

      <!-- Mobile Top Brand & Quick Actions -->
      <div class="flex md:hidden items-center justify-between w-full">
        <a href="/portal.html" class="flex items-center gap-2 font-bold text-sm text-white">
          <div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs">G</div>
          <span class="truncate max-w-[140px]">${userData?.businessName || 'Grambi'}</span>
        </a>

        <div class="flex items-center gap-2">
          <button type="button" onclick="openLocationDispatchModal()" class="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg shadow-sm flex items-center gap-1 transition" title="Send Location">
            <i class="ri-map-pin-2-fill text-amber-300"></i> Location
          </button>
          <button onclick="toggleTheme()" class="p-1.5 text-slate-400 hover:text-white border border-slate-800 rounded-lg hover:bg-slate-800 transition" title="Toggle Theme">
            <i id="themeToggleIconMobile" class="ri-sun-line text-amber-400 text-sm"></i>
          </button>
          <button onclick="logoutSession()" class="text-[11px] text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 font-semibold">
            Sign Out
          </button>
        </div>
      </div>

      <!-- Desktop Right Controls -->
      <div class="hidden md:flex items-center gap-2.5 shrink-0">
        <button type="button" onclick="openLocationDispatchModal()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer" title="Send Location & Business Card to Unsaved Caller">
          <i class="ri-map-pin-2-fill text-amber-300"></i> Send Location & Card
        </button>

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

    // Insert at top of body
    document.body.insertBefore(nav, document.body.firstChild);

    // Mobile App Bottom Navigation Bar
    renderMobileBottomNav(userData);

    // Inject Global Location Dispatch Modal
    injectLocationModal();
  }

  function renderMobileBottomNav(userData) {
    if (document.getElementById('grambiMobileBottomNav')) return;

    const isSuperAdmin = userData?.role === 'ADMIN';
    const allowed = NAV_ITEMS.filter(item => isSuperAdmin || (userData?.subscriptions && userData.subscriptions.includes(item.key)));

    const bottomNav = document.createElement('nav');
    bottomNav.id = 'grambiMobileBottomNav';
    bottomNav.className = 'md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-800 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around z-50 no-print select-none';

    // Map mobile tabs
    const tabsHtml = allowed.map(item => {
      const isActive = currentPath.includes(item.path);
      const shortName = item.name.split(' ')[0]; // e.g. Billing, Retention, Website, Social, WhatsApp

      return `
        <a href="${item.path}" class="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${isActive ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'}">
          <i class="${item.icon} text-lg mb-0.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}"></i>
          <span class="text-[10px] leading-none">${shortName}</span>
        </a>
      `;
    }).join('');

    bottomNav.innerHTML = `
      <a href="/portal.html" class="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${currentPath.includes('portal.html') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'}">
        <i class="ri-grid-fill text-lg mb-0.5"></i>
        <span class="text-[10px] leading-none">Apps</span>
      </a>
      ${tabsHtml}
    `;

    document.body.appendChild(bottomNav);

    // Add padding bottom to body so bottom bar never overlaps page content on phones
    document.body.classList.add('pb-16', 'md:pb-0');
  }

  function injectLocationModal() {
    if (document.getElementById('quickLocationModal')) return;

    const modal = document.createElement('div');
    modal.id = 'quickLocationModal';
    modal.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4 no-print select-none';

    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative space-y-5 text-slate-100">
        <button onclick="closeLocationDispatchModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white">
          <i class="ri-close-line text-xl"></i>
        </button>

        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl font-bold border border-blue-500/20">
            <i class="ri-map-pin-2-fill"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-white">Send Location & Business Card</h3>
            <p class="text-xs text-slate-400">1-click WhatsApp dispatch for new & unsaved callers</p>
          </div>
        </div>

        <form onsubmit="handleQuickLocationSend(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Paste Customer / Caller Phone Number *</label>
            <div class="relative">
              <input type="tel" id="quickCallerPhone" required placeholder="e.g. 919876543210 or +91 99999 88888" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono" />
              <button type="button" onclick="pasteClipboardNumber()" class="absolute right-2.5 top-2 text-[11px] font-bold text-blue-400 hover:text-blue-300 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                Paste
              </button>
            </div>
            <span class="text-[10px] text-slate-500 mt-1 block">Works instantly for unsaved numbers without adding to mobile phonebook.</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Caller / Contact Name (Optional)</label>
            <input type="text" id="quickCallerName" placeholder="e.g. Sir / Madam / Customer" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Message Preview (Editable)</label>
            <textarea id="quickLocationMsg" rows="5" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"></textarea>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input type="checkbox" id="chkAutoSaveCrm" checked class="rounded bg-slate-950 border-slate-800 text-blue-500 cursor-pointer" />
            <label for="chkAutoSaveCrm" class="text-xs text-slate-300 cursor-pointer">Also save this caller as an active lead in Retention CRM</label>
          </div>

          <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20 cursor-pointer">
            <i class="ri-whatsapp-fill text-base text-emerald-300"></i> Open WhatsApp & Send Location Now
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
  }

  window.openLocationDispatchModal = async function() {
    const modal = document.getElementById('quickLocationModal');
    if (!modal) return;

    // Load website address and slug details for accurate Google Map link
    let businessName = currentMerchantData?.businessName || 'VT Motors';
    let address = 'Main Highway Road';
    let phone = currentMerchantData?.phone || '+91 9876543210';
    let siteSlug = 'vt-motors';

    try {
      const token = localStorage.getItem('grambi_token');
      const res = await fetch('/api/website/my-website', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const site = await res.json();
        businessName = site.businessName || businessName;
        address = site.address || address;
        phone = site.phone || phone;
        siteSlug = site.slug || siteSlug;
      }
    } catch (e) {}

    const mapsQuery = `${businessName}, ${address}`.trim();
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(mapsQuery)}`;
    const websiteUrl = `https://grambi.in/site/${siteSlug}`;

    const defaultMsg = `*${businessName} — Location & Business Details*\n\n` +
      `Hello! Thank you for contacting us. Here are our location and contact details:\n\n` +
      `*Address:*\n${address}\n\n` +
      `*Google Maps Navigation:*\n${mapsUrl}\n\n` +
      `*View Services & Book Online:*\n${websiteUrl}\n\n` +
      `*Call / WhatsApp:* ${phone}\n\n` +
      `Feel free to reply to this message for any assistance or directions!`;

    document.getElementById('quickLocationMsg').value = defaultMsg;
    document.getElementById('quickCallerPhone').value = '';
    document.getElementById('quickCallerName').value = '';

    modal.classList.remove('hidden');
    document.getElementById('quickCallerPhone').focus();
  };

  window.closeLocationDispatchModal = function() {
    const modal = document.getElementById('quickLocationModal');
    if (modal) modal.classList.add('hidden');
  };

  window.pasteClipboardNumber = async function() {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        document.getElementById('quickCallerPhone').value = text.trim();
      }
    } catch (e) {
      alert('Please paste the phone number manually.');
    }
  };

  window.handleQuickLocationSend = async function(e) {
    e.preventDefault();
    const rawPhone = document.getElementById('quickCallerPhone').value.trim();
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const callerName = document.getElementById('quickCallerName').value.trim() || 'Valued Caller';
    const message = document.getElementById('quickLocationMsg').value;
    const shouldSaveCrm = document.getElementById('chkAutoSaveCrm').checked;

    if (!cleanPhone) {
      alert('Please enter a valid phone number.');
      return;
    }

    // Optional CRM auto-save
    if (shouldSaveCrm) {
      try {
        const token = localStorage.getItem('grambi_token');
        await fetch('/api/crm/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            name: callerName,
            phone: cleanPhone,
            category: 'AUTOMOTIVE',
            reminderTitle: 'Inquiry Call Follow-up',
            repeatCycleDays: 7,
            notes: 'Shared location and business card via WhatsApp'
          })
        });
      } catch (crmErr) {
        console.warn('CRM Quick Save:', crmErr);
      }
    }

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    closeLocationDispatchModal();
  };

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
