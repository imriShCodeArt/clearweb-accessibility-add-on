# Accessibility Overlay Functional Specification

## 1. Purpose

This document characterizes a frontend accessibility overlay widget for a website or WordPress plugin. The overlay provides user-controlled visual, reading, navigation, and interaction adjustments through a floating accessibility button and an expandable control panel.

The overlay should help users customize the browsing experience, but it must not be treated as a replacement for proper semantic HTML, keyboard support, ARIA usage, color contrast, focus management, accessible forms, captions, and WCAG-level remediation of the underlying website.

## 2. High-Level Product Description

The accessibility overlay consists of:

1. A floating accessibility trigger button.
2. A slide-out or popup accessibility menu.
3. Grouped accessibility controls.
4. Persistent user preferences.
5. Reset and disable options.
6. Links to accessibility-related support pages or contact flows.

The widget should work on desktop and mobile, support right-to-left and left-to-right layouts, and avoid interfering with native browser or assistive technology behavior.

## 3. Main UI Components

### 3.1 Floating Accessibility Button

The floating button is the main entry point for the accessibility menu.

#### Requirements

- Fixed position on the viewport.
- Usually placed on the left or right side of the screen.
- Must remain visible while scrolling.
- Must be keyboard focusable.
- Must have an accessible name, for example: `Open accessibility menu`.
- Must expose expanded/collapsed state using `aria-expanded`.
- Must reference the menu container using `aria-controls`.
- Must not obscure critical page actions where possible.
- User should be able to reposition it if the overlay supports multiple placements.

#### Suggested behavior

- Click, tap, `Enter`, or `Space` opens the panel.
- Pressing `Escape` while the panel is open closes it.
- The button icon should clearly suggest accessibility, settings, or user preferences.

## 4. Accessibility Menu Panel

The panel is the expanded interface containing all accessibility controls.

### 4.1 Layout

The menu should include:

- Header bar.
- Language selector.
- Optional appearance/settings controls.
- Close button.
- Grouped control sections.
- Bottom action bar.
- Footer note or small branding area, if needed.

### 4.2 Panel requirements

- Must be keyboard navigable.
- Must have a clear accessible label, for example: `Accessibility settings`.
- Must trap focus only if implemented as a modal dialog.
- If not modal, focus behavior should still be predictable.
- Must return focus to the floating button when closed.
- Must support scroll inside the panel if content exceeds viewport height.
- Must not create keyboard traps.
- Must use semantic buttons for actions.
- Each toggle must expose current state with `aria-pressed`, `aria-checked`, or equivalent semantics.

## 5. Header Controls

### 5.1 Language Selector

Allows users to change the widget interface language.

#### Functional requirements

- Display current language.
- Open a language list or dropdown.
- Support at least the site’s primary language and English.
- Update all overlay labels immediately after selection.
- Persist selected language in local storage or user preference storage.
- Support RTL languages such as Hebrew and Arabic.

### 5.2 Visual Style / Theme Control

Optional control for changing the overlay panel’s own appearance.

#### Possible functions

- Light menu theme.
- Dark menu theme.
- System theme.
- Brand-colored theme.

This should affect the overlay UI itself and not necessarily the website content unless explicitly defined as an accessibility mode.

### 5.3 Position or Direction Toggle

Optional control that changes the overlay placement or reading direction.

#### Possible functions

- Move floating button from left to right.
- Move panel from left side to right side.
- Switch menu layout between RTL and LTR.
- Adjust alignment to avoid blocking important content.

### 5.4 Close Button

Closes the accessibility menu.

#### Requirements

- Must be a native `button` element.
- Must have an accessible label such as `Close accessibility menu`.
- Must be reachable by keyboard.
- Must return focus to the floating accessibility button after closing.

## 6. Control Sections

The overlay should organize controls into clear sections. Based on the observed widget structure, the main sections are:

1. Reading aids.
2. Contrast and color adjustments.
3. Additional aids.
4. Bottom actions.

## 7. Reading Aids

Reading aids help users visually parse text, links, headings, and content structure.

### 7.1 Highlight Links

#### Purpose

Makes links easier to identify.

#### Behavior

- Adds a visible underline, outline, background, icon, or color treatment to links.
- Should target real links only: `a[href]`.
- Should avoid changing buttons or non-link controls unless intentionally included.
- Must maintain sufficient contrast.

