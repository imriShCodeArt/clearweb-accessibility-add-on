Translations for Clearweb Accessibility Add-on.

Included:
- clearweb-accessibility-add-on-he_IL.po  — Hebrew catalog (edit with Poedit, Loco, etc.)
- clearweb-accessibility-add-on-he_IL.l10n.php — Hebrew (WordPress 6.5+)

To enable Hebrew:
1. In WordPress admin, go to Settings → General.
2. Set Site Language to עברית (Hebrew).

To compile a .mo file from the .po file (optional, for older WordPress):
  msgfmt -o clearweb-accessibility-add-on-he_IL.mo clearweb-accessibility-add-on-he_IL.po

Or with WP-CLI from the plugin directory:
  wp i18n make-mo languages
