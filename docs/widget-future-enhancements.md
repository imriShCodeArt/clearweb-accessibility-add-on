# Accessibility Widget – Future Enhancements

This document lists suggested additions to the accessibility widget, grouped by category.
Items marked **§22** are explicitly listed in `a11y-overlay-functional-spec.md` as planned future work.
All others are recommendations based on real-world accessibility overlay patterns and WCAG guidance.

---

## 1. Visual & Typography

| Feature | Description | WCAG Relevance |
|---|---|---|
| **Decrease text** | Step-down counterpart to Increase text. Currently the scale cycle wraps but a dedicated reduce button is more discoverable. | 1.4.4 |
| **Line height** | Step control: 1× → 1.4 → 1.8 → 2.2. | 1.4.12 |
| **Letter spacing** | Step control to loosen character spacing. Especially useful for users with dyslexia. | 1.4.12 |
| **Word spacing** | Independent step control, separate from letter spacing. | 1.4.12 |
| **Dyslexia-friendly font** §22 | Swap to OpenDyslexic (free, open-source) instead of the generic readable-font Arial fallback. | 1.4.12 |
| **Larger cursor** | Inject a CSS override for `cursor: url(large-cursor.svg), auto` sitewide. Useful for low vision and motor impairment. | 2.5.3 |
| **Custom highlight color** | Let users pick their own focus ring / highlight color, affecting all `--cwas-primary` usages across the widget. | 1.4.1 |

---

## 2. Reading & Focus Aids

| Feature | Description | WCAG Relevance |
|---|---|---|
| **Reading mask / ruler** §22 | A semi-transparent horizontal bar that follows the pointer to isolate one line at a time, reducing distraction. | 1.4.8 |
| **Text-to-speech / Read aloud** | Read the currently focused paragraph aloud using the browser `speechSynthesis` Web Speech API. | 1.1.1 |
| **Zoom text area** | A magnified floating copy of the element under the pointer, useful at standard browser zoom. | 1.4.4 |
| **Syllable highlighting** | Color-alternating syllable rendering to aid decoding. Common in dyslexia support tools. | 1.4.12 |
| **Pause GIFs** | Replace animated GIFs with their first frame using a canvas snapshot; resume on click. Distinct from Stop animations which only targets CSS. | 2.2.2 |

---

## 3. Color & Vision

| Feature | Description | WCAG Relevance |
|---|---|---|
| **Color blindness filters** | Named SVG matrix presets for deuteranopia, protanopia, and tritanopia applied via `filter: url(#matrix)`. | 1.4.1 |
| **Night mode** | Warm-toned dark mode (reduced blue channel, softer than dark contrast). Useful for photosensitivity. | 1.4.3 |
| **Invert colors** | `filter: invert(1)` on `body` while keeping images and video uninverted via a counter-invert rule. | 1.4.3 |

---

## 4. Navigation & Keyboard

| Feature | Description | WCAG Relevance |
|---|---|---|
| **Skip-link injector** §22 | Programmatically insert a "Skip to main content" link if the page does not already provide one. | 2.4.1 |
| **Keyboard shortcuts reference** §22 | Show a reference panel of common browser and screen-reader keyboard shortcuts. | 2.1.1 |
| **ARIA landmark navigator** | List all ARIA landmarks on the page (`main`, `nav`, `aside`, `banner`, `contentinfo`) as clickable jump links inside the panel. | 2.4.1 |
| **Custom focus ring** | Independently configurable focus indicator: thickness, color, and style (outline vs box-shadow), separate from the existing Focused content mode. | 2.4.11 |

---

## 5. Forms & Content

| Feature | Description | WCAG Relevance |
|---|---|---|
| **Form label detector** §22 | Scan visible `<input>`, `<select>`, and `<textarea>` elements that are missing an associated `<label>` or `aria-label` and highlight them with a visible warning badge. | 1.3.1, 3.3.2 |
| **Show image alt text** | Display each image's `alt` attribute as a visible caption overlay beneath or above the image. | 1.1.1 |
| **Table navigation helper** | Inject row and column header tooltips on `<td>` hover for data tables that lack `<th>` or `scope` attributes. | 1.3.1 |

---

## 6. Admin-Facing Features