#### Suggested implementation

Add a class to the root element:

```css
.a11y-highlight-links a[href] {
  text-decoration: underline !important;
  text-decoration-thickness: 0.15em !important;
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
```

### 7.2 Highlight Headings

#### Purpose

Makes page structure easier to scan.

#### Behavior

- Visually emphasizes headings `h1` through `h6`.
- May add background, outline, left/right border, or icon.
- Should not change the heading hierarchy.

#### Suggested targets

```css
h1, h2, h3, h4, h5, h6
```

### 7.3 Readable Font

#### Purpose

Replaces decorative or hard-to-read fonts with a simpler font stack.

#### Behavior

- Applies a readable system font to text content.
- Should avoid icon fonts and code blocks where possible.
- Should not break layout.

#### Suggested font stack

```css
font-family: Arial, Helvetica, sans-serif !important;
```

A better implementation should exclude icon font classes and SVG-based icons.

### 7.4 Focused Content Mode

#### Purpose

Helps users focus on the currently selected or hovered content area.

#### Possible behavior

- Adds a visual outline to the currently focused element.
- Dims surrounding content when a major region is selected.
- Highlights paragraph, list item, heading, button, link, or form field under focus.

#### Requirements

- Must not hide content from screen readers.
- Must not remove browser focus indicators.
- Should enhance focus visibility rather than replace it.

### 7.5 Reading Content Mode

#### Purpose

Improves readability by emphasizing the active reading area.

#### Possible behavior

- Adds a horizontal reading guide line.
- Highlights the paragraph under the cursor.
- Increases line height and paragraph spacing.
- Limits visual distractions around text.

#### Suggested behavior

When enabled, track pointer movement and apply a temporary class to the nearest text block.

Suggested target elements:

```text
p, li, blockquote, article, section, main, h1-h6
```

### 7.6 Increase Text Size

#### Purpose

Allows users to enlarge text.

#### Behavior

- Increase text size in steps.
- Example levels: 100%, 110%, 120%, 130%, 140%, 150%.
- Should persist selected level.
- Should provide a way to cycle levels or reset.
- Should avoid resizing icons unintentionally.

#### Suggested implementation

Use a CSS variable on the root:

```css
html {
  --a11y-font-scale: 1;
}

body {
  font-size: calc(1rem * var(--a11y-font-scale));
}
```

In practice, text scaling is complex on existing sites. Test against menus, buttons, cards, modals, and mobile layouts.

## 8. Contrast and Color Adjustments

These controls modify the visual presentation of the page to support users with low vision, color sensitivity, or contrast preferences.

Only one contrast mode should usually be active at a time. Saturation modes can either be mutually exclusive or combined with contrast modes, depending on implementation decisions.

### 8.1 High Contrast

#### Purpose

Applies a strong contrast mode to improve visibility.

#### Behavior

- Increase contrast between text and background.
- Avoid low-contrast text.
- Preserve visible focus outlines.
- Avoid destroying meaning conveyed by existing colors.

#### Suggested approach

Apply a root class and use CSS variables where possible:

```css
html.a11y-contrast-high {
  background: #000 !important;
  color: #fff !important;
}

html.a11y-contrast-high body,
html.a11y-contrast-high main,
html.a11y-contrast-high section,
html.a11y-contrast-high article {
  background: #000 !important;
  color: #fff !important;
}

html.a11y-contrast-high a {
  color: #ffff00 !important;
}
```

### 8.2 Light Contrast

#### Purpose

Provides a bright, simplified contrast scheme.

#### Behavior

- Light background.
- Dark text.
- Clear borders and controls.
- Useful for users who prefer bright, clean reading conditions.

### 8.3 Dark Contrast

#### Purpose

Provides a dark reading mode.

#### Behavior

- Dark background.
- Light text.
- Clear link and button styles.
- Should preserve image visibility where possible.

### 8.4 Monochrome

#### Purpose

Removes color information and converts the page to grayscale.

#### Behavior

- Applies grayscale rendering to page content.
- Should not make text unreadable.
- Should preserve focus and controls.

#### Suggested CSS

```css
html.a11y-monochrome body {
  filter: grayscale(1) !important;
}
```

