# Clearweb Accessibility Suite

Modular WordPress plugin scaffold for:

1. Frontend accessibility menu
2. AI alt text for images
3. Accessibility statement interview and HTML draft generation
4. Accessibility / bug scanning
5. Cookie banner with consent-first script loading
6. Optional privacy policy and terms draft assistant

## Local setup

```bash
cd wp-content/plugins/clearweb-accessibility-suite
npm install
npm run build
```

Then activate the plugin in WordPress Admin.

## Development priorities

1. Build the admin settings screen.
2. Implement reliable cookie script blocking before optional scripts load.
3. Implement scan result UI and queue safety.
4. Implement AI provider abstraction and rate limiting.
5. Add tests and security hardening.

## Important product note

The accessibility widget is an assistive layer. Do not present it as a substitute for semantic remediation, WCAG testing, or professional review.