| Feature | Description |
|---|---|
| **Usage analytics** (opt-in) | Count which toggles are activated most often; exposed in the admin dashboard. Helps site owners understand user needs without collecting personal data. |
| **Admin widget preview** | Live preview of the trigger button position and color in the plugin settings page, without needing to visit the front end. |
| **Allowed-features list** | Per the spec §14.2: let admins enable or disable individual controls so only contextually relevant options are shown. |
| **Accessibility problem report form** §22 | A built-in modal for visitors to submit an accessibility complaint — fields: name, email, page URL, problem category, description. Optional screenshot via the Screen Capture API. |
| **Profile save / load** | Let authenticated users save and restore named preference sets (e.g. "Office", "Night reading"). Stored in user meta for logged-in users, `localStorage` for guests. |

---

## 7. Spec §22 Items (Direct Quotes)

The following are explicitly listed in the functional specification under §22 Future Enhancements and are not yet implemented:

- Reading mask
- Text spacing controls (line height, word spacing, letter spacing)
- Dyslexia-friendly mode
- Keyboard navigation helper
- Skip-link generator
- Form field label detector
- Image alt warning layer for admins
- Frontend issue reporting with screenshot capture
- Admin-side accessibility statement generator
- Integration with the site scanner (surface scanner-found issues directly in the widget)

---

## 8. Recommended Implementation Order

The following prioritization is based on user impact, implementation complexity, and WCAG 2.2 coverage gaps:

| Priority | Feature | Reason |
|---|---|---|
| 1 | Line height + letter spacing | Directly addresses WCAG 1.4.12 (Text Spacing). Low complexity — CSS variable steps. |
| 2 | Dyslexia-friendly font | OpenDyslexic is free. High demand, straightforward font-face swap. |
| 3 | Reading mask | Very high impact for users with attention or visual tracking difficulties. No external dependencies. |
| 4 | Skip-link injector | Pure keyboard-navigation benefit. Safe to inject conditionally and reversible. |
| 5 | Color blindness filters | Large underserved audience. SVG filter matrices are well-documented and lightweight. |
| 6 | Form label detector | Complements the site scanner; visible to users in real time. |
| 7 | Keyboard shortcuts reference | Zero side-effects; purely informational. |
| 8 | Problem report form | Closes the feedback loop for users who encounter barriers. |
| 9 | ARIA landmark navigator | Useful for keyboard-only users; requires a DOM traversal on panel open. |
| 10 | Usage analytics (opt-in) | Business intelligence for site owners; must be privacy-compliant. |

---

## 9. Implementation Notes

### Text spacing (WCAG 1.4.12)
Apply as CSS custom properties on `html`:
```css
html {
  --a11y-line-height:    normal;
  --a11y-letter-spacing: normal;
  --a11y-word-spacing:   normal;
}
body * {
  line-height:    var(--a11y-line-height)    !important;
  letter-spacing: var(--a11y-letter-spacing) !important;
  word-spacing:   var(--a11y-word-spacing)   !important;
}
```

### Dyslexia font
Load OpenDyslexic from a bundled woff2 file (avoid CDN for privacy):
```css
@font-face {
  font-family: 'OpenDyslexic';
  src: url('../fonts/OpenDyslexic-Regular.woff2') format('woff2');
}
html.a11y-dyslexia-font * {
  font-family: 'OpenDyslexic', sans-serif !important;
}
```

### Color blindness filters
Declare SVG filter definitions in a hidden `<svg>` injected once into `<body>`, then reference by ID:
```css
html.a11y-cvd-deuteranopia body { filter: url(#cvd-deuteranopia) !important; }
html.a11y-cvd-protanopia   body { filter: url(#cvd-protanopia)   !important; }
html.a11y-cvd-tritanopia   body { filter: url(#cvd-tritanopia)   !important; }
```

### Reading mask
Track `mousemove` with `requestAnimationFrame`, position a fixed overlay element. Use `pointer-events: none` so it never blocks interaction:
```js
const mask = document.createElement('div');
mask.className = 'cwas-reading-mask';
mask.style.pointerEvents = 'none';
document.addEventListener('mousemove', (e) => {
  if (!state.readingMask) return;
  mask.style.top = (e.clientY - 20) + 'px';
});
```

### Skip-link injector
Check for an existing skip link before injecting:
```js
function injectSkipLink() {
  if (document.querySelector('a[href="#main"], a[href="#content"]')) return;
  const main = document.querySelector('main, [role="main"], #main, #content');
  if (!main) return;
  if (!main.id) main.id = 'cwas-main-content';
  const link = document.createElement('a');
  link.href = '#' + main.id;
  link.className = 'cwas-skip-link';
  link.textContent = i18n.skipToContent || 'Skip to main content';
  document.body.prepend(link);
}
```