### 8.5 Low Saturation

#### Purpose

Reduces color intensity for users sensitive to bright colors.

#### Behavior

- Applies partial desaturation.
- Should still preserve contrast.

#### Suggested CSS

```css
html.a11y-saturation-low body {
  filter: saturate(0.5) !important;
}
```

### 8.6 High Saturation

#### Purpose

Increases color intensity for users who benefit from stronger visual distinction.

#### Behavior

- Applies increased saturation.
- Should avoid extreme color distortion.

#### Suggested CSS

```css
html.a11y-saturation-high body {
  filter: saturate(1.5) !important;
}
```

## 9. Additional Aids

### 9.1 Stop Animations

#### Purpose

Reduces motion and prevents distracting or uncomfortable animation.

#### Behavior

- Pause CSS animations.
- Pause CSS transitions where possible.
- Stop animated GIFs if technically feasible.
- Pause sliders, carousels, auto-scrolling content, and autoplay video where possible.

#### Suggested CSS baseline

```css
html.a11y-stop-animations *,
html.a11y-stop-animations *::before,
html.a11y-stop-animations *::after {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
  scroll-behavior: auto !important;
}
```

Also respect the native media query:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 9.2 Hide Images

#### Purpose

Removes visual clutter for users who prefer text-focused browsing.

#### Behavior

- Hide decorative and content images visually.
- Ideally preserve `alt` text where useful.
- Avoid hiding essential icons without replacement labels.
- Should not remove images from the accessibility tree unless intentional.

#### Suggested implementation options

Option A: hide images entirely:

```css
html.a11y-hide-images img,
html.a11y-hide-images picture,
html.a11y-hide-images svg[role="img"] {
  visibility: hidden !important;
}
```

Option B: replace images with alt text where possible using JavaScript-generated placeholders.

### 9.3 Stop Audio

#### Purpose

Stops or mutes audio playing on the page.

#### Behavior

- Find `audio` and `video` elements.
- Pause media.
- Mute media if needed.
- Store previous state only if a reliable restore flow is implemented.

#### Suggested JavaScript

```js
document.querySelectorAll('audio, video').forEach((media) => {
  media.pause();
  media.muted = true;
});
```

### 9.4 Reading Mode

#### Purpose

Simplifies the page for reading.

#### Possible behavior

- Increase line height.
- Increase paragraph spacing.
- Limit content width.
- Hide non-essential decorative elements.
- Emphasize main content.

#### Caution

A true reader mode is difficult to implement safely across arbitrary websites. It should not remove important navigation, forms, legal notices, cookie controls, or checkout elements without a clear user-controlled way back.

### 9.5 Highlight Click

#### Purpose

Shows a visible indication when the user clicks or taps.

#### Behavior

- Display a short visual pulse around clicked elements.
- Useful for motor, attention, and visual tracking support.
- Should not interfere with the actual click event.

#### Suggested implementation

- Add temporary class to clicked element.
- Remove the class after 300-700 ms.

### 9.6 Highlight Hover

#### Purpose

Highlights elements as the user hovers over them.

#### Behavior

- Add outline or background to hovered interactive elements.
- May include links, buttons, inputs, selects, textareas, and elements with `role="button"`.

#### Suggested CSS

```css
html.a11y-highlight-hover a:hover,
html.a11y-highlight-hover button:hover,
html.a11y-highlight-hover input:hover,
html.a11y-highlight-hover select:hover,
html.a11y-highlight-hover textarea:hover,
html.a11y-highlight-hover [role="button"]:hover {
  outline: 3px solid currentColor !important;
  outline-offset: 3px !important;
}
```

## 10. Bottom Action Bar

### 10.1 Accessibility Statement

#### Purpose

Provides quick access to the site’s accessibility statement.

#### Behavior

- Opens the accessibility statement page.
- Can open in the same tab or a modal.
- URL should be configurable in the admin settings.
- If no statement URL exists, optionally hide this button or show a fallback contact option.

### 10.2 Help / Distress / Report Problem Button

#### Purpose

Allows users to request help or report an accessibility problem.

#### Possible behavior

- Opens contact form.
- Opens email link.
- Opens phone/WhatsApp action.
- Opens issue reporting modal.

#### Recommended fields for report form

