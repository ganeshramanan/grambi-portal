/**
 * Grambi Credential Auto-Receiver Script
 * Drop this script into your child Render application (WhatsApp Automator / SaaS)
 * to automatically read credentials passed from the Grambi portal and auto-fill / submit.
 */

(function autoFillGrambiCredentials() {
  function applyParams() {
    const params = new URLSearchParams(window.location.search);
    const phoneId = params.get('phone_number_id') || params.get('phone_id');
    const wabaId = params.get('waba_id') || params.get('wabaAccountID');
    const token = params.get('access_token') || params.get('token') || params.get('permanent_token');
    const customerEmail = params.get('customer_email');

    // Selectors covering most common input naming patterns
    function fillInput(possibleSelectors, value) {
      if (!value) return null;
      for (const sel of possibleSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          el.value = value;
          // Trigger input/change events for frameworks (React, Vue, Alpine, vanilla)
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return el;
        }
      }
      return null;
    }

    // 1. Phone ID
    fillInput([
      '#phoneNumberId', '#phone_number_id', '#phoneId', '#phone_id',
      'input[name="phoneNumberId"]', 'input[name="phone_number_id"]', 'input[name="phoneId"]', 'input[name="phone_id"]'
    ], phoneId);

    // 2. WABA ID
    fillInput([
      '#wabaId', '#waba_id', '#wabaAccountId', '#waba_account_id',
      'input[name="wabaId"]', 'input[name="waba_id"]', 'input[name="wabaAccountId"]'
    ], wabaId);

    // 3. Access Token
    fillInput([
      '#accessToken', '#access_token', '#token', '#permanent_token', '#jwtToken',
      'input[name="accessToken"]', 'input[name="access_token"]', 'input[name="token"]',
      'textarea[name="accessToken"]', 'textarea[name="access_token"]'
    ], token);

    // 4. Customer Email (if present)
    fillInput([
      '#email', '#userEmail', 'input[name="email"]', 'input[name="userEmail"]'
    ], customerEmail);

    // Clean up browser address bar URL cleanly without page reload if credentials were found
    if ((phoneId || token) && window.history.replaceState) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      console.log('✅ Grambi credentials loaded and applied successfully.');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyParams);
  } else {
    applyParams();
  }
})();
