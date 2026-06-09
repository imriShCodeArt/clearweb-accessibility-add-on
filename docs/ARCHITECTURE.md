# Architecture

## Runtime layers

- PHP plugin bootstrap: activation, database tables, WordPress hooks, admin menu, REST routes.
- Admin app: React-based control panel compiled by @wordpress/scripts.
- Frontend assets: accessibility widget and cookie banner.
- Services: scanner, AI provider abstraction, document generators, cookie script registry.

## REST API

Namespace: `/wp-json/cwas/v1`

- `GET /settings`
- `POST /settings`
- `POST /alt-text/generate`
- `POST /statement/draft`
- `POST /scanner/start`
- `GET /scanner/results?scanId=ID`
- `GET /cookie/settings`
- `POST /cookie/settings`
- `POST /cookie/consent`
- `POST /legal/draft`

## Data model

- `wp_cwas_scans`: scan status and summary.
- `wp_cwas_scan_issues`: issue records connected to scans.
- Options: `cwas_settings`, `cwas_cookie_settings`, `cwas_ai_settings`.

## Cookie model

Optional scripts should be registered by category and loaded only after consent. The banner alone is not enough. The plugin must prevent analytics/marketing scripts from being printed before the consent state is known.

## Scanner model

Start with server-side checks for HTML-level issues. Add browser-level axe-core checks for rendered DOM issues in a later phase.
