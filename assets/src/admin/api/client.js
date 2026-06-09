import apiFetch from '@wordpress/api-fetch';

export function fetchSettings() {
    return apiFetch({ path: '/cwas/v1/settings' });
}

export function saveSettings(settings) {
    return apiFetch({
        path: '/cwas/v1/settings',
        method: 'POST',
        data: { settings },
    });
}

export function startScan(entryUrl, maxPages = 25) {
    return apiFetch({
        path: '/cwas/v1/scanner/start',
        method: 'POST',
        data: { entryUrl, maxPages },
    });
}

export function getScanResults(scanId) {
    return apiFetch({ path: `/cwas/v1/scanner/results?scanId=${scanId}` });
}
