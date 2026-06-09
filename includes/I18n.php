<?php

declare(strict_types=1);

namespace Clearweb\AccessibilitySuite;

/**
 * Translatable strings passed to JavaScript and reused in PHP.
 */
final class I18n
{
    public const TEXT_DOMAIN = 'clearweb-accessibility-add-on';

    /**
     * @return array<string, string>
     */
    public static function admin(): array
    {
        return [
            'title' => __('Clearweb Accessibility Add-on', 'clearweb-accessibility-add-on'),
            'notice' => __(
                'The accessibility widget is an assistive layer. It does not replace semantic fixes, WCAG review, or legal/professional review.',
                'clearweb-accessibility-add-on'
            ),
            'remediationsCta' => __(
                'Need help fixing accessibility issues on your site? Clear Web offers audits, WCAG remediations, and ongoing support.',
                'clearweb-accessibility-add-on'
            ),
            'remediationsCtaLink' => __('Contact Clear Web', 'clearweb-accessibility-add-on'),
            'remediationsCtaLinkAria' => __('Contact Clear Web for accessibility remediations (opens in a new tab)', 'clearweb-accessibility-add-on'),
            'widgetSettingsTitle' => __('Widget appearance', 'clearweb-accessibility-add-on'),
            'widgetSettingsIntro' => __(
                'Control where the accessibility button appears on the public site.',
                'clearweb-accessibility-add-on'
            ),
            'widgetPosition' => __('Horizontal position', 'clearweb-accessibility-add-on'),
            'widgetPositionLeft' => __('Left edge', 'clearweb-accessibility-add-on'),
            'widgetPositionRight' => __('Right edge', 'clearweb-accessibility-add-on'),
            'widgetPositionHelp' => __(
                'Which side of the screen the trigger button is pinned to (physical left or right).',
                'clearweb-accessibility-add-on'
            ),
            'widgetVerticalDesktop' => __('Vertical position (desktop)', 'clearweb-accessibility-add-on'),
            'widgetVerticalMobile' => __('Vertical position (mobile)', 'clearweb-accessibility-add-on'),
            'widgetVerticalOffsetHelp' => __(
                'Sets the CSS top position as a percentage of the viewport height. 50% is vertically centered.',
                'clearweb-accessibility-add-on'
            ),
            /* translators: %d: vertical position as a percentage (0-100). */
            'widgetVerticalOffsetPercent' => __('%d%%', 'clearweb-accessibility-add-on'),
            'saveSettings' => __('Save settings', 'clearweb-accessibility-add-on'),
            'savingSettings' => __('Saving…', 'clearweb-accessibility-add-on'),
            'settingsSaved' => __('Settings saved.', 'clearweb-accessibility-add-on'),
            'settingsSaveError' => __('Could not save settings. Please try again.', 'clearweb-accessibility-add-on'),
            'loadingSettings' => __('Loading settings…', 'clearweb-accessibility-add-on'),
        ];
    }

