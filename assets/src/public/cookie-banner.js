(function () {
    const root = document.getElementById('cwas-cookie-banner-root');
    if (!root) return;

    const i18n = window.CWAS_COOKIE?.i18n ?? {};
    const isRtl = Boolean(i18n.isRtl);
    const storageKey = 'cwas_cookie_consent_v1';
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return;

    const banner = document.createElement('section');
    banner.className = 'cwas-cookie-banner' + (isRtl ? ' cwas-cookie-banner--rtl' : '');
    if (isRtl) {
        banner.setAttribute('dir', 'rtl');
    }
    banner.setAttribute('aria-label', i18n.ariaLabel ?? 'Cookie preferences');
    banner.innerHTML = `
        <p>${i18n.message ?? ''}</p>
        <div class="cwas-cookie-actions">
            <button type="button" data-consent="necessary">${i18n.rejectOptional ?? 'Reject optional'}</button>
            <button type="button" data-consent="all">${i18n.acceptAll ?? 'Accept all'}</button>
            <button type="button" data-consent="custom">${i18n.customize ?? 'Customize'}</button>
        </div>
    `;

    banner.addEventListener('click', async (event) => {
        const value = event.target?.dataset?.consent;
        if (!value) return;

        const consent = {
            necessary: true,
            analytics: value === 'all',
            marketing: value === 'all',
            createdAt: new Date().toISOString(),
        };

        window.localStorage.setItem(storageKey, JSON.stringify(consent));
        document.dispatchEvent(new CustomEvent('cwas:cookie-consent', { detail: consent }));
        banner.remove();
    });

    root.appendChild(banner);
})();