- Name.
- Email or phone.
- Page URL.
- Problem category.
- Description.
- Optional screenshot.
- Consent checkbox, if required by the site’s privacy policy.

### 10.3 Disable / Reset Accessibility

#### Purpose

Turns off active accessibility adjustments.

#### Behavior

- Remove all overlay-applied classes.
- Reset all toggles to inactive.
- Clear saved preferences if the user selects full reset.
- Keep the floating button visible unless the user explicitly hides the widget.

Recommended labels:

- `Reset accessibility settings`
- `Disable accessibility adjustments`

## 11. State Management

### 11.1 Toggle Model

Controls can be divided into:

#### Independent toggles

Can be enabled together:

- Highlight links.
- Highlight headings.
- Readable font.
- Stop animations.
- Hide images.
- Highlight hover.
- Highlight click.

#### Mutually exclusive modes

Only one should be active at a time:

- High contrast.
- Light contrast.
- Dark contrast.

#### Step-based controls

Cycle through levels:

- Text size.
- Cursor size, if added later.
- Line spacing, if added later.

### 11.2 Persistence

Use `localStorage` for anonymous local persistence.

Suggested storage key:

```text
a11y_overlay_preferences
```

Example state shape:

```json
{
  "language": "he",
  "position": "left",
  "highlightLinks": true,
  "highlightHeadings": false,
  "readableFont": true,
  "fontScale": 1.2,
  "contrastMode": "dark",
  "saturationMode": null,
  "stopAnimations": true,
  "hideImages": false,
  "stopAudio": false,
  "readingMode": false,
  "highlightClick": true,
  "highlightHover": false
}
```

### 11.3 Applying State

The recommended implementation is to apply classes and CSS variables to the root `html` element.

Example:

```html
<html class="a11y-readable-font a11y-highlight-links a11y-contrast-dark">
```

Example CSS variable:

```css
html {
  --a11y-font-scale: 1.2;
}
```

## 12. Recommended DOM Structure

```html
<button
  type="button"
  class="a11y-trigger"
  aria-label="Open accessibility menu"
  aria-controls="a11y-panel"
  aria-expanded="false"
>
  <span aria-hidden="true">Accessibility icon</span>
</button>

<div
  id="a11y-panel"
  class="a11y-panel"
  role="dialog"
  aria-modal="false"
  aria-labelledby="a11y-panel-title"
  hidden
>
  <header class="a11y-panel-header">
    <h2 id="a11y-panel-title">Accessibility settings</h2>
    <button type="button" class="a11y-close">Close</button>
  </header>

  <section aria-labelledby="a11y-reading-aids-title">
    <h3 id="a11y-reading-aids-title">Reading aids</h3>
    <button type="button" aria-pressed="false" data-a11y-toggle="highlightLinks">Highlight links</button>
    <button type="button" aria-pressed="false" data-a11y-toggle="highlightHeadings">Highlight headings</button>
    <button type="button" aria-pressed="false" data-a11y-toggle="readableFont">Readable font</button>
    <button type="button" aria-pressed="false" data-a11y-toggle="focusContent">Focused content</button>
    <button type="button" aria-pressed="false" data-a11y-toggle="readingContent">Reading content</button>
    <button type="button" data-a11y-step="fontScale">Increase text</button>
  </section>

  <section aria-labelledby="a11y-contrast-title">
    <h3 id="a11y-contrast-title">Contrast</h3>
    <button type="button" aria-pressed="false" data-a11y-mode="contrast" data-value="high">High contrast</button>
    <button type="button" aria-pressed="false" data-a11y-mode="contrast" data-value="light">Light contrast</button>
    <button type="button" aria-pressed="false" data-a11y-mode="contrast" data-value="dark">Dark contrast</button>
    <button type="button" aria-pressed="false" data-a11y-mode="saturation" data-value="monochrome">Monochrome</button>
    <button type="button" aria-pressed="false" data-a11y-mode="saturation" data-value="low">Low saturation</button>
    <button type="button" aria-pressed="false" data-a11y-mode="saturation" data-value="high">High saturation</button>
  </section>

  <section aria-labelledby="a11y-extra-title">
    <h3 id="a11y-extra-title">Additional aids</h3>
    <button type="button" aria-pressed="false" data-a11y-toggle="stopAnimations">Stop animations</button>
    <button type="button" aria-pressed="false" data-a11y-toggle="hideImages">Hide images</button>
    <button type="button" aria-pressed="false" data-a11y-action="stopAudio">Stop audio</button>
    <button type="button" aria-pressed="false" data-a11y-toggle="readingMode">Reading mode</button>
    <button type="button" aria-pressed="false" data-a11y-toggle="highlightClick">Highlight click</button>
    <button type="button" aria-pressed="false" data-a11y-toggle="highlightHover">Highlight hover</button>
  </section>

  <footer class="a11y-panel-footer">
    <a href="/accessibility-statement">Accessibility statement</a>
    <button type="button" data-a11y-action="openHelp">Accessibility help</button>
    <button type="button" data-a11y-action="reset">Reset settings</button>
  </footer>
</div>
```

