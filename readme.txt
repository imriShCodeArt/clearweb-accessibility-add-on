=== Clearweb Accessibility Add-on ===
Contributors: clearwebdev
Tags: accessibility, rtl, widget, translation-ready, wcag
Requires at least: 6.4
Tested up to: 7.0
Requires PHP: 8.1
Stable tag: 1.0.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Accessibility widget for WordPress with full Hebrew (עברית) and RTL support — built for Israeli businesses.

== Description ==

**Clearweb Accessibility Add-on** (תוסף נגישות לוורדפרס) adds a visitor-facing accessibility toolbar to your WordPress site. Visitors can personalize how they read and interact with your content without leaving the page.

Built by [Clear Web](https://clearweb.co.il) for **Israeli businesses** and Hebrew-first websites: the admin screen and widget UI switch to עברית when your site language is Hebrew, with correct RTL layout and edge positioning that respects physical left/right screen sides.

The widget is an **assistive layer** (שכבת הנגשה). It does not replace semantic HTML fixes, manual WCAG audits, Israeli accessibility standard review, or legal/professional sign-off.

= Features =

* **Quick-start presets** — Low vision, ADHD-friendly, reduce motion, and high contrast profiles
* **Typography** — Text size, line height, letter spacing, word spacing, dyslexia-friendly font, larger cursor
* **Vision** — High/light/dark contrast, night mode, color inversion, saturation, color-blindness filters
* **Reading aids** — Reading mask, reading mode, read aloud (TTS), link and heading highlights
* **Navigation** — Skip to content, landmark jumps, keyboard shortcut reference
* **Problem reporting** — Visitors can report accessibility issues by email
* **Hebrew & RTL** — Full עברית interface for admin and the public widget (`he_IL` included)
* **Admin settings** — Pin the trigger to the left or right edge and set vertical position (desktop and mobile)
* **Israeli support path** — In-plugin link to Clear Web for audits, תיקוני נגישות, and WCAG remediation

= Important =

This plugin helps visitors adjust how content is displayed. For lasting compliance, Israeli sites still need proper markup, testing, and remediation. [Clear Web](https://clearweb.co.il) offers professional accessibility audits and WCAG remediations in Israel.

== Installation ==

1. Upload the `clearweb-accessibility-add-on` folder to `/wp-content/plugins/`, or install the ZIP via **Plugins → Add New → Upload Plugin**.
2. Activate the plugin through the **Plugins** menu.
3. Go to **Clearweb A11y** in the admin menu to configure widget position.
4. The accessibility button appears on the public site automatically.

== Frequently Asked Questions ==

= Does this plugin make my site WCAG compliant? =

No. The widget improves the experience for many visitors but does not fix underlying code, contrast, or structural accessibility issues. Professional review is still recommended.

= Where are visitor preferences stored? =

When enabled, preferences are saved in the visitor's browser (`localStorage`) on their device. They are not sent to your server.

= Does the problem report form collect personal data? =

Visitors may optionally submit their name, email, page URL, and a description. The report is emailed to the address configured in settings (or the site admin email by default).

= How is report spam prevented? =

Reports use a hidden honeypot field, a minimum description length, and per-IP rate limiting (5 submissions per hour).

= Is Hebrew supported? =

Yes. Set your site language to Hebrew (עברית) under **Settings → General** to load the included `he_IL` translations. The widget panel, presets, and admin settings are fully translated for Israeli sites.

= Is this plugin suitable for Israeli businesses? =

Yes. It was designed for the Israeli market: Hebrew UI, RTL layout, and an admin call-to-action to [Clear Web](https://clearweb.co.il) for professional הנגשת אתרים and WCAG remediation. It is a good fit if you are looking for a **תוסף נגישות** or **תוסף הנגשה** for WordPress.

= האם התוסף מתאים לעסקים בישראל? =

כן. התוסף פותח עבור אתרים ישראליים: ממשק מלא בעברית (RTL), תרגום `he_IL` מובנה, ומסך ניהול בעברית. מתאים למי שמחפש **תוסף נגישות** או **תוסף הנגשה** לוורדפרס. שכבת הווידג'ט אינה מחליפה תיקון קוד, בדיקת תקן או ליווי מקצועי — [Clear Web](https://clearweb.co.il) מציעה ביקורת נגישות ויישום WCAG.

= האם התוסף הופך את האתר לתקן נגישות? =

לא. הווידג'ט משפר את חוויית הגולש אך אינו מתקן בעיות מבנה, קוד או ניגודיות באתר. מומלץ לשלב עם בדיקה מקצועית והנגשה סמנטית של האתר.

== Screenshots ==

1. The visitor accessibility panel with quick-start presets and adjustment sections.
2. The edge-mounted accessibility trigger button and widget branding.
3. Admin settings for horizontal and vertical widget position.

== External services ==

This plugin links to [clearweb.co.il](https://clearweb.co.il) in the admin remediation call-to-action and in the optional widget footer branding. No visitor data is sent to Clear Web unless the visitor chooses to visit that site.

== Changelog ==

= 1.0.3 =
* Align text domain with WordPress.org plugin slug (`clearweb-accessibility-add-on`)

= 1.0.2 =
* WordPress.org directory assets (banner, icon, screenshots)
* Translation template (.pot) for translators
* Report form spam protection (honeypot, rate limiting, minimum description length)
* Readme optimized for Israeli businesses and Hebrew discoverability (תוסף נגישות, תוסף הנגשה)

= 1.0.1 =
* Plugin Check compliance: literal text domain strings, removed unused modules, updated tested-up-to

= 1.0.0 =
* Initial public release of Clearweb Accessibility Add-on
* Frontend accessibility widget with presets, typography, vision, reading, and navigation tools
* Admin settings for horizontal and vertical widget position
* Accessibility problem reporting via email
* Hebrew (he_IL) translations
* Physical left/right positioning (not mirrored in RTL admin settings)

== Upgrade Notice ==

= 1.0.3 =
Text domain fix for WordPress.org compatibility. No functional changes.

= 1.0.2 =
Adds report spam protection and WordPress.org listing assets.

= 1.0.1 =
Plugin Check and WordPress.org compliance updates.

= 1.0.0 =
First public release. Scoped to the accessibility widget only.