    /**
     * @return array<string, string|bool>
     */
    public static function widget(): array // phpcs:ignore Generic.Metrics.CyclomaticComplexity
    {
        return [
            'isRtl'                => is_rtl(),
            /* Panel chrome */
            'openMenu'             => __('Open accessibility menu', 'clearweb-accessibility-add-on'),
            'closeMenu'            => __('Close accessibility menu', 'clearweb-accessibility-add-on'),
            'panelTitle'           => __('Accessibility settings', 'clearweb-accessibility-add-on'),
            'highlightColor'       => __('Highlight color', 'clearweb-accessibility-add-on'),
            /* Information architecture */
            'quickStart'           => __('Quick start', 'clearweb-accessibility-add-on'),
            'presetLowVision'      => __('Low vision', 'clearweb-accessibility-add-on'),
            'presetDyslexia'       => __('ADHD', 'clearweb-accessibility-add-on'),
            'presetReduceMotion'   => __('Reduce motion', 'clearweb-accessibility-add-on'),
            'presetHighContrast'   => __('High contrast', 'clearweb-accessibility-add-on'),
            'activeSettings'       => __('Active settings', 'clearweb-accessibility-add-on'),
            'noActiveSettings'     => __('No adjustments active', 'clearweb-accessibility-add-on'),
            'removeSetting'        => __('Remove', 'clearweb-accessibility-add-on'),
            'tabText'              => __('Text', 'clearweb-accessibility-add-on'),
            'tabVision'            => __('Vision', 'clearweb-accessibility-add-on'),
            'tabReading'           => __('Reading', 'clearweb-accessibility-add-on'),
            'tabMore'              => __('More', 'clearweb-accessibility-add-on'),
            'essentialAids'        => __('Essential aids', 'clearweb-accessibility-add-on'),
            'ttsHint'              => __(
                'When on, Tab to content or click it to hear it read aloud.',
                'clearweb-accessibility-add-on'
            ),
            'ttsActivated'         => __(
                'Screen reader is active. Tab through this menu or the page to hear each item.',
                'clearweb-accessibility-add-on'
            ),
            'ttsDeactivated'       => __('Screen reader turned off.', 'clearweb-accessibility-add-on'),
            'stopAnimationsHint'   => __(
                'Pauses moving and auto-playing animations across the site.',
                'clearweb-accessibility-add-on'
            ),
            'stopAudioHint'        => __(
                'Mutes videos and blocks new sounds until you turn this off.',
                'clearweb-accessibility-add-on'
            ),
            'stopSpeaking'         => __('Stop speaking', 'clearweb-accessibility-add-on'),
            'stoppedSpeaking'      => __('Stopped speaking', 'clearweb-accessibility-add-on'),
            'ttsUnsupported'       => __(
                'Text-to-speech is not supported in this browser.',
                'clearweb-accessibility-add-on'
            ),
            'ttsError'             => __(
                'Could not read this text. Try another section.',
                'clearweb-accessibility-add-on'
            ),
            'settingOn'            => __('On', 'clearweb-accessibility-add-on'),
            'settingOff'           => __('Off', 'clearweb-accessibility-add-on'),
            'tabSelected'          => __('Selected', 'clearweb-accessibility-add-on'),
            'chipTextSize'         => __('Text size', 'clearweb-accessibility-add-on'),
            /* Typography */
            'typography'           => __('Typography', 'clearweb-accessibility-add-on'),
            'increaseText'         => __('Increase text', 'clearweb-accessibility-add-on'),
            'decreaseText'         => __('Decrease text', 'clearweb-accessibility-add-on'),
            'lineHeight'           => __('Line height', 'clearweb-accessibility-add-on'),
            'letterSpacing'        => __('Letter spacing', 'clearweb-accessibility-add-on'),
            'wordSpacing'          => __('Word spacing', 'clearweb-accessibility-add-on'),
            'dyslexiaFont'         => __('Dyslexia font', 'clearweb-accessibility-add-on'),
            'largeCursor'          => __('Larger cursor', 'clearweb-accessibility-add-on'),
            /* Contrast */
            'contrast'             => __('Contrast', 'clearweb-accessibility-add-on'),
            'highContrast'         => __('High contrast', 'clearweb-accessibility-add-on'),
            'lightContrast'        => __('Light contrast', 'clearweb-accessibility-add-on'),
            'darkContrast'         => __('Dark contrast', 'clearweb-accessibility-add-on'),
            'nightMode'            => __('Night mode', 'clearweb-accessibility-add-on'),
            'invertColors'         => __('Invert colors', 'clearweb-accessibility-add-on'),
            /* Saturation */
            'saturation'           => __('Color saturation', 'clearweb-accessibility-add-on'),
            'monochrome'           => __('Monochrome', 'clearweb-accessibility-add-on'),
            'lowSaturation'        => __('Low saturation', 'clearweb-accessibility-add-on'),
            'highSaturation'       => __('High saturation', 'clearweb-accessibility-add-on'),
            /* Color blindness */
            'colorBlindness'       => __('Color blindness', 'clearweb-accessibility-add-on'),
            'deuteranopia'         => __('Deuteranopia (green-blind)', 'clearweb-accessibility-add-on'),
            'protanopia'           => __('Protanopia (red-blind)', 'clearweb-accessibility-add-on'),
            'tritanopia'           => __('Tritanopia (blue-blind)', 'clearweb-accessibility-add-on'),
            /* Reading aids */
            'readingAids'          => __('Reading aids', 'clearweb-accessibility-add-on'),
            'highlightLinks'       => __('Highlight links', 'clearweb-accessibility-add-on'),
            'highlightHeadings'    => __('Highlight headings', 'clearweb-accessibility-add-on'),
            'readableFont'         => __('Readable font', 'clearweb-accessibility-add-on'),
            'focusContent'         => __('Focused content', 'clearweb-accessibility-add-on'),
            'readingContent'       => __('Reading content', 'clearweb-accessibility-add-on'),
            'readingMask'          => __('Reading mask', 'clearweb-accessibility-add-on'),
            'readingMode'          => __('Reading mode', 'clearweb-accessibility-add-on'),
            'tts'                  => __('Read aloud', 'clearweb-accessibility-add-on'),
            /* Additional aids */
            'additionalAids'       => __('Additional aids', 'clearweb-accessibility-add-on'),
            'stopAnimations'       => __('Stop animations', 'clearweb-accessibility-add-on'),
            'pauseGifs'            => __('Pause GIFs', 'clearweb-accessibility-add-on'),
            'hideImages'           => __('Hide images', 'clearweb-accessibility-add-on'),
            'showAltText'          => __('Show alt text', 'clearweb-accessibility-add-on'),
            'stopAudio'            => __('Stop audio', 'clearweb-accessibility-add-on'),
            'highlightHover'       => __('Highlight hover', 'clearweb-accessibility-add-on'),
            'highlightClick'       => __('Highlight click', 'clearweb-accessibility-add-on'),
            'formLabels'           => __('Form labels', 'clearweb-accessibility-add-on'),
            'tableHelper'          => __('Table navigation', 'clearweb-accessibility-add-on'),
            'missingLabel'         => __('Missing label', 'clearweb-accessibility-add-on'),
            /* Navigation */
            'navigation'           => __('Navigation', 'clearweb-accessibility-add-on'),
            'skipToContent'        => __('Skip to main content', 'clearweb-accessibility-add-on'),
            'landmarksTitle'       => __('Jump to section', 'clearweb-accessibility-add-on'),
            'noLandmarks'          => __('No landmarks found', 'clearweb-accessibility-add-on'),
            'keyboardShortcuts'    => __('Keyboard shortcuts', 'clearweb-accessibility-add-on'),
            'lmBanner'             => __('Header', 'clearweb-accessibility-add-on'),
            'lmNav'                => __('Navigation', 'clearweb-accessibility-add-on'),
            'lmMain'               => __('Main content', 'clearweb-accessibility-add-on'),
            'lmAside'              => __('Sidebar', 'clearweb-accessibility-add-on'),
            'lmFooter'             => __('Footer', 'clearweb-accessibility-add-on'),
            'lmSearch'             => __('Search', 'clearweb-accessibility-add-on'),
            'lmForm'               => __('Form', 'clearweb-accessibility-add-on'),
            /* Keyboard shortcut descriptions */
            'scTab'                => __('Move to next focusable element', 'clearweb-accessibility-add-on'),
            'scShiftTab'           => __('Move to previous element', 'clearweb-accessibility-add-on'),
            'scEnter'              => __('Activate button or link', 'clearweb-accessibility-add-on'),
            'scEscape'             => __('Close dialog or overlay', 'clearweb-accessibility-add-on'),
            'scArrow'              => __('Navigate within menus and groups', 'clearweb-accessibility-add-on'),
            'scH'                  => __('Jump to next heading', 'clearweb-accessibility-add-on'),
            'scF'                  => __('Jump to next form field', 'clearweb-accessibility-add-on'),
            'scL'                  => __('Jump to next list', 'clearweb-accessibility-add-on'),
            'scT'                  => __('Jump to next table', 'clearweb-accessibility-add-on'),
            'scCtrlAlt'            => __('Navigate table cells (NVDA)', 'clearweb-accessibility-add-on'),
            /* Profiles */
            'profiles'             => __('Profiles', 'clearweb-accessibility-add-on'),
            'saveProfile'          => __('Save current', 'clearweb-accessibility-add-on'),
            'noProfiles'           => __('No saved profiles', 'clearweb-accessibility-add-on'),
            'deleteProfile'        => __('Delete', 'clearweb-accessibility-add-on'),
            'profileNamePrompt'    => __('Enter a name for this profile:', 'clearweb-accessibility-add-on'),
            /* Report form */
            'reportProblem'        => __('Report a problem', 'clearweb-accessibility-add-on'),
            'reportName'           => __('Your name', 'clearweb-accessibility-add-on'),
            'reportEmailField'     => __('Your email', 'clearweb-accessibility-add-on'),
            'reportUrl'            => __('Page URL', 'clearweb-accessibility-add-on'),
            'reportCategory'       => __('Problem category', 'clearweb-accessibility-add-on'),
            'reportDescription'    => __('Description', 'clearweb-accessibility-add-on'),
            'reportSubmit'         => __('Submit report', 'clearweb-accessibility-add-on'),
            'reportSelectCategory' => __('— Select —', 'clearweb-accessibility-add-on'),
            'catKeyboard'          => __('Keyboard navigation', 'clearweb-accessibility-add-on'),
            'catScreenReader'      => __('Screen reader', 'clearweb-accessibility-add-on'),
            'catContrast'          => __('Color or contrast', 'clearweb-accessibility-add-on'),
            'catText'              => __('Text or font', 'clearweb-accessibility-add-on'),
            'catImages'            => __('Images or media', 'clearweb-accessibility-add-on'),
            'catForms'             => __('Forms', 'clearweb-accessibility-add-on'),
            'catOther'             => __('Other', 'clearweb-accessibility-add-on'),
            'reportValidation'     => __('Please fill in all required fields.', 'clearweb-accessibility-add-on'),
            'reportSending'        => __('Sending\u2026', 'clearweb-accessibility-add-on'),
            'reportSuccess'        => __('Report submitted. Thank you!', 'clearweb-accessibility-add-on'),
            'reportError'          => __('Could not send the report. Please try again.', 'clearweb-accessibility-add-on'),
            'reportRateLimited'    => __('Too many reports from your connection. Please wait and try again later.', 'clearweb-accessibility-add-on'),
            'reportHoneypotLabel'  => __('Company website', 'clearweb-accessibility-add-on'),
            /* Footer */
            'accessibilityStatement' => __('Accessibility statement', 'clearweb-accessibility-add-on'),
            'accessibilityHelp'      => __('Accessibility help', 'clearweb-accessibility-add-on'),
            'resetAccessibility'     => __('Reset accessibility settings', 'clearweb-accessibility-add-on'),
            /* Branding */
            'brandName'              => __('Clear Web', 'clearweb-accessibility-add-on'),
            /* translators: %s: brand name (Clear Web). */
            'brandCredit'            => __('The accessibility system on this site was developed by %s', 'clearweb-accessibility-add-on'),
            'visitBrand'             => __('Visit Clear Web (opens in a new tab)', 'clearweb-accessibility-add-on'),
        ];
    }
}