## 13. Suggested JavaScript Architecture

### 13.1 Core Modules

```text
/a11y-overlay
  /core
    state-manager.js
    storage.js
    apply-preferences.js
    events.js
  /features
    highlight-links.js
    highlight-headings.js
    readable-font.js
    font-scale.js
    contrast.js
    saturation.js
    stop-animations.js
    hide-images.js
    stop-audio.js
    reading-mode.js
    highlight-click.js
    highlight-hover.js
  /ui
    render-panel.js
    focus-management.js
    language.js
    position.js
  /styles
    overlay.css
    effects.css
```

### 13.2 State Manager Responsibilities

- Load saved preferences.
- Merge saved preferences with defaults.
- Update state when controls are used.
- Persist state.
- Notify feature modules after changes.
- Reset state.

### 13.3 Feature Module Responsibilities

Each feature should:

- Declare its default state.
- Apply its behavior.
- Remove its behavior.
- Avoid side effects outside its scope.
- Be testable independently.

## 14. WordPress Plugin Considerations

### 14.1 Frontend Loading

The plugin should enqueue:

- Frontend JavaScript.
- Frontend CSS.
- Optional SVG sprite or icon set.
- Translation files.

Use WordPress enqueue APIs:

```php
wp_enqueue_script();
wp_enqueue_style();
wp_localize_script();
```

### 14.2 Admin Settings

Recommended settings:

- Enable/disable overlay.
- Button position: left, right, bottom-left, bottom-right.
- Default language.
- Supported languages.
- Accessibility statement URL.
- Help/contact method.
- Help button label.
- Primary color.
- Panel theme.
- Whether to show footer branding.
- Whether to remember user preferences.
- Allowed features: enable/disable individual controls.

### 14.3 Shortcode or Block

Optional features:

- Shortcode for accessibility statement link.
- Gutenberg block for accessibility statement.
- Admin preview of widget.

### 14.4 Multisite

If supporting WordPress multisite:

- Allow network defaults.
- Allow per-site overrides.
- Avoid storing site-specific settings globally unless intended.

## 15. Internationalization

The overlay should not hardcode UI strings.

### Recommended string keys

```json
{
  "openMenu": "Open accessibility menu",
  "closeMenu": "Close accessibility menu",
  "chooseLanguage": "Choose language",
  "readingAids": "Reading aids",
  "highlightLinks": "Highlight links",
  "highlightHeadings": "Highlight headings",
  "readableFont": "Readable font",
  "focusContent": "Focused content",
  "readingContent": "Reading content",
  "increaseText": "Increase text",
  "contrast": "Contrast",
  "highContrast": "High contrast",
  "lightContrast": "Light contrast",
  "darkContrast": "Dark contrast",
  "monochrome": "Monochrome",
  "lowSaturation": "Low saturation",
  "highSaturation": "High saturation",
  "additionalAids": "Additional aids",
  "stopAnimations": "Stop animations",
  "hideImages": "Hide images",
  "stopAudio": "Stop audio",
  "readingMode": "Reading mode",
  "highlightClick": "Highlight click",
  "highlightHover": "Highlight hover",
  "accessibilityStatement": "Accessibility statement",
  "accessibilityHelp": "Accessibility help",
  "resetAccessibility": "Reset accessibility settings"
}
```

## 16. Accessibility Requirements for the Overlay Itself

The overlay must itself be accessible.

### Required behavior

