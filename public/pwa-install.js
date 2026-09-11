// Universal PWA Service Worker Registration & 1-Tap Install Prompt
(function () {
  // 1. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('[PWA] Service Worker active'))
        .catch((err) => console.warn('[PWA] Registration failed:', err));
    });
  }

  // 2. Capture 'beforeinstallprompt' Event for Native App Installation
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showPwaInstallBanner();
  });

  function showPwaInstallBanner() {
    // Avoid showing if user dismissed within last 7 days or already installed
    if (localStorage.getItem('grambi_pwa_dismissed')) return;
    if (document.getElementById('grambiPwaBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'grambiPwaBanner';
    banner.className = 'fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:max-w-md bg-slate-900 border border-blue-500/40 p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between gap-3 text-slate-100 backdrop-blur-lg animate-bounce-short no-print';

    banner.innerHTML = `
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-md">
          G
        </div>
        <div class="min-w-0">
          <h4 class="text-xs font-bold text-white leading-tight">Install Grambi App</h4>
          <p class="text-[10px] text-slate-400 truncate">1-tap fast access on your mobile home screen</p>
        </div>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <button type="button" onclick="triggerPwaInstall()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition">
          Install
        </button>
        <button type="button" onclick="dismissPwaBanner()" class="p-1.5 text-slate-500 hover:text-white rounded-lg text-sm" title="Dismiss">
          <i class="ri-close-line"></i>
        </button>
      </div>
    `;

    document.body.appendChild(banner);
  }

  window.triggerPwaInstall = async function() {
    const banner = document.getElementById('grambiPwaBanner');
    if (!deferredPrompt) {
      alert('To install Grambi: Tap the browser share/menu button (⋮ or ⎙) and select "Add to Home Screen".');
      if (banner) banner.remove();
      return;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      console.log('[PWA] User accepted installation');
    }
    deferredPrompt = null;
    if (banner) banner.remove();
  };

  window.dismissPwaBanner = function() {
    localStorage.setItem('grambi_pwa_dismissed', 'true');
    const banner = document.getElementById('grambiPwaBanner');
    if (banner) banner.remove();
  };
})();
