#!/usr/bin/env bash
# Builds a WordPress-ready plugin ZIP (forward-slash paths for Linux hosting).
#
# Usage (from the plugin folder):
#   bash scripts/build-release-zip.sh
#
# Options:
#   --skip-build   Skip npm run build (use existing build/ output)
#   --skip-i18n    Skip regenerating languages/*.l10n.php from *.po

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="clearweb-accessibility-add-on"
DIST="$ROOT/dist"
STAGE="$DIST/$SLUG"
ZIP="$ROOT/$SLUG.zip"

SKIP_BUILD=false
SKIP_I18N=false

for arg in "$@"; do
	case "$arg" in
		--skip-build) SKIP_BUILD=true ;;
		--skip-i18n) SKIP_I18N=true ;;
	esac
done

echo "Clearweb Accessibility Add-on - release ZIP"
echo "Plugin root: $ROOT"
echo ""

if [[ "$SKIP_I18N" != true ]]; then
	PO="$ROOT/languages/clearweb-accessibility-add-on-he_IL.po"
	if [[ -f "$PO" ]] && command -v wp >/dev/null 2>&1; then
		echo "Regenerating Hebrew l10n.php..."
		( cd "$ROOT" && wp i18n make-php "$PO" languages/ )
		echo ""
	fi
fi

if [[ "$SKIP_BUILD" != true ]]; then
	echo "Building JS/CSS (npm run build)..."
	( cd "$ROOT" && npm run build --silent )
	echo ""
fi

rm -rf "$STAGE"
mkdir -p "$STAGE/assets/css" "$STAGE/assets/images"

cp "$ROOT/clearweb-accessibility-suite.php" "$STAGE/"
cp "$ROOT/uninstall.php" "$STAGE/" 2>/dev/null || true
cp "$ROOT/readme.txt" "$STAGE/" 2>/dev/null || true
cp "$ROOT/license.txt" "$STAGE/" 2>/dev/null || true
cp "$ROOT/INSTALL-STAGING.txt" "$STAGE/" 2>/dev/null || true
cp -r "$ROOT/includes" "$STAGE/includes"
cp -r "$ROOT/build" "$STAGE/build"
cp -r "$ROOT/assets/src" "$STAGE/assets/src"
cp -r "$ROOT/assets/fonts" "$STAGE/assets/fonts"
cp -r "$ROOT/languages" "$STAGE/languages"
cp "$ROOT/package.json" "$STAGE/"
cp "$ROOT/package-lock.json" "$STAGE/"
cp "$ROOT/webpack.config.js" "$STAGE/"
cp "$ROOT/assets/css/"*.css "$STAGE/assets/css/"
cp "$ROOT/assets/images/"* "$STAGE/assets/images/" 2>/dev/null || true

SILENCE='<?php
// Silence is golden.
'

while IFS= read -r -d '' dir; do
	if [[ ! -f "$dir/index.php" ]]; then
		printf '%s' "$SILENCE" > "$dir/index.php"
	fi
done < <(find "$STAGE" -type d -print0)

if [[ ! -f "$STAGE/index.php" ]]; then
	printf '%s' "$SILENCE" > "$STAGE/index.php"
fi

if [[ ! -f "$STAGE/clearweb-accessibility-suite.php" ]]; then
	echo "Missing main plugin file in stage." >&2
	exit 1
fi

rm -f "$ZIP"
( cd "$DIST" && zip -rq "$ZIP" "$SLUG" )

if ! unzip -l "$ZIP" | grep -q "${SLUG}/clearweb-accessibility-suite.php"; then
	echo "ZIP missing required entry: ${SLUG}/clearweb-accessibility-suite.php" >&2
	exit 1
fi

KB=$(( $(stat -c%s "$ZIP" 2>/dev/null || stat -f%z "$ZIP") / 1024 ))
echo "Created: $ZIP (${KB} KB)"
echo ""
echo "Deploy:"
echo "  1. Upload ZIP in WP Admin -> Plugins -> Add New -> Upload Plugin"
echo "  2. Replace the old plugin folder if updating"
echo "  3. Purge cache and hard-refresh"
echo ""
echo "Server path after install:"
echo "  wp-content/plugins/$SLUG/clearweb-accessibility-suite.php"

rm -rf "$DIST"