- Full keyboard operation.
- Visible focus indicator.
- Correct semantic controls.
- No keyboard traps.
- Screen-reader-friendly labels.
- State announcements for toggles.
- Logical tab order.
- Escape key closes panel.
- Focus returns to trigger after closing.
- Menu remains usable at 200% and 400% zoom.
- Menu works on mobile screen sizes.
- Does not override browser zoom.
- Does not block screen-reader virtual cursor navigation.

### Required ARIA patterns

- Use `button` for actions.
- Use `aria-pressed` for toggle buttons.
- Use `aria-expanded` on the floating trigger.
- Use `aria-controls` to connect trigger to panel.
- Use `role="dialog"` only if the panel behaves like a dialog.
- Avoid excessive ARIA where native HTML is enough.

## 17. Performance Requirements

The overlay should be lightweight.

### Targets

- Load CSS and JS only on the frontend where needed.
- Avoid large dependencies.
- Avoid layout thrashing from continuous DOM scanning.
- Use event delegation where possible.
- Debounce pointer and resize handlers.
- Avoid applying inline styles to every element unless necessary.
- Prefer root classes and CSS inheritance.

## 18. Privacy Requirements

The basic overlay should not require personal data collection.

### Privacy rules

- Store preferences locally where possible.
- Do not track accessibility feature usage unless explicitly disclosed and consented to.
- If analytics are used, make them optional and privacy-compliant.
- If the help/report form collects personal data, disclose what is collected and why.
- Do not send page content to external services unless the user/admin explicitly enables that feature.

## 19. Security Requirements

- Sanitize admin-configured labels and URLs.
- Escape output in PHP templates.
- Validate URLs for accessibility statement and contact links.
- Use nonces for admin settings saves.
- Follow WordPress capability checks for admin actions.
- Avoid injecting unsanitized HTML into the frontend.

## 20. Suggested Acceptance Criteria

### Floating button

- The button is visible on every enabled page.
- The button can be opened with mouse, touch, `Enter`, and `Space`.
- The button has a correct accessible name.
- The button does not block core site controls on common viewport sizes.

### Panel

- The panel opens and closes reliably.
- `Escape` closes the panel.
- Focus returns to the trigger button after closing.
- The panel is usable with keyboard only.
- The panel is usable at 400% browser zoom.

### Toggles

- Each toggle has a visible active state.
- Each toggle exposes active state to assistive technologies.
- Settings persist after page reload, if persistence is enabled.
- Reset clears all active adjustments.

### Visual modes

- Contrast modes are mutually exclusive.
- Text remains readable after applying contrast modes.
- Focus indicators remain visible in all modes.
- Saturation modes do not make controls unusable.

### Media controls

- Stop animations reduces CSS animations and transitions.
- Stop audio pauses and/or mutes native audio and video elements.
- Hide images does not make essential controls inaccessible.

### Links and support

- Accessibility statement button opens the configured URL.
- Help/report button opens the configured support method.
- Missing configuration is handled gracefully.

## 21. Development Notes

### Do not overpromise

The overlay should be described as a user preference and assistance layer. It should not claim to make any website fully accessible by itself.

### Prioritize native accessibility first

The website should still be remediated at source level:

- Correct heading hierarchy.
- Keyboard-accessible menus.
- Accessible forms.
- Proper labels.
- Adequate color contrast.
- Meaningful link text.
- Text alternatives for images.
- Accessible modals.
- Skip links.
- Landmarks.
- Error messages.

### Recommended first MVP

For a first working version, prioritize:

1. Floating trigger button.
2. Accessible panel open/close behavior.
3. Highlight links.
4. Highlight headings.
5. Readable font.
6. Increase text.
7. High/dark/light contrast modes.
8. Stop animations.
9. Hide images.
10. Reset settings.
11. Accessibility statement link.
12. Preference persistence.

## 22. Future Enhancements

Possible later features:

- Larger cursor.
- Reading mask.
- Text spacing controls.
- Line height controls.
- Word spacing controls.
- Dyslexia-friendly mode.
- Keyboard navigation helper.
- Skip-link generator.
- Form field label detector.
- Image alt warning layer for admins.
- Frontend issue reporting with screenshot capture.
- Admin-side accessibility statement generator.
- Integration with site scanner.

