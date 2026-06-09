/* global CWAS_WIDGET */
(function () {
	'use strict';

	/* ─── Config ──────────────────────────────────────────────────────────────── */
	const cfg      = (typeof CWAS_WIDGET !== 'undefined' ? CWAS_WIDGET : {});
	const i18n     = cfg.i18n     || {};
	const settings = cfg.settings || {};

	const isRtl          = Boolean(i18n.isRtl);
	const position       = settings.position      || 'right';
	const verticalPosition = Number(settings.verticalPosition);
	const triggerTop = Number.isFinite(verticalPosition)
		? Math.max(0, Math.min(100, verticalPosition))
		: 50;
	const verticalPositionMobile = Number(settings.verticalPositionMobile);
	const triggerTopMobile = Number.isFinite(verticalPositionMobile)
		? Math.max(0, Math.min(100, verticalPositionMobile))
		: triggerTop;
	const stmtUrl        = settings.statementUrl  || '';
	const helpUrl        = settings.helpUrl        || '';
	const rememberPrefs  = settings.rememberPrefs  !== false;
	const primaryColor   = settings.primaryColor   || '#0852e0';
	const theme          = settings.theme          || 'light';
	const brandUrl       = settings.brandUrl       || 'https://clearweb.co.il';
	const brandLogoUrl   = settings.brandLogoUrl   || '';
	const triggerMarkUrl = settings.triggerMarkUrl || '';
	const restUrl        = (settings.restUrl       || '').replace(/\/$/, '');
	const nonce          = settings.nonce          || '';
	const enableReport   = Boolean(settings.reportEmail || restUrl);
	const enableAnalytics = Boolean(settings.analytics);
	const allowedFeatures = Array.isArray(settings.allowedFeatures) && settings.allowedFeatures.length
		? settings.allowedFeatures
		: null;

	/* ─── Storage keys ─────────────────────────────────────────────────────────── */
	const STORAGE_KEY        = 'cwas_a11y_prefs';
	const LEGACY_STORAGE_KEY = 'a11y_prefs';
	const PROFILES_KEY       = 'cwas_a11y_profiles';
	const ANALYTICS_KEY      = 'cwas_a11y_usage';

	/* ─── Step levels ──────────────────────────────────────────────────────────── */
	const FONT_SCALE_LEVELS    = [1, 1.1, 1.2, 1.3, 1.4, 1.5];
	const LINE_HEIGHT_LEVELS   = [1, 1.4, 1.8, 2.2];
	const LETTER_SPACING_STEPS = [0, 1, 2, 3];   // px
	const WORD_SPACING_STEPS   = [0, 2, 4, 8];   // px
	const CONTRAST_MODES       = ['high', 'light', 'dark'];
	const SATURATION_MODES     = ['monochrome', 'low', 'high'];
	const CVD_MODES            = ['deuteranopia', 'protanopia', 'tritanopia'];

	/** Quick-start preset bundles (applied on top of DEFAULTS). */
	const PRESETS = {
		lowVision: {
			fontScale: 1.3,
			contrastMode: 'high',
			highlightLinks: true,
			largeCursor: true,
		},
		dyslexia: {
			dyslexiaFont: true,
			lineHeight: 2,
			letterSpacing: 2,
			readableFont: true,
			readingMask: true,
		},
		reduceMotion: {
			stopAnimations: true,
			pauseGifs: true,
		},
		highContrast: {
			contrastMode: 'high',
			highlightHeadings: true,
			highlightLinks: true,
		},
	};

	const TOGGLE_LABELS = {
		highlightLinks: 'highlightLinks',
		highlightHeadings: 'highlightHeadings',
		readableFont: 'readableFont',
		focusContent: 'focusContent',
		readingContent: 'readingContent',
		readingMask: 'readingMask',
		readingMode: 'readingMode',
		tts: 'tts',
		dyslexiaFont: 'dyslexiaFont',
		largeCursor: 'largeCursor',
		nightMode: 'nightMode',
		invertColors: 'invertColors',
		stopAnimations: 'stopAnimations',
		pauseGifs: 'pauseGifs',
		hideImages: 'hideImages',
		showAltText: 'showAltText',
		stopAudio: 'stopAudio',
		highlightHover: 'highlightHover',
		highlightClick: 'highlightClick',
		formLabels: 'formLabels',
		tableHelper: 'tableHelper',
	};

	/* ─── Defaults ─────────────────────────────────────────────────────────────── */
	const DEFAULTS = {
		/* typography */
		fontScale:       1,
		lineHeight:      0,
		letterSpacing:   0,
		wordSpacing:     0,
		dyslexiaFont:    false,
		largeCursor:     false,
		customColor:     null,
		/* contrast / color */
		contrastMode:    null,
		nightMode:       false,
		invertColors:    false,
		saturationMode:  null,
		cvdMode:         null,
		/* reading */
		highlightLinks:    false,
		highlightHeadings: false,
		readableFont:      false,
		focusContent:      false,
		readingContent:    false,
		readingMask:       false,
		readingMode:       false,
		tts:               false,
		/* additional */
		stopAnimations:  false,
		pauseGifs:       false,
		hideImages:      false,
		showAltText:     false,
		stopAudio:       false,
		highlightHover:  false,
		highlightClick:  false,
		formLabels:      false,
		tableHelper:     false,
		/* quick-start UI (not an accessibility effect) */
		activePreset:    null,
	};

	let state = Object.assign({}, DEFAULTS);

	/* ─── Persistence ──────────────────────────────────────────────────────────── */
	function normalizeLoadedState(parsed) {
		if (!parsed || typeof parsed !== 'object') return null;
		const next = Object.assign({}, DEFAULTS);
		for (const key of Object.keys(DEFAULTS)) {
			if (Object.prototype.hasOwnProperty.call(parsed, key)) {
				next[key] = parsed[key];
			}
		}
		return next;
	}

	function loadState() {
		if (!rememberPrefs) return;
		try {
			let raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) {
				raw = localStorage.getItem(LEGACY_STORAGE_KEY);
				if (raw) {
					localStorage.setItem(STORAGE_KEY, raw);
					localStorage.removeItem(LEGACY_STORAGE_KEY);
				}
			}
			if (!raw) return;
			const parsed = normalizeLoadedState(JSON.parse(raw));
			if (parsed) state = parsed;
		} catch (_) { /* ignore */ }
	}

	function saveState() {
		if (!rememberPrefs) return;
		try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* ignore */ }
	}

	/* ─── Analytics ────────────────────────────────────────────────────────────── */
	function trackToggle(key) {
		if (!enableAnalytics) return;
		try {
			const data = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '{}');
			data[key] = (data[key] || 0) + 1;
			localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
		} catch (_) { /* ignore */ }
	}

	/* ─── i18n helper ──────────────────────────────────────────────────────────── */
	function t(key, fallback) {
		return (i18n[key] !== undefined ? i18n[key] : (fallback || key));
	}

	function esc(str) {
		return String(str)
			.replace(/&/g, '&amp;').replace(/</g, '&lt;')
			.replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	function isWidgetUiNode(node) {
		return Boolean(
			node && node.closest && node.closest('#cwas-a11y-widget, #cwas-report-modal')
		);
	}

	let audioGuardActive = false;
	let audioObserver       = null;

	function silenceMediaElement(media) {
		if (!media || (media.tagName !== 'AUDIO' && media.tagName !== 'VIDEO')) return;
		try {
			media.pause();
			media.muted = true;
			media.volume = 0;
			media.setAttribute('data-cwas-silenced', '1');
		} catch (_) { /* ignore */ }
	}

	function pauseAllMediaNow() {
		const scope = document.getElementById('cwas-page-content') || document;
		scope.querySelectorAll('audio, video').forEach(silenceMediaElement);
		scope.querySelectorAll('iframe').forEach((frame) => {
			try {
				const doc = frame.contentDocument;
				if (!doc) return;
				doc.querySelectorAll('audio, video').forEach(silenceMediaElement);
			} catch (_) { /* cross-origin */ }
		});
	}

	function onMediaPlaybackAttempt(e) {
		if (!state.stopAudio) return;
		silenceMediaElement(e.target);
	}

	function onMediaVolumeChange(e) {
		if (!state.stopAudio) return;
		const media = e.target;
		if (media && (media.tagName === 'AUDIO' || media.tagName === 'VIDEO') && !media.muted) {
			silenceMediaElement(media);
		}
	}

	function bindAudioGuard() {
		if (audioGuardActive) return;
		audioGuardActive = true;
		document.addEventListener('play', onMediaPlaybackAttempt, true);
		document.addEventListener('playing', onMediaPlaybackAttempt, true);
		document.addEventListener('volumechange', onMediaVolumeChange, true);
	}

	function teardownAudioGuard() {
		if (!audioGuardActive) return;
		audioGuardActive = false;
		document.removeEventListener('play', onMediaPlaybackAttempt, true);
		document.removeEventListener('playing', onMediaPlaybackAttempt, true);
		document.removeEventListener('volumechange', onMediaVolumeChange, true);
		if (audioObserver) {
			audioObserver.disconnect();
			audioObserver = null;
		}
	}

	function setupAudioObserver() {
		if (audioObserver) return;
		const root = document.getElementById('cwas-page-content') || document.body;
		if (!root) return;

		audioObserver = new MutationObserver((mutations) => {
			if (!state.stopAudio) return;
			mutations.forEach((mutation) => {
				mutation.addedNodes.forEach((node) => {
					if (node.nodeType !== Node.ELEMENT_NODE) return;
					const el = node;
					if (el.matches && el.matches('audio, video')) {
						silenceMediaElement(el);
					}
					if (el.querySelectorAll) {
						el.querySelectorAll('audio, video').forEach(silenceMediaElement);
					}
				});
			});
		});
		audioObserver.observe(root, { childList: true, subtree: true });
	}

	function applyStopAudio() {
		if (!state.stopAudio) {
			teardownAudioGuard();
			return;
		}
		bindAudioGuard();
		setupAudioObserver();
		pauseAllMediaNow();
	}

	/* ─── Feature guard ────────────────────────────────────────────────────────── */
	function allowed(key) {
		return !allowedFeatures || allowedFeatures.includes(key);
	}

	/**
	 * Wrap page content so CSS filter on the page does not break position:fixed
	 * on #cwas-a11y-widget (filter on an ancestor creates a new containing block).
	 */
	const PAGE_CONTENT_ID = 'cwas-page-content';

	function isCwasChromeNode(node) {
		if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
		const el = node;
		const chromeIds = [
			PAGE_CONTENT_ID,
			'cwas-a11y-widget',
			'cwas-report-modal',
			'cwas-table-tooltip',
			'cwas-cvd-svg',
			'cwas-skip-link',
		];
		if (chromeIds.includes(el.id)) return true;
		return el.classList.contains('cwas-reading-mask') || el.classList.contains('cwas-skip-link');
	}

	function ensurePageFilterRoot() {
		if (document.getElementById(PAGE_CONTENT_ID)) return;
		const body = document.body;
		if (!body) return;

		const wrapper = document.createElement('div');
		wrapper.id = PAGE_CONTENT_ID;
		wrapper.className = 'cwas-page-content';

		const toWrap = [];
		Array.from(body.childNodes).forEach((node) => {
			if (node.nodeType === Node.ELEMENT_NODE && isCwasChromeNode(node)) return;
			if (node.nodeType === Node.TEXT_NODE && !String(node.textContent || '').trim()) return;
			toWrap.push(node);
		});

		if (!toWrap.length) return;

		toWrap.forEach((node) => wrapper.appendChild(node));
		body.insertBefore(wrapper, body.firstChild);
	}

	/* ─── Apply all CSS / state ────────────────────────────────────────────────── */
	function applyAll() {
		const root = document.documentElement;

		/* Simple on/off class toggles */
		const classMap = {
			highlightLinks:    'a11y-highlight-links',
			highlightHeadings: 'a11y-highlight-headings',
			readableFont:      'a11y-readable-font',
			focusContent:      'a11y-focus-content',
			readingContent:    'a11y-reading-content',
			readingMode:       'a11y-reading-mode',
			tts:               'a11y-tts-active',
			stopAnimations:    'a11y-stop-animations',
			hideImages:        'a11y-hide-images',
			highlightClick:    'a11y-highlight-click',
			highlightHover:    'a11y-highlight-hover',
			dyslexiaFont:      'a11y-dyslexia-font',
			largeCursor:       'a11y-large-cursor',
			nightMode:         'a11y-night-mode',
			invertColors:      'a11y-invert-colors',
		};
		for (const [k, cls] of Object.entries(classMap)) {
			root.classList.toggle(cls, Boolean(state[k]));
		}
		/* Always on: visible keyboard focus on page content (WCAG 2.4.7). */
		root.classList.add('a11y-custom-focus-ring');

		/* Mutually exclusive mode groups */
		CONTRAST_MODES.forEach(m  => root.classList.remove('a11y-contrast-'   + m));
		SATURATION_MODES.forEach(m => root.classList.remove('a11y-saturation-' + m));
		CVD_MODES.forEach(m        => root.classList.remove('a11y-cvd-'        + m));
		if (state.contrastMode)   root.classList.add('a11y-contrast-'   + state.contrastMode);
		if (state.saturationMode) root.classList.add('a11y-saturation-' + state.saturationMode);
		if (state.cvdMode)        root.classList.add('a11y-cvd-'        + state.cvdMode);
		if (state.cvdMode)        injectCvdFilters();

		/* Font scale */
		root.style.setProperty('--a11y-font-scale', String(state.fontScale));

		/* Typography step classes */
		for (let i = 1; i < LINE_HEIGHT_LEVELS.length; i++)   root.classList.remove('a11y-lh-'  + i);
		for (let i = 1; i < LETTER_SPACING_STEPS.length; i++) root.classList.remove('a11y-ls-'  + i);
		for (let i = 1; i < WORD_SPACING_STEPS.length; i++)   root.classList.remove('a11y-ws-'  + i);
		if (state.lineHeight    > 0) root.classList.add('a11y-lh-'  + state.lineHeight);
		if (state.letterSpacing > 0) root.classList.add('a11y-ls-'  + state.letterSpacing);
		if (state.wordSpacing   > 0) root.classList.add('a11y-ws-'  + state.wordSpacing);

		/* Custom primary color */
		if (state.customColor) {
			root.style.setProperty('--cwas-primary', state.customColor);
		}

		/* Side-effect features (DOM manipulation) */
		scheduleEffects();
	}

	/* ─── Side-effect scheduler ────────────────────────────────────────────────── */
	let effectsScheduled = false;
	function scheduleEffects() {
		if (effectsScheduled) return;
		effectsScheduled = true;
		requestAnimationFrame(() => {
			effectsScheduled = false;
			applyReadingMask();
			applyReadingMode();
			applyStopAudio();
			applyGifPause();
			ensureSkipLink();
			applyAltTextOverlays();
			applyFormLabels();
			applyTableHelper();
			applyDyslexicFont();
			applyTtsCancel();
		});
	}

	/* ─── Reading mode (isolate main content) ──────────────────────────────────── */
	const READING_FOCUS_SEL =
		'main, [role="main"], #main, #content, #primary, .site-main, article';

	function applyReadingMode() {
		document.querySelectorAll('.cwas-reading-focus').forEach((el) => {
			el.classList.remove('cwas-reading-focus');
		});
		if (!state.readingMode) return;

		const root = document.getElementById('cwas-page-content');
		const scope = root || document.body;
		let target = scope.querySelector(READING_FOCUS_SEL);
		if (target && root && !root.contains(target)) {
			target = null;
		}
		if (!target) {
			target = scope.querySelector('.entry-content, .hentry, .post, .page-content, .content-area');
		}
		if (!target) return;

		target.classList.add('cwas-reading-focus');
	}

	/* ─── Reading mask ─────────────────────────────────────────────────────────── */
	let maskEl  = null;
	let maskRaf = null;

	function applyReadingMask() {
		if (state.readingMask) {
			if (!maskEl) {
				maskEl = document.createElement('div');
				maskEl.className = 'cwas-reading-mask';
				maskEl.setAttribute('aria-hidden', 'true');
				document.body.appendChild(maskEl);
				document.addEventListener('mousemove', onMaskMove);
			}
			maskEl.hidden = false;
		} else if (maskEl) {
			maskEl.hidden = true;
		}
	}

	function onMaskMove(e) {
		if (!state.readingMask || !maskEl) return;
		if (maskRaf) cancelAnimationFrame(maskRaf);
		maskRaf = requestAnimationFrame(() => {
			maskEl.style.top = (e.clientY - 20 - window.innerHeight) + 'px';
		});
	}

	/* ─── GIF pausing ──────────────────────────────────────────────────────────── */
	let gifStore = [];

	function applyGifPause() {
		if (state.pauseGifs) {
			if (!gifStore.length) freezeGifs();
		} else {
			restoreGifs();
		}
	}

	function freezeGifs() {
		document.querySelectorAll('img').forEach(img => {
			if (!img.src || !img.src.toLowerCase().includes('.gif')) return;
			try {
				const canvas    = document.createElement('canvas');
				canvas.width    = img.naturalWidth  || img.offsetWidth  || 1;
				canvas.height   = img.naturalHeight || img.offsetHeight || 1;
				canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
				canvas.style.cssText = img.style.cssText;
				canvas.className     = img.className;
				canvas.setAttribute('role', 'img');
				if (img.alt) canvas.setAttribute('aria-label', img.alt);
				img.insertAdjacentElement('afterend', canvas);
				img.style.display = 'none';
				gifStore.push({ img, canvas });
			} catch (_) { /* cross-origin */ }
		});
	}

	function restoreGifs() {
		gifStore.forEach(({ img, canvas }) => {
			img.style.display = '';
			canvas.remove();
		});
		gifStore = [];
	}

	/* ─── Text-to-speech (screen reader mode) ─────────────────────────────────── */
	const TTS_BLOCK_SEL = 'p, li, blockquote, h1, h2, h3, h4, h5, h6, td, th, figcaption, dt, dd';
	const TTS_MAX_CHARS = 8000;
	let ttsVoices       = [];
	let ttsVoicesReady  = false;
	let ttsSpeaking            = false;
	let ttsResumeTimer         = null;
	let ttsFocusTimer          = null;
	let ttsLastReadBlock       = null;
	let ttsLastFocusEl         = null;
	let ttsSuppressFocusUntil  = 0;
	let ttsPlaybackGen         = 0;
	let ttsVoiceListener       = null;

	function ttsSupported() {
		return typeof window !== 'undefined' &&
			'speechSynthesis' in window &&
			typeof SpeechSynthesisUtterance !== 'undefined';
	}

	function refreshTtsVoices() {
		if (!ttsSupported()) return;
		ttsVoices = window.speechSynthesis.getVoices() || [];
		ttsVoicesReady = ttsVoices.length > 0;
	}

	function warmTtsVoices() {
		if (!ttsSupported()) return;
		refreshTtsVoices();
		if (ttsVoicesReady) return;
		const onVoices = () => {
			refreshTtsVoices();
			if (ttsVoicesReady) {
				window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
			}
		};
		window.speechSynthesis.addEventListener('voiceschanged', onVoices);
		/* Chrome loads voices lazily; nudge synthesis once. */
		try {
			window.speechSynthesis.getVoices();
		} catch (_) { /* ignore */ }
	}

	function getTtsLang() {
		const docLang = (document.documentElement.lang || '').trim();
		if (docLang) return docLang;
		return isRtl ? 'he-IL' : (navigator.language || 'en-US');
	}

	function pickTtsVoice(lang) {
		if (!ttsVoices.length) return null;
		const want    = lang.toLowerCase().replace(/_/g, '-');
		const primary = want.split('-')[0];
		let best      = null;
		let bestScore = -1;
		ttsVoices.forEach((voice) => {
			const vl = (voice.lang || '').toLowerCase().replace(/_/g, '-');
			let score = 0;
			if (vl === want) score = 100;
			else if (vl.startsWith(primary + '-')) score = 80;
			else if (vl.startsWith(primary)) score = 60;
			else if (primary === 'he' && /hebrew|עברית/i.test(voice.name)) score = 50;
			if (score > bestScore) {
				bestScore = score;
				best = voice;
			}
		});
		return best || ttsVoices.find((v) => v.default) || ttsVoices[0];
	}

	function applyTtsCancel() {
		if (!state.tts && ttsSupported()) {
			stopTts(true);
		}
	}

	function syncStopSpeakingBtn() {
		const btn = panelEl?.querySelector('[data-a11y-action="stopTts"]');
		if (!btn) return;
		btn.hidden = !(state.tts && ttsSpeaking);
	}

	function clearTtsResumeTimer() {
		if (ttsResumeTimer) {
			clearInterval(ttsResumeTimer);
			ttsResumeTimer = null;
		}
	}

	function clearTtsVoiceListener() {
		if (ttsVoiceListener && ttsSupported()) {
			window.speechSynthesis.removeEventListener('voiceschanged', ttsVoiceListener);
			ttsVoiceListener = null;
		}
	}

	function cancelSpeechNow() {
		if (!ttsSupported()) return;
		try {
			window.speechSynthesis.pause();
		} catch (_) { /* ignore */ }
		window.speechSynthesis.cancel();
		window.setTimeout(() => {
			try {
				window.speechSynthesis.cancel();
			} catch (_) { /* ignore */ }
		}, 0);
	}

	function stopTts(hardStop) {
		ttsPlaybackGen++;
		clearTtsVoiceListener();
		clearTtsResumeTimer();
		if (ttsFocusTimer) {
			clearTimeout(ttsFocusTimer);
			ttsFocusTimer = null;
		}
		cancelSpeechNow();
		ttsSpeaking      = false;
		ttsLastReadBlock = null;
		ttsLastFocusEl   = null;
		if (hardStop) {
			ttsSuppressFocusUntil = Date.now() + 5000;
		}
		syncStopSpeakingBtn();
	}

	function speakStatusMessage(message) {
		if (!ttsSupported() || !message || !message.trim()) return;
		const gen = ttsPlaybackGen;
		clearTtsResumeTimer();
		if (ttsFocusTimer) {
			clearTimeout(ttsFocusTimer);
			ttsFocusTimer = null;
		}
		cancelSpeechNow();

		const run = () => {
			if (gen !== ttsPlaybackGen) return;
			const lang  = getTtsLang();
			const utt   = new SpeechSynthesisUtterance(message.trim());
			utt.lang    = lang;
			const voice = pickTtsVoice(lang);
			if (voice) utt.voice = voice;
			utt.onstart = () => {
				if (gen !== ttsPlaybackGen) {
					cancelSpeechNow();
					return;
				}
				ttsSpeaking = true;
				startTtsResumeKeepalive();
			};
			utt.onend = () => {
				clearTtsResumeTimer();
				ttsSpeaking = false;
				syncStopSpeakingBtn();
			};
			utt.onerror = () => {
				clearTtsResumeTimer();
				ttsSpeaking = false;
				syncStopSpeakingBtn();
			};
			window.setTimeout(() => {
				if (gen !== ttsPlaybackGen) return;
				window.speechSynthesis.speak(utt);
			}, 30);
		};

		refreshTtsVoices();
		if (!ttsVoicesReady) {
			window.setTimeout(run, 150);
		} else {
			run();
		}
	}

	function getTtsText(el) {
		if (!el) return '';
		const clone = el.cloneNode(true);
		clone.querySelectorAll('script, style, noscript').forEach((n) => n.remove());
		return (clone.innerText || clone.textContent || '')
			.replace(/\s+/g, ' ')
			.trim()
			.slice(0, TTS_MAX_CHARS);
	}

	function isInA11yPanel(el) {
		return Boolean(el && el.closest('#cwas-a11y-panel'));
	}

	/** Page content or open accessibility panel (not FAB trigger / report modal). */
	function isTtsEligibleNode(el) {
		if (!el) return false;
		if (el.closest('#cwas-report-modal')) return false;
		if (isInA11yPanel(el)) return true;
		if (el.closest('#cwas-a11y-widget')) return false;
		return true;
	}

	const TTS_PANEL_CONTROL_SEL = [
		'button',
		'[role="tab"]',
		'summary',
		'a.cwas-footer-link',
		'a.cwas-brand-link',
		'.cwas-reset-btn',
		'.cwas-chip',
		'label.cwas-color-swatch',
		'input.cwas-color-pick',
	].join(', ');

	function getTtsReadableText(el) {
		if (!el) return '';
		if (!isInA11yPanel(el)) {
			return getTtsText(el);
		}

		const control = el.closest(TTS_PANEL_CONTROL_SEL) || el;
		let parts     = [];

		const ariaLabel = control.getAttribute('aria-label');
		if (ariaLabel) {
			parts.push(ariaLabel.trim());
		} else {
			const visible = getTtsText(control);
			if (visible) parts.push(visible);
		}

		if (control.matches('[role="switch"]')) {
			const on = control.getAttribute('aria-checked') === 'true';
			parts.push(on ? t('settingOn', 'On') : t('settingOff', 'Off'));
		}

		if (control.matches('[role="tab"]')) {
			const selected = control.getAttribute('aria-selected') === 'true';
			if (selected) {
				parts.push(t('tabSelected', 'Selected'));
			}
		}

		const describedBy = control.getAttribute('aria-describedby');
		if (describedBy) {
			describedBy.split(/\s+/).forEach((id) => {
				const node = document.getElementById(id);
				if (node && node.textContent) {
					parts.push(node.textContent.trim());
				}
			});
		}

		return parts.filter(Boolean).join('. ').replace(/\s+/g, ' ').trim();
	}

	function findWidgetTtsTarget(seed) {
		const panel = seed.closest('#cwas-a11y-panel');
		if (!panel) return null;

		const control = seed.closest(TTS_PANEL_CONTROL_SEL);
		if (control && panel.contains(control)) {
			return control;
		}

		const titled = seed.closest(
			'h2, h3, .cwas-panel-title, .cwas-essential-heading, .cwas-presets-label, .cwas-section-title'
		);
		if (titled && panel.contains(titled)) {
			return titled;
		}

		return findSmallestReadableBlock(seed);
	}

	function findSmallestReadableBlock(el) {
		const panel    = el.closest('#cwas-a11y-panel');
		const pageRoot = document.getElementById(PAGE_CONTENT_ID);
		const boundary = panel || pageRoot || document.body;
		let best       = null;
		let bestLen    = Infinity;
		let node       = el;

		while (node && node !== boundary && node !== document.documentElement) {
			if (node.nodeType !== 1) {
				node = node.parentElement;
				continue;
			}
			const tag = node.tagName;
			if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG'].includes(tag)) {
				node = node.parentElement;
				continue;
			}
			if (node.closest('#cwas-report-modal')) {
				return best;
			}
			if (!panel && node.closest('#cwas-a11y-widget')) {
				return best;
			}
			const text = getTtsReadableText(node);
			if (text.length >= 2 && text.length < bestLen) {
				bestLen = text.length;
				best    = node;
			}
			node = node.parentElement;
		}
		return best;
	}

	function findTtsBlockFromSeed(seed) {
		if (!seed || !isTtsEligibleNode(seed)) return null;

		if (isInA11yPanel(seed)) {
			return findWidgetTtsTarget(seed);
		}

		const semantic = seed.closest(TTS_BLOCK_SEL);
		if (semantic && isTtsEligibleNode(semantic)) {
			return semantic;
		}

		if (seed.matches(
			'a[href], button, summary, [role="link"], [role="button"], label, h1, h2, h3, h4, h5, h6'
		)) {
			const selfText = getTtsText(seed);
			if (selfText.length >= 1) {
				const parent = seed.closest(TTS_BLOCK_SEL);
				return parent && isTtsEligibleNode(parent) ? parent : seed;
			}
		}

		return findSmallestReadableBlock(seed);
	}

	function getTtsInteractionSeeds(clickEl) {
		const seeds  = [];
		const active = document.activeElement;

		if (active && active !== document.body && active !== document.documentElement && isTtsEligibleNode(active)) {
			if (!clickEl || clickEl === active || active.contains(clickEl) || clickEl.contains(active)) {
				seeds.push(active);
			}
		}

		if (state.readingContent) {
			const hover = (clickEl && clickEl.closest?.('.a11y-reading-active')) ||
				document.querySelector('.a11y-reading-active');
			if (hover && isTtsEligibleNode(hover)) {
				seeds.push(hover);
			}
		}

		if (state.readingMode) {
			const readingFocus = document.querySelector('.cwas-reading-focus');
			if (readingFocus && isTtsEligibleNode(readingFocus)) {
				seeds.push(readingFocus);
			}
		}

		if (clickEl && isTtsEligibleNode(clickEl)) {
			seeds.push(clickEl);
		}

		if (active && active !== document.body && isTtsEligibleNode(active) && !seeds.includes(active)) {
			seeds.push(active);
		}

		return seeds;
	}

	function resolveTtsTarget(clickEl) {
		const seeds = getTtsInteractionSeeds(clickEl);
		for (let i = 0; i < seeds.length; i++) {
			const block = findTtsBlockFromSeed(seeds[i]);
			if (block) return block;
		}
		return null;
	}

	function readTtsBlock(block, focusEl) {
		if (!state.tts || !block) return;
		const text = getTtsReadableText(block);
		if (!text) return;
		ttsLastReadBlock = block;
		if (focusEl) ttsLastFocusEl = focusEl;
		ttsRead(text);
	}

	function startTtsResumeKeepalive() {
		clearTtsResumeTimer();
		ttsResumeTimer = setInterval(() => {
			if (!ttsSpeaking || !ttsSupported()) {
				clearTtsResumeTimer();
				return;
			}
			if (window.speechSynthesis.paused) {
				try { window.speechSynthesis.resume(); } catch (_) { /* ignore */ }
			}
		}, 200);
	}

	function speakUtterance(utt, playbackGen) {
		if (playbackGen !== undefined && playbackGen !== ttsPlaybackGen) return;
		if (!state.tts) return;
		const synth = window.speechSynthesis;
		utt.onstart = () => {
			if (playbackGen !== undefined && playbackGen !== ttsPlaybackGen) {
				cancelSpeechNow();
				return;
			}
			if (!state.tts) {
				cancelSpeechNow();
				return;
			}
			ttsSpeaking = true;
			syncStopSpeakingBtn();
			startTtsResumeKeepalive();
		};
		utt.onend = () => {
			clearTtsResumeTimer();
			ttsSpeaking = false;
			syncStopSpeakingBtn();
		};
		utt.onerror = () => {
			clearTtsResumeTimer();
			ttsSpeaking = false;
			syncStopSpeakingBtn();
			announcePanelStatus(t('ttsError', 'Could not read this text. Try another section.'));
		};
		synth.speak(utt);
	}

	function ttsRead(text) {
		if (!state.tts || !ttsSupported() || !text || !text.trim()) return;
		stopTts(false);
		const gen = ttsPlaybackGen;
		refreshTtsVoices();

		let started = false;
		const run = () => {
			if (started || gen !== ttsPlaybackGen || !state.tts) return;
			started = true;
			const lang = getTtsLang();
			const utt  = new SpeechSynthesisUtterance(text.trim());
			utt.lang   = lang;
			const voice = pickTtsVoice(lang);
			if (voice) utt.voice = voice;
			/* Defer after cancel() — required in Chrome and Safari. */
			window.setTimeout(() => speakUtterance(utt, gen), 50);
		};

		if (!ttsVoicesReady) {
			clearTtsVoiceListener();
			ttsVoiceListener = () => {
				refreshTtsVoices();
				run();
			};
			window.speechSynthesis.addEventListener('voiceschanged', ttsVoiceListener);
			window.setTimeout(() => {
				refreshTtsVoices();
				run();
			}, 400);
			return;
		}
		run();
	}

	const TTS_IGNORE_CLICK_SEL = [
		'[data-a11y-toggle]',
		'[data-a11y-mode]',
		'[data-a11y-step]',
		'[data-a11y-preset]',
		'[data-a11y-action]',
		'.cwas-close-btn',
		'.cwas-chip',
	].join(', ');

	function onTtsClick(e) {
		if (!state.tts) return;
		if (e.target.closest(TTS_IGNORE_CLICK_SEL)) return;
		const block = resolveTtsTarget(e.target);
		if (!block) return;
		ttsSuppressFocusUntil = Date.now() + 800;
		if (ttsFocusTimer) {
			clearTimeout(ttsFocusTimer);
			ttsFocusTimer = null;
		}
		readTtsBlock(block, e.target);
	}

	function onTtsFocusIn(e) {
		if (!state.tts) return;
		if (Date.now() < ttsSuppressFocusUntil) return;
		const target = e.target;
		if (target.closest(TTS_IGNORE_CLICK_SEL)) return;
		if (!isTtsEligibleNode(target)) return;

		if (ttsFocusTimer) clearTimeout(ttsFocusTimer);
		ttsFocusTimer = setTimeout(() => {
			ttsFocusTimer = null;
			if (!state.tts || Date.now() < ttsSuppressFocusUntil) return;
			const block = findTtsBlockFromSeed(target);
			if (!block || (block === ttsLastReadBlock && target === ttsLastFocusEl)) return;
			ttsLastFocusEl = target;
			readTtsBlock(block);
		}, 350);
	}

	/* ─── Skip link ────────────────────────────────────────────────────────────── */
	const SKIP_LINK_ID = 'cwas-skip-link';

	function ensureSkipLink() {
		if (!document.body) return;
		if (document.getElementById(SKIP_LINK_ID)) return;
		/* Don't inject if the page already has a skip link */
		if (document.querySelector(
			'a[href^="#"][class*="skip"], a[href="#main"], a[href="#content"], a[href="#maincontent"], a[href="#main-content"]'
		)) return;
		const main = document.querySelector('main, [role="main"], #main, #content, #site-content');
		if (!main) return;
		if (!main.id) main.id = 'cwas-main-content';
		const link       = document.createElement('a');
		link.id          = SKIP_LINK_ID;
		link.href        = '#' + main.id;
		link.className   = 'cwas-skip-link';
		link.textContent = t('skipToContent', 'Skip to main content');
		document.body.prepend(link);
	}

	/* ─── Alt-text overlays ────────────────────────────────────────────────────── */
	const ALT_BADGE_CLASS = 'cwas-alt-badge';

	function applyAltTextOverlays() {
		if (state.showAltText) {
			document.querySelectorAll('img[alt]').forEach(img => {
				if (!img.alt || img.closest('#cwas-a11y-widget')) return;
				if (img.nextElementSibling?.classList.contains(ALT_BADGE_CLASS)) return;
				const badge      = document.createElement('span');
				badge.className  = ALT_BADGE_CLASS;
				badge.setAttribute('aria-hidden', 'true');
				badge.textContent = img.alt;
				img.insertAdjacentElement('afterend', badge);
			});
		} else {
			document.querySelectorAll('.' + ALT_BADGE_CLASS).forEach(b => b.remove());
		}
	}

	/* ─── Form label detector ──────────────────────────────────────────────────── */
	const FORM_BADGE_CLASS = 'cwas-form-badge';

	function applyFormLabels() {
		if (state.formLabels) {
			const sel = [
				'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"])',
				'select',
				'textarea',
			].join(', ');
			document.querySelectorAll(sel).forEach(field => {
				if (field.closest('#cwas-a11y-widget') || field.closest('#cwas-report-modal')) return;
				const labeled =
					(field.labels && field.labels.length > 0) ||
					field.getAttribute('aria-label') ||
					field.getAttribute('aria-labelledby') ||
					field.getAttribute('title');
				if (!labeled && !field.dataset.cwasBadged) {
					field.dataset.cwasBadged = '1';
					const badge      = document.createElement('span');
					badge.className  = FORM_BADGE_CLASS;
					badge.setAttribute('aria-hidden', 'true');
					badge.textContent = t('missingLabel', 'Missing label');
					field.insertAdjacentElement('afterend', badge);
				}
			});
		} else {
			document.querySelectorAll('.' + FORM_BADGE_CLASS).forEach(b => b.remove());
			document.querySelectorAll('[data-cwas-badged]').forEach(f => delete f.dataset.cwasBadged);
		}
	}

	/* ─── Table navigation helper ──────────────────────────────────────────────── */
	let tableTooltip = null;

	function applyTableHelper() {
		if (state.tableHelper) {
			if (!tableTooltip) {
				tableTooltip = document.createElement('div');
				tableTooltip.id = 'cwas-table-tooltip';
				tableTooltip.setAttribute('aria-hidden', 'true');
				tableTooltip.hidden = true;
				document.body.appendChild(tableTooltip);
				document.addEventListener('mouseover', onCellOver);
				document.addEventListener('mouseout', onCellOut);
				document.addEventListener('mousemove', onTooltipMove);
			}
		}
		if (tableTooltip) tableTooltip.hidden = !state.tableHelper;
	}

	let tooltipPos = { x: 0, y: 0 };

	function onCellOver(e) {
		if (!state.tableHelper || !tableTooltip) return;
		const cell = e.target.closest('td');
		if (!cell) { tableTooltip.hidden = true; return; }
		const header = getCellHeaders(cell);
		if (!header) { tableTooltip.hidden = true; return; }
		tableTooltip.textContent = header;
		tableTooltip.hidden      = false;
		positionTooltip();
	}

	function onCellOut(e) {
		if (!tableTooltip || !e.target.closest('td')) tableTooltip && (tableTooltip.hidden = true);
	}

	function onTooltipMove(e) {
		tooltipPos = { x: e.clientX, y: e.clientY };
		positionTooltip();
	}

	function positionTooltip() {
		if (!tableTooltip || tableTooltip.hidden) return;
		tableTooltip.style.top  = (tooltipPos.y + 16) + 'px';
		tableTooltip.style.left = (tooltipPos.x + 12) + 'px';
	}

	function getCellHeaders(cell) {
		const row   = cell.parentElement;
		const table = cell.closest('table');
		if (!table || !row) return '';
		const colIdx  = Array.from(row.cells).indexOf(cell);
		const parts   = [];
		/* Column header from <thead> */
		const thead   = table.querySelector('thead');
		if (thead) {
			const hCell = thead.querySelectorAll('tr')[0]?.cells[colIdx];
			if (hCell) parts.push(hCell.textContent.trim());
		}
		/* Row header from first <th> in same row */
		const rowHeader = row.querySelector('th[scope="row"], th');
		if (rowHeader && rowHeader !== cell) parts.push(rowHeader.textContent.trim());
		return parts.filter(Boolean).join(' › ');
	}

	/* ─── CVD SVG filters ──────────────────────────────────────────────────────── */
	function injectCvdFilters() {
		if (document.getElementById('cwas-cvd-svg')) return;
		const svgNS = 'http://www.w3.org/2000/svg';
		const svg   = document.createElementNS(svgNS, 'svg');
		svg.id      = 'cwas-cvd-svg';
		svg.setAttribute('aria-hidden', 'true');
		svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;';
		svg.innerHTML = `<defs>
			<filter id="cvd-deuteranopia" color-interpolation-filters="linearRGB">
				<feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"/>
			</filter>
			<filter id="cvd-protanopia" color-interpolation-filters="linearRGB">
				<feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"/>
			</filter>
			<filter id="cvd-tritanopia" color-interpolation-filters="linearRGB">
				<feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"/>
			</filter>
		</defs>`;
		document.body.appendChild(svg);
	}

	/* ─── OpenDyslexic font loader ─────────────────────────────────────────────── */
	let dyslexicLoaded = false;

	function applyDyslexicFont() {
		if (state.dyslexiaFont && !dyslexicLoaded) {
			const link  = document.createElement('link');
			link.id     = 'cwas-od-font';
			link.rel    = 'stylesheet';
			link.href   = 'https://fonts.cdnfonts.com/css/opendyslexic';
			document.head.appendChild(link);
			dyslexicLoaded = true;
		}
	}

	/* ─── Landmark scanner ─────────────────────────────────────────────────────── */
	const LANDMARK_DEFS = [
		{ sel: '[role="banner"], header:not([role])',        label: () => t('lmBanner', 'Header') },
		{ sel: '[role="navigation"], nav',                   label: el => el.getAttribute('aria-label') || t('lmNav', 'Navigation') },
		{ sel: '[role="main"], main',                        label: () => t('lmMain', 'Main content') },
		{ sel: '[role="complementary"], aside',              label: el => el.getAttribute('aria-label') || t('lmAside', 'Sidebar') },
		{ sel: '[role="contentinfo"], footer:not([role])',   label: () => t('lmFooter', 'Footer') },
		{ sel: '[role="search"]',                            label: () => t('lmSearch', 'Search') },
		{ sel: '[role="form"], form[aria-label]',            label: el => el.getAttribute('aria-label') || t('lmForm', 'Form') },
	];

	function getLandmarks() {
		const seen = new WeakSet();
		const list = [];
		LANDMARK_DEFS.forEach(({ sel, label }) => {
			document.querySelectorAll(sel).forEach((el, i) => {
				if (seen.has(el) || el.closest('#cwas-a11y-widget')) return;
				seen.add(el);
				if (!el.id) el.id = 'cwas-lm-' + list.length;
				list.push({ id: el.id, label: label(el) + (i > 0 ? ' ' + (i + 1) : '') });
			});
		});
		return list;
	}

	/* ─── Profiles ─────────────────────────────────────────────────────────────── */
	function loadProfiles() {
		try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]'); } catch (_) { return []; }
	}

	function saveProfiles(profiles) {
		try { localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles)); } catch (_) { /* ignore */ }
	}

	function saveProfile() {
		/* eslint-disable no-alert */
		const name = window.prompt(t('profileNamePrompt', 'Enter a name for this profile:'));
		if (!name || !name.trim()) return;
		const profiles = loadProfiles();
		const idx      = profiles.findIndex(p => p.name === name.trim());
		const entry    = { name: name.trim(), state: Object.assign({}, state) };
		if (idx >= 0) profiles[idx] = entry; else profiles.push(entry);
		saveProfiles(profiles);
		refreshProfilesList();
	}

	function loadProfile(name) {
		const entry = loadProfiles().find(p => p.name === name);
		if (!entry) return;
		state = Object.assign({}, DEFAULTS, entry.state);
		applyAll();
		saveState();
		syncAllButtons();
	}

	function deleteProfile(name) {
		saveProfiles(loadProfiles().filter(p => p.name !== name));
		refreshProfilesList();
	}

	function refreshProfilesList() {
		const el = document.querySelector('.cwas-profiles-list');
		if (el) el.innerHTML = buildProfilesListHTML();
	}

	/* ─── Presets, chips, tabs (IA §1) ─────────────────────────────────────────── */
	function presetValueMatches(key, expected) {
		if (key === 'fontScale') {
			return FONT_SCALE_LEVELS.indexOf(state.fontScale) === FONT_SCALE_LEVELS.indexOf(expected);
		}
		return state[key] === expected;
	}

	function presetIsActive(presetId) {
		const preset = PRESETS[presetId];
		if (!preset) return false;
		return Object.keys(preset).every((key) => presetValueMatches(key, preset[key]));
	}

	function reconcileActivePreset() {
		if (state.activePreset && !presetIsActive(state.activePreset)) {
			state.activePreset = null;
		}
		if (!state.activePreset) {
			for (const id of Object.keys(PRESETS)) {
				if (presetIsActive(id)) {
					state.activePreset = id;
					break;
				}
			}
		}
	}

	function presetShowsActive(presetId) {
		return state.activePreset === presetId || presetIsActive(presetId);
	}

	function clearPreset(presetId) {
		const preset = PRESETS[presetId];
		if (!preset) return;
		Object.keys(preset).forEach((key) => {
			state[key] = DEFAULTS[key];
		});
		state.activePreset = null;
		trackToggle('preset_clear_' + presetId);
		applyAll();
		saveState();
		syncAllButtons();
	}

	function applyPreset(presetId) {
		const preset = PRESETS[presetId];
		if (!preset) return;
		if (presetShowsActive(presetId)) {
			clearPreset(presetId);
			return;
		}
		state = Object.assign({}, DEFAULTS, preset);
		state.activePreset = presetId;
		trackToggle('preset_' + presetId);
		applyAll();
		saveState();
		syncAllButtons();
	}

	function clearChip(clearKey) {
		if (clearKey.startsWith('toggle:')) {
			state[clearKey.slice(7)] = false;
		} else if (clearKey.startsWith('mode:')) {
			state[clearKey.slice(5) + 'Mode'] = null;
		} else if (clearKey === 'fontScale') {
			state.fontScale = 1;
		} else if (clearKey === 'lineHeight' || clearKey === 'letterSpacing' || clearKey === 'wordSpacing') {
			state[clearKey] = 0;
		} else if (clearKey === 'customColor') {
			state.customColor = null;
			document.documentElement.style.setProperty('--cwas-primary', primaryColor);
			const pick = panelEl?.querySelector('.cwas-color-pick');
			if (pick) pick.value = primaryColor;
		}
		applyAll();
		saveState();
		syncAllButtons();
	}

	function getActiveChips() {
		const chips = [];

		if (state.fontScale !== 1) {
			chips.push({
				clear: 'fontScale',
				label: t('chipTextSize', 'Text size') + ' ' + Math.round(state.fontScale * 100) + '%',
			});
		}
		if (state.lineHeight > 0) {
			chips.push({
				clear: 'lineHeight',
				label: t('lineHeight', 'Line height') + ' ×' + LINE_HEIGHT_LEVELS[state.lineHeight],
			});
		}
		if (state.letterSpacing > 0) {
			chips.push({
				clear: 'letterSpacing',
				label: t('letterSpacing', 'Letter spacing') + ' +' + LETTER_SPACING_STEPS[state.letterSpacing] + 'px',
			});
		}
		if (state.wordSpacing > 0) {
			chips.push({
				clear: 'wordSpacing',
				label: t('wordSpacing', 'Word spacing') + ' +' + WORD_SPACING_STEPS[state.wordSpacing] + 'px',
			});
		}
		if (state.contrastMode) {
			const ck = { high: 'highContrast', light: 'lightContrast', dark: 'darkContrast' }[state.contrastMode];
			chips.push({ clear: 'mode:contrast', label: t(ck, state.contrastMode) });
		}
		if (state.saturationMode) {
			const sk = { monochrome: 'monochrome', low: 'lowSaturation', high: 'highSaturation' }[state.saturationMode];
			chips.push({ clear: 'mode:saturation', label: t(sk, state.saturationMode) });
		}
		if (state.cvdMode) {
			chips.push({ clear: 'mode:cvd', label: t(state.cvdMode, state.cvdMode) });
		}
		if (state.customColor) {
			chips.push({ clear: 'customColor', label: t('highlightColor', 'Highlight color') });
		}

		Object.keys(TOGGLE_LABELS).forEach((key) => {
			if (!state[key]) return;
			if (!allowed(key)) return;
			chips.push({
				clear: 'toggle:' + key,
				label: t(TOGGLE_LABELS[key], key),
			});
		});

		return chips;
	}

	function buildActiveChipsHTML() {
		const chips = getActiveChips();
		if (!chips.length) {
			return `<p class="cwas-chips-empty">${esc(t('noActiveSettings', 'No adjustments active'))}</p>`;
		}
		return chips.map((c) => `
			<button type="button" class="cwas-chip" data-chip-clear="${esc(c.clear)}"
				aria-label="${esc(t('removeSetting', 'Remove'))}: ${esc(c.label)}">
				<span class="cwas-chip-label">${esc(c.label)}</span>
				<span class="cwas-chip-x" aria-hidden="true">×</span>
			</button>`).join('');
	}

	const ESSENTIAL_AIDS = [
		{ key: 'tts', icon: 'tts', hintKey: 'ttsHint', hintFb: 'When on, Tab to content or click it to hear it read aloud.' },
		{ key: 'stopAnimations', icon: 'motion', hintKey: 'stopAnimationsHint', hintFb: 'Pauses moving and auto-playing animations across the site.' },
		{ key: 'stopAudio', icon: 'audio', hintKey: 'stopAudioHint', hintFb: 'Mutes videos and blocks new sounds until you turn this off.' },
	];

	const CTRL_ICON_SVG = {
		tts: '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
		motion: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
		audio: '<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M23 9l-6 6M17 9l6 6"/>',
		stopSpeak: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
		fontScale: '<path d="M4 7V4h3"/><path d="M10 7V4h3"/><path d="M4 20v-3h3"/><path d="M7 7l13 13"/><path d="M17 17v3h-3"/>',
		fontScaleDown: '<path d="M4 7V4h3"/><path d="M10 7V4h3"/><path d="M4 20v-3h3"/><path d="M17 17v3h-3"/><path d="M7 17l13-13"/>',
		lineHeight: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/>',
		letterSpacing: '<path d="M4 12h2"/><path d="M10 12h4"/><path d="M18 12h2"/><path d="M7 9l-3 3 3 3"/><path d="M17 9l3 3-3 3"/>',
		wordSpacing: '<path d="M5 12h3"/><path d="M11 12h3"/><path d="M17 12h2"/><path d="M8 9v6"/><path d="M16 9v6"/>',
		dyslexiaFont: '<path d="M7 20l4-16"/><path d="M13 20l4-16"/><path d="M9 12h6"/>',
		largeCursor: '<path d="M5 3v14l4-4.5 2.5 6.5 2-1-2.5-6h6.5L5 3z" fill="currentColor" stroke="none"/>',
		highlightLinks: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
		highlightHeadings: '<path d="M6 4v16"/><path d="M10 4v7h6V4"/><path d="M10 15h8v5"/>',
		readableFont: '<path d="M4 7V4h12"/><path d="M4 20v-3h12"/><path d="M9 4v16"/>',
		focusContent: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
		readingContent: '<path d="M4 6h16v12H4z"/><path d="M8 10h8M8 14h5"/>',
		readingMask: '<path d="M4 10h16v4H4z"/><path d="M2 6h20M2 18h20"/>',
		readingMode: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
		nightMode: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
		invertColors: '<circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" stroke="none"/>',
		'contrast-high': '<circle cx="12" cy="12" r="10"/><path d="M12 2v20"/><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" stroke="none"/>',
		'contrast-light': '<circle cx="12" cy="12" r="10"/><path d="M12 3v18"/><path d="M8 8h8M8 16h8"/>',
		'contrast-dark': '<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" fill="currentColor" stroke="none"/>',
		'saturation-monochrome': '<circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>',
		'saturation-low': '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
		'saturation-high': '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="currentColor" stroke="none"/>',
		'cvd-deuteranopia': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
		'cvd-protanopia': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
		'cvd-tritanopia': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
		pauseGifs: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 9v6M15 9v6"/>',
		hideImages: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 19l-5.5-5.5"/><path d="M3 19l7-7"/>',
		showAltText: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 15h4M7 11h10"/>',
		highlightHover: '<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>',
		highlightClick: '<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',
		formLabels: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h6"/>',
		tableHelper: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M3 14h18M9 5v14M15 5v14"/>',
		saveProfile: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
	};

	function controlIconSvg(type) {
		const inner = CTRL_ICON_SVG[type];
		if (!inner) return '';
		return `<svg class="cwas-ctrl-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">${inner}</svg>`;
	}

	function essentialIconSvg(type) {
		return controlIconSvg(type) || controlIconSvg('tts');
	}

	function mkCtrlBtnContent(iconKey, labelHtml) {
		return `<span class="cwas-ctrl-icon" aria-hidden="true">${controlIconSvg(iconKey)}</span><span class="cwas-ctrl-label">${labelHtml}</span>`;
	}

	function modeIconKey(group, value) {
		return group + '-' + value;
	}

	function announcePanelStatus(message, assertive) {
		const el = panelEl?.querySelector('#cwas-panel-status');
		if (!el || !message) return;
		el.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
		el.textContent = '';
		window.setTimeout(() => {
			el.textContent = message;
			window.setTimeout(() => {
				el.textContent = '';
				window.setTimeout(() => {
					el.textContent = message;
				}, 50);
			}, 100);
		}, 50);
	}

	function announceTtsState(active) {
		const msg = active
			? t(
				'ttsActivated',
				'Screen reader is active. Tab through this menu or the page to hear each item.'
			)
			: t('ttsDeactivated', 'Screen reader turned off.');
		ttsSuppressFocusUntil = Date.now() + 3000;
		if (ttsFocusTimer) {
			clearTimeout(ttsFocusTimer);
			ttsFocusTimer = null;
		}
		announcePanelStatus(msg, true);
		if (active) {
			speakStatusMessage(msg);
		}
	}

	function essentialToggleMessage(key, active) {
		const label = t(TOGGLE_LABELS[key], key);
		const stateLabel = active ? t('settingOn', 'On') : t('settingOff', 'Off');
		return label + ' – ' + stateLabel;
	}

	function mkEssentialAid({ key, icon, hintKey, hintFb }) {
		if (!allowed(key)) return '';
		const active = Boolean(state[key]);
		const label  = t(TOGGLE_LABELS[key], key);
		const hint   = t(hintKey, hintFb);
		const hintId = 'cwas-hint-' + key;
		return `<button type="button"
			class="cwas-essential-btn${active ? ' is-active' : ''}"
			role="switch"
			aria-checked="${active}"
			aria-describedby="${esc(hintId)}"
			data-a11y-toggle="${esc(key)}">
			<span class="cwas-ctrl-icon" aria-hidden="true">${controlIconSvg(icon)}</span>
			<span class="cwas-essential-label">${esc(label)}</span>
		</button>
		<span class="cwas-sr-only" id="${esc(hintId)}">${esc(hint)}</span>`;
	}

	function buildEssentialAidsHTML() {
		const buttons = ESSENTIAL_AIDS.map(mkEssentialAid).filter(Boolean);
		if (!buttons.length) return '';
		return `<section class="cwas-essential-aids-wrap" aria-labelledby="cwas-essential-title">
			<h3 class="cwas-essential-heading" id="cwas-essential-title">${esc(t('essentialAids', 'Essential aids'))}</h3>
			<div class="cwas-essential-aids" role="group" aria-labelledby="cwas-essential-title">
				${buttons.join('')}
			</div>
			<button type="button" class="cwas-essential-btn cwas-essential-action" data-a11y-action="stopTts" hidden>
				<span class="cwas-ctrl-icon" aria-hidden="true">${controlIconSvg('stopSpeak')}</span>
				<span class="cwas-essential-label">${esc(t('stopSpeaking', 'Stop speaking'))}</span>
			</button>
		</section>`;
	}

	function buildPresetsHTML() {
		const items = [
			['lowVision', 'presetLowVision', 'Low vision'],
			['dyslexia', 'presetDyslexia', 'ADHD'],
			['reduceMotion', 'presetReduceMotion', 'Reduce motion'],
			['highContrast', 'presetHighContrast', 'High contrast'],
		];
		return items.map(([id, i18nKey, fb]) => `
			<button type="button" class="cwas-preset-btn" data-a11y-preset="${esc(id)}">
				${esc(t(i18nKey, fb))}
			</button>`).join('');
	}

	function mkOpenSection(title, content) {
		return `<div class="cwas-inline-group cwas-open-section">
			<p class="cwas-subsection-label">${esc(title)}</p>
			${content}
		</div>`;
	}

	function mkAccordion(id, title, content, openDefault) {
		return `<details class="cwas-accordion" id="${esc(id)}"${openDefault ? ' open' : ''}>
			<summary class="cwas-accordion-summary">${esc(title)}</summary>
			<div class="cwas-accordion-body">${content}</div>
		</details>`;
	}

	function mkSegmentBtn(group, value, label) {
		const active = state[group + 'Mode'] === value;
		const iconKey = modeIconKey(group, value);
		return `<button type="button"
			class="cwas-segment-btn${active ? ' is-active' : ''}"
			aria-pressed="${active}"
			data-a11y-mode="${esc(group)}"
			data-value="${esc(value)}">${mkCtrlBtnContent(iconKey, esc(label))}</button>`;
	}

	function mkToggleSegmentBtn(key, label) {
		const active = Boolean(state[key]);
		return `<button type="button"
			class="cwas-segment-btn${active ? ' is-active' : ''}"
			aria-pressed="${active}"
			data-a11y-toggle="${esc(key)}">${mkCtrlBtnContent(key, esc(label))}</button>`;
	}

	function mkSegmentGroup(title, group, items) {
		const buttons = items
			.map(([value, key, fb]) => mkSegmentBtn(group, value, t(key, fb)))
			.join('');
		return `<div class="cwas-inline-group">
			<p class="cwas-subsection-label">${esc(title)}</p>
			<div class="cwas-btn-group" role="group" aria-label="${esc(title)}">${buttons}</div>
		</div>`;
	}

	function buildContrastSection() {
		const title = t('contrast', 'Contrast');
		const modeButtons = [
			['high', 'highContrast', 'High contrast'],
			['light', 'lightContrast', 'Light contrast'],
			['dark', 'darkContrast', 'Dark contrast'],
		].map(([value, key, fb]) => mkSegmentBtn('contrast', value, t(key, fb))).join('');
		const toggleButtons = [
			['nightMode', 'nightMode', 'Night mode'],
			['invertColors', 'invertColors', 'Invert colors'],
		].map(([key, i18nKey, fb]) => mkToggleSegmentBtn(key, t(i18nKey, fb))).join('');
		return `<div class="cwas-inline-group">
			<p class="cwas-subsection-label">${esc(title)}</p>
			<div class="cwas-btn-group" role="group" aria-label="${esc(title)}">${modeButtons}</div>
			<div class="cwas-btn-group" role="group">${toggleButtons}</div>
		</div>`;
	}

	function refreshActiveChips() {
		const wrap = panelEl?.querySelector('.cwas-active-chips');
		if (wrap) wrap.innerHTML = buildActiveChipsHTML();
		updateTriggerBadge();
	}

	function updateTriggerBadge() {
		if (!triggerEl || !triggerAnchor) return;
		const count = getActiveChips().length;
		let badge = triggerAnchor.querySelector('.cwas-trigger-badge');
		if (count > 0) {
			if (!badge) {
				badge = document.createElement('span');
				badge.className = 'cwas-trigger-badge';
				badge.setAttribute('aria-hidden', 'true');
				triggerAnchor.appendChild(badge);
			}
			badge.textContent = count > 9 ? '9+' : String(count);
			triggerEl.classList.add('has-active-settings');
		} else {
			badge?.remove();
			triggerEl.classList.remove('has-active-settings');
		}
	}

	function buildPanelSections() {
		const sections = [
			['text', 'tabText', 'Text', buildTypographySection()],
			['vision', 'tabVision', 'Vision', buildVisionSections()],
			['reading', 'tabReading', 'Reading', buildReadingSection()],
			['more', 'tabMore', 'More', buildMoreSections()],
		];
		return sections.map(([id, key, fb, content]) => `
			<section class="cwas-panel-section" id="cwas-section-${esc(id)}" aria-labelledby="cwas-section-h-${esc(id)}">
				<h3 class="cwas-section-heading" id="cwas-section-h-${esc(id)}">${esc(t(key, fb))}</h3>
				${content}
			</section>`).join('');
	}

	function buildTypographySection() {
		return mkOpenSection(t('typography', 'Typography'), `
			<div class="cwas-controls">
				${mkQtySelector('fontScale', t('chipTextSize', 'Text size'))}
				${mkQtySelector('lineHeight', t('lineHeight', 'Line height'))}
				${mkQtySelector('letterSpacing', t('letterSpacing', 'Letter spacing'))}
				${mkQtySelector('wordSpacing', t('wordSpacing', 'Word spacing'))}
				${mkToggle('dyslexiaFont', t('dyslexiaFont', 'Dyslexia font'))}
				${mkToggle('largeCursor', t('largeCursor', 'Larger cursor'))}
			</div>`);
	}

	function buildVisionSections() {
		return [
			buildContrastSection(),
			mkSegmentGroup(t('saturation', 'Color saturation'), 'saturation', [
				['monochrome', 'monochrome', 'Monochrome'],
				['low', 'lowSaturation', 'Low saturation'],
				['high', 'highSaturation', 'High saturation'],
			]),
			mkSegmentGroup(t('colorBlindness', 'Color blindness'), 'cvd', [
				['deuteranopia', 'deuteranopia', 'Deuteranopia (green-blind)'],
				['protanopia', 'protanopia', 'Protanopia (red-blind)'],
				['tritanopia', 'tritanopia', 'Tritanopia (blue-blind)'],
			]),
		].join('');
	}

	function buildReadingSection() {
		return mkOpenSection(t('readingAids', 'Reading aids'), `
			<div class="cwas-controls">
				${mkToggle('highlightLinks', t('highlightLinks', 'Highlight links'))}
				${mkToggle('highlightHeadings', t('highlightHeadings', 'Highlight headings'))}
				${mkToggle('readableFont', t('readableFont', 'Readable font'))}
				${mkToggle('focusContent', t('focusContent', 'Focused content'))}
				${mkToggle('readingContent', t('readingContent', 'Reading content'))}
				${mkToggle('readingMask', t('readingMask', 'Reading mask'))}
				${mkToggle('readingMode', t('readingMode', 'Reading mode'))}
			</div>`);
	}

	function buildMoreSections() {
		return [
			mkOpenSection(t('additionalAids', 'Additional aids'), `
				<div class="cwas-controls">
					${mkToggle('pauseGifs', t('pauseGifs', 'Pause GIFs'))}
					${mkToggle('hideImages', t('hideImages', 'Hide images'))}
					${mkToggle('showAltText', t('showAltText', 'Show alt text'))}
					${mkToggle('highlightHover', t('highlightHover', 'Highlight hover'))}
					${mkToggle('highlightClick', t('highlightClick', 'Highlight click'))}
					${mkToggle('formLabels', t('formLabels', 'Form labels'))}
					${mkToggle('tableHelper', t('tableHelper', 'Table navigation'))}
				</div>`),
			mkOpenSection(t('navigation', 'Navigation'), `
				<div class="cwas-landmarks" role="navigation" aria-label="${esc(t('landmarksTitle', 'Jump to section'))}">
					<p class="cwas-subsection-label">${esc(t('landmarksTitle', 'Jump to section'))}</p>
					<div class="cwas-landmarks-list">${buildLandmarksHTML()}</div>
				</div>
				${mkAccordion('cwas-acc-shortcuts', t('keyboardShortcuts', 'Keyboard shortcuts'), `
					<div class="cwas-shortcuts-body">${buildShortcutsHTML()}</div>`, false)}`),
			mkOpenSection(t('profiles', 'Profiles'), `
				<button type="button" class="cwas-ctrl-btn cwas-ctrl-btn--icon" data-a11y-action="saveProfile">
					${mkCtrlBtnContent('saveProfile', esc(t('saveProfile', 'Save current')))}
				</button>
				<div class="cwas-profiles-list">${buildProfilesListHTML()}</div>`),
		].join('');
	}

	/* ─── HTML builders ────────────────────────────────────────────────────────── */
	function mkToggle(key, label) {
		if (!allowed(key)) return '';
		const active = Boolean(state[key]);
		return `<button type="button"
			class="cwas-ctrl-btn cwas-ctrl-btn--icon${active ? ' is-active' : ''}"
			aria-pressed="${active}"
			data-a11y-toggle="${esc(key)}">${mkCtrlBtnContent(key, esc(label))}</button>`;
	}

	function mkMode(group, value, label) {
		const active = state[group + 'Mode'] === value;
		const iconKey = modeIconKey(group, value);
		return `<button type="button"
			class="cwas-ctrl-btn cwas-ctrl-btn--icon${active ? ' is-active' : ''}"
			aria-pressed="${active}"
			data-a11y-mode="${esc(group)}"
			data-value="${esc(value)}">${mkCtrlBtnContent(iconKey, esc(label))}</button>`;
	}

	function stepLevels(key) {
		if (key === 'fontScale') return FONT_SCALE_LEVELS;
		if (key === 'lineHeight') return LINE_HEIGHT_LEVELS;
		if (key === 'letterSpacing') return LETTER_SPACING_STEPS;
		if (key === 'wordSpacing') return WORD_SPACING_STEPS;
		return [];
	}

	function stepIndex(key) {
		if (key === 'fontScale') {
			const idx = FONT_SCALE_LEVELS.indexOf(state.fontScale);
			return idx >= 0 ? idx : 0;
		}
		return state[key] || 0;
	}

	function isStepMin(key) {
		return stepIndex(key) <= 0;
	}

	function isStepMax(key) {
		return stepIndex(key) >= stepLevels(key).length - 1;
	}

	function stepIsAdjusted(key) {
		return key === 'fontScale' ? state.fontScale !== 1 : state[key] !== 0;
	}

	function stepDisplayValue(key) {
		if (key === 'fontScale') {
			return Math.round(state.fontScale * 100) + '%';
		}
		if (key === 'lineHeight') {
			const v = LINE_HEIGHT_LEVELS[state.lineHeight];
			return '×' + v;
		}
		if (key === 'letterSpacing') {
			const v = LETTER_SPACING_STEPS[state.letterSpacing];
			return v ? '+' + v + 'px' : '0';
		}
		if (key === 'wordSpacing') {
			const v = WORD_SPACING_STEPS[state.wordSpacing];
			return v ? '+' + v + 'px' : '0';
		}
		return '';
	}

	function mkQtySelector(key, label) {
		if (!allowed(key)) return '';
		const iconKey = key === 'fontScale' ? 'fontScale' : key;
		const decLabel = key === 'fontScale'
			? t('decreaseText', 'Decrease text')
			: `${label} — ${t('decreaseText', 'Decrease text')}`;
		const incLabel = key === 'fontScale'
			? t('increaseText', 'Increase text')
			: `${label} — ${t('increaseText', 'Increase text')}`;
		return `<div class="cwas-qty-selector${stepIsAdjusted(key) ? ' is-adjusted' : ''}" data-a11y-qty="${esc(key)}">
			<div class="cwas-qty-heading">
				<span class="cwas-ctrl-icon" aria-hidden="true">${controlIconSvg(iconKey)}</span>
				<span class="cwas-qty-title">${esc(label)}</span>
			</div>
			<div class="cwas-qty-controls" role="group" aria-label="${esc(label)}">
				<button type="button" class="cwas-qty-btn" data-a11y-step="${esc(key)}" data-a11y-step-dir="down"
					aria-label="${esc(decLabel)}"${isStepMin(key) ? ' disabled' : ''}>−</button>
				<span class="cwas-qty-value" aria-live="polite">${esc(stepDisplayValue(key))}</span>
				<button type="button" class="cwas-qty-btn" data-a11y-step="${esc(key)}" data-a11y-step-dir="up"
					aria-label="${esc(incLabel)}"${isStepMax(key) ? ' disabled' : ''}>+</button>
			</div>
		</div>`;
	}

	function buildProfilesListHTML() {
		const profiles = loadProfiles();
		if (!profiles.length) {
			return `<p class="cwas-empty-msg">${esc(t('noProfiles', 'No saved profiles'))}</p>`;
		}
		return profiles.map(p => `
			<div class="cwas-profile-row">
				<button type="button" class="cwas-profile-load" data-profile="${esc(p.name)}">${esc(p.name)}</button>
				<button type="button" class="cwas-profile-del" data-profile="${esc(p.name)}"
					aria-label="${esc(t('deleteProfile', 'Delete'))} ${esc(p.name)}">×</button>
			</div>`).join('');
	}

	function buildLandmarksHTML() {
		const list = getLandmarks();
		if (!list.length) {
			return `<p class="cwas-empty-msg">${esc(t('noLandmarks', 'No landmarks found'))}</p>`;
		}
		return list.map(lm =>
			`<a href="#${esc(lm.id)}" class="cwas-landmark-link" data-close-panel="1">${esc(lm.label)}</a>`
		).join('');
	}

	function buildShortcutsHTML() {
		const rows = [
			['Tab',           t('scTab',      'Move to next focusable element')],
			['Shift+Tab',     t('scShiftTab', 'Move to previous element')],
			['Enter / Space', t('scEnter',    'Activate button or link')],
			['Escape',        t('scEscape',   'Close dialog or overlay')],
			['Arrow keys',    t('scArrow',    'Navigate within menus and groups')],
			['H (NVDA/JAWS)', t('scH',        'Jump to next heading')],
			['F (NVDA/JAWS)', t('scF',        'Jump to next form field')],
			['L (NVDA/JAWS)', t('scL',        'Jump to next list')],
			['T (NVDA/JAWS)', t('scT',        'Jump to next table')],
			['Ctrl+Alt+Arrow', t('scCtrlAlt', 'Navigate table cells (NVDA)')],
		];
		return `<table class="cwas-shortcuts-table">
			${rows.map(([k, d]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(d)}</td></tr>`).join('')}
		</table>`;
	}

	function buildBrandCreditHTML() {
		const tpl  = t('brandCredit', 'The accessibility system on this site was developed by %s');
		const name = t('brandName', 'Clear Web');
		const parts = tpl.split('%s');
		if (parts.length !== 2) {
			return esc(tpl);
		}
		return `${esc(parts[0])}<span class="cwas-brand-name">${esc(name)}</span>${esc(parts[1])}`;
	}

	function buildBrandBarHTML() {
		if (!brandLogoUrl || !brandUrl) return '';
		const label = t('visitBrand', 'Visit Clear Web (opens in a new tab)');
		return `<div class="cwas-brand-bar">
			<a href="${esc(brandUrl)}" class="cwas-brand-link" target="_blank" rel="noopener"
				aria-label="${esc(label)}">
				<span class="cwas-brand-line">${buildBrandCreditHTML()}</span>
				<img class="cwas-brand-logo" src="${esc(brandLogoUrl)}" alt="" aria-hidden="true" loading="lazy" decoding="async">
			</a>
		</div>`;
	}

	function buildPanel() {
		const stmt    = stmtUrl
			? `<a href="${esc(stmtUrl)}" class="cwas-footer-link" target="_blank" rel="noopener">${esc(t('accessibilityStatement', 'Accessibility statement'))}</a>` : '';
		const help    = helpUrl
			? `<a href="${esc(helpUrl)}" class="cwas-footer-link" target="_blank" rel="noopener">${esc(t('accessibilityHelp', 'Accessibility help'))}</a>` : '';
		const report  = enableReport
			? `<button type="button" class="cwas-footer-btn" data-a11y-action="openReport">${esc(t('reportProblem', 'Report a problem'))}</button>` : '';

		return `<div class="cwas-panel-inner">
			<div class="cwas-panel-header">
				<h2 id="cwas-panel-title" class="cwas-panel-title">${esc(t('panelTitle', 'Accessibility settings'))}</h2>
				<div class="cwas-panel-header-tools">
					<label class="cwas-color-swatch" title="${esc(t('highlightColor', 'Highlight color'))}">
						<span class="cwas-sr-only">${esc(t('highlightColor', 'Highlight color'))}</span>
						<input type="color" class="cwas-color-pick" value="${esc(state.customColor || primaryColor)}"
							aria-label="${esc(t('highlightColor', 'Highlight color'))}">
					</label>
					<button type="button" class="cwas-close-btn" aria-label="${esc(t('closeMenu', 'Close'))}">
						<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor"
							stroke-width="2.5" stroke-linecap="round" aria-hidden="true" focusable="false">
							<line x1="2" y1="2" x2="16" y2="16"/><line x1="16" y1="2" x2="2" y2="16"/>
						</svg>
					</button>
				</div>
			</div>

			<div class="cwas-panel-scroll">
				<div class="cwas-panel-toolbar">
					${buildEssentialAidsHTML()}
					<div id="cwas-panel-status" class="cwas-panel-status" role="status" aria-live="polite" aria-atomic="true"></div>
					<div class="cwas-presets-wrap">
						<p class="cwas-presets-label">${esc(t('quickStart', 'Quick start'))}</p>
						<div class="cwas-presets">${buildPresetsHTML()}</div>
					</div>
					<div class="cwas-active-wrap" aria-label="${esc(t('activeSettings', 'Active settings'))}">
						<div class="cwas-active-chips">${buildActiveChipsHTML()}</div>
					</div>
				</div>

				<div class="cwas-panel-body">
					<div class="cwas-panel-sections">
						${buildPanelSections()}
					</div>
				</div>
			</div>

			<div class="cwas-panel-footer">
				<div class="cwas-panel-footer-actions">
					${stmt}${help}${report}
					<button type="button" class="cwas-reset-btn" data-a11y-action="reset">
						${esc(t('resetAccessibility', 'Reset'))}
					</button>
				</div>
				${buildBrandBarHTML()}
			</div>
		</div>`;
	}

	/* ─── Report modal ─────────────────────────────────────────────────────────── */
	let reportModal = null;

	function buildReportModal() {
		if (reportModal) return;
		reportModal = document.createElement('div');
		reportModal.id = 'cwas-report-modal';
		reportModal.setAttribute('role', 'dialog');
		reportModal.setAttribute('aria-modal', 'true');
		reportModal.setAttribute('aria-labelledby', 'cwas-report-title');
		reportModal.hidden = true;
		if (isRtl) reportModal.setAttribute('dir', 'rtl');

		reportModal.innerHTML = `
		<div class="cwas-modal-inner">
			<div class="cwas-modal-header">
				<h2 id="cwas-report-title">${esc(t('reportProblem', 'Report a problem'))}</h2>
				<button type="button" class="cwas-close-btn" id="cwas-report-close"
					aria-label="${esc(t('closeMenu', 'Close'))}">
					<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor"
						stroke-width="2.5" stroke-linecap="round" aria-hidden="true" focusable="false">
						<line x1="2" y1="2" x2="16" y2="16"/><line x1="16" y1="2" x2="2" y2="16"/>
					</svg>
				</button>
			</div>
			<form id="cwas-report-form" class="cwas-report-form" novalidate>
				<div class="cwas-report-honeypot" aria-hidden="true">
					<label for="cwas-report-company-website">${esc(t('reportHoneypotLabel', 'Company website'))}</label>
					<input type="text" id="cwas-report-company-website" name="company_website" tabindex="-1" autocomplete="off">
				</div>
				<label class="cwas-field">
					<span>${esc(t('reportName', 'Your name'))}</span>
					<input type="text" name="reporter_name" autocomplete="name">
				</label>
				<label class="cwas-field">
					<span>${esc(t('reportEmailField', 'Your email'))}</span>
					<input type="email" name="reporter_email" autocomplete="email">
				</label>
				<label class="cwas-field">
					<span>${esc(t('reportUrl', 'Page URL'))}</span>
					<input type="url" name="page_url" value="${esc(window.location.href)}" readonly>
				</label>
				<label class="cwas-field">
					<span>${esc(t('reportCategory', 'Problem category'))} <span aria-hidden="true">*</span></span>
					<select name="category" required>
						<option value="">${esc(t('reportSelectCategory', '— Select —'))}</option>
						<option value="keyboard">${esc(t('catKeyboard', 'Keyboard navigation'))}</option>
						<option value="screen_reader">${esc(t('catScreenReader', 'Screen reader'))}</option>
						<option value="contrast">${esc(t('catContrast', 'Color or contrast'))}</option>
						<option value="text">${esc(t('catText', 'Text or font'))}</option>
						<option value="images">${esc(t('catImages', 'Images or media'))}</option>
						<option value="forms">${esc(t('catForms', 'Forms'))}</option>
						<option value="other">${esc(t('catOther', 'Other'))}</option>
					</select>
				</label>
				<label class="cwas-field">
					<span>${esc(t('reportDescription', 'Description'))} <span aria-hidden="true">*</span></span>
					<textarea name="description" rows="4" required></textarea>
				</label>
				<div class="cwas-report-actions">
					<button type="submit" class="cwas-submit-btn">${esc(t('reportSubmit', 'Submit report'))}</button>
				</div>
				<div id="cwas-report-feedback" class="cwas-report-feedback" role="status" aria-live="polite"></div>
			</form>
		</div>`;

		document.body.appendChild(reportModal);
		document.getElementById('cwas-report-close').addEventListener('click', closeReport);
		document.getElementById('cwas-report-form').addEventListener('submit', submitReport);
		reportModal.addEventListener('keydown', e => { if (e.key === 'Escape') closeReport(); });
	}

	function openReport() {
		buildReportModal();
		reportModal.hidden = false;
		setTimeout(() => reportModal.querySelector('input, select, textarea, button')?.focus(), 50);
	}

	function closeReport() {
		if (reportModal) reportModal.hidden = true;
		document.getElementById('cwas-a11y-trigger')?.focus();
	}

	function submitReport(e) {
		e.preventDefault();
		const form      = e.target;
		const feedback  = document.getElementById('cwas-report-feedback');
		const category  = form.querySelector('[name="category"]').value;
		const desc      = form.querySelector('[name="description"]').value;

		if (!category || desc.trim().length < 10) {
			feedback.textContent = t('reportValidation', 'Please fill in all required fields.');
			return;
		}

		const btn  = form.querySelector('[type="submit"]');
		btn.disabled = true;
		feedback.textContent = t('reportSending', 'Sending\u2026');

		fetch(restUrl + '/report', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
			body: JSON.stringify({
				reporter_name:  form.querySelector('[name="reporter_name"]').value,
				reporter_email: form.querySelector('[name="reporter_email"]').value,
				page_url:       form.querySelector('[name="page_url"]').value,
				company_website: form.querySelector('[name="company_website"]')?.value || '',
				category,
				description: desc,
			}),
		})
			.then(async (r) => {
				const data = await r.json();
				return { status: r.status, data };
			})
			.then(({ status, data }) => {
				if (status === 429) {
					feedback.textContent = data.message || t('reportRateLimited', 'Too many reports. Please try again later.');
					btn.disabled = false;
					return;
				}
				feedback.textContent = data.message || (data.ok
					? t('reportSuccess', 'Report submitted. Thank you!')
					: t('reportError', 'Could not send the report. Please try again.'));
				btn.disabled = false;
				if (data.ok) form.reset();
			})
			.catch(() => {
				feedback.textContent = t('reportError', 'Could not send the report. Please try again.');
				btn.disabled = false;
			});
	}

	/* ─── Button sync ──────────────────────────────────────────────────────────── */
	function syncBtn(btn, active) {
		if (btn.getAttribute('role') === 'switch') {
			btn.setAttribute('aria-checked', String(active));
		} else {
			btn.setAttribute('aria-pressed', String(active));
		}
		btn.classList.toggle('is-active', active);
	}

	function syncAllButtons() {
		const panel = document.getElementById('cwas-a11y-panel');
		if (!panel) return;

		reconcileActivePreset();

		panel.querySelectorAll('[data-a11y-toggle]').forEach(btn => {
			syncBtn(btn, Boolean(state[btn.dataset.a11yToggle]));
		});

		['contrast', 'saturation', 'cvd'].forEach(group => {
			panel.querySelectorAll(`[data-a11y-mode="${group}"]`).forEach(btn => {
				syncBtn(btn, state[group + 'Mode'] === btn.dataset.value);
			});
		});

		['fontScale', 'lineHeight', 'letterSpacing', 'wordSpacing'].forEach((key) => {
			const row = panel.querySelector(`[data-a11y-qty="${key}"]`);
			if (!row) return;
			const valEl = row.querySelector('.cwas-qty-value');
			if (valEl) valEl.textContent = stepDisplayValue(key);
			row.classList.toggle('is-adjusted', stepIsAdjusted(key));
			const downBtn = row.querySelector('[data-a11y-step-dir="down"]');
			const upBtn   = row.querySelector('[data-a11y-step-dir="up"]');
			if (downBtn) downBtn.disabled = isStepMin(key);
			if (upBtn) upBtn.disabled = isStepMax(key);
		});

		panel.querySelectorAll('[data-a11y-preset]').forEach((btn) => {
			syncBtn(btn, presetShowsActive(btn.dataset.a11yPreset));
		});

		syncStopSpeakingBtn();
		refreshActiveChips();
	}

	/* ─── Panel open / close ───────────────────────────────────────────────────── */
	let panelEl, triggerEl, triggerAnchor;
	const TRIGGER_PX = 33;
	const SVG_NS     = 'http://www.w3.org/2000/svg';

	function prefixSvgIds(svg, prefix) {
		const idMap = new Map();
		svg.querySelectorAll('[id]').forEach((node) => {
			idMap.set(node.getAttribute('id'), prefix + node.getAttribute('id'));
		});
		svg.querySelectorAll('[id]').forEach((node) => {
			node.id = idMap.get(node.getAttribute('id'));
		});
		svg.querySelectorAll('*').forEach((node) => {
			Array.from(node.attributes).forEach((attr) => {
				if (!attr.value.includes('url(#')) return;
				node.setAttribute(
					attr.name,
					attr.value.replace(/url\(#([^)]+)\)/g, (match, id) => {
						const next = idMap.get(id);
						return next ? `url(#${next})` : match;
					})
				);
			});
		});
	}

	function configureTriggerSvg(svg) {
		svg.id = 'cwas-a11y-trigger';
		svg.setAttribute('class', 'cwas-a11y-trigger');
		svg.setAttribute('role', 'button');
		svg.setAttribute('tabindex', '0');
		svg.setAttribute('width', String(TRIGGER_PX));
		svg.setAttribute('height', String(TRIGGER_PX));
		svg.setAttribute('aria-expanded', 'false');
		svg.setAttribute('aria-controls', 'cwas-a11y-panel');
		svg.setAttribute('aria-label', t('openMenu', 'Open accessibility menu'));
		if (isRtl) svg.setAttribute('dir', 'rtl');
	}

	function createFallbackTriggerSvg() {
		const svg = document.createElementNS(SVG_NS, 'svg');
		svg.setAttribute('viewBox', '0 0 24 24');
		svg.setAttribute('fill', 'currentColor');
		const circle = document.createElementNS(SVG_NS, 'circle');
		circle.setAttribute('cx', '12');
		circle.setAttribute('cy', '4.5');
		circle.setAttribute('r', '1.8');
		const path = document.createElementNS(SVG_NS, 'path');
		path.setAttribute('d', 'M19.5 7.5l-7.5 1.5-7.5-1.5-.5 2 5 1 .5 9 2-5h1l2 5 .5-9 5-1z');
		svg.appendChild(circle);
		svg.appendChild(path);
		configureTriggerSvg(svg);
		return svg;
	}

	async function loadTriggerSvg() {
		if (triggerMarkUrl) {
			try {
				const res = await fetch(triggerMarkUrl);
				if (!res.ok) throw new Error('mark fetch failed');
				const text = await res.text();
				const doc  = new DOMParser().parseFromString(text, 'image/svg+xml');
				if (doc.querySelector('parsererror')) throw new Error('mark parse failed');
				const svg = document.importNode(doc.documentElement, true);
				prefixSvgIds(svg, 'cwas-trigger-');
				configureTriggerSvg(svg);
				return svg;
			} catch (_) {
				/* fall through to vector fallback */
			}
		}
		return createFallbackTriggerSvg();
	}

	function wireTrigger(el) {
		el.addEventListener('click', togglePanel);
		el.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				togglePanel();
			}
		});
	}
	const PANEL_TRANSITION_MS = 300;
	let panelCloseTimer       = null;

	function prefersReducedMotion() {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	function isPanelOpen() {
		return panelEl && panelEl.classList.contains('is-open');
	}

	function setPanelInert(inert) {
		if ('inert' in panelEl) {
			panelEl.inert = inert;
		}
	}

	function openPanel() {
		if (!panelEl) return;
		if (panelCloseTimer) {
			clearTimeout(panelCloseTimer);
			panelCloseTimer = null;
		}
		panelEl.hidden = false;
		panelEl.setAttribute('aria-hidden', 'false');
		setPanelInert(false);
		triggerEl.setAttribute('aria-expanded', 'true');
		triggerEl.setAttribute('aria-label', t('closeMenu', 'Close accessibility menu'));
		/* Refresh dynamic sections */
		const lmList = panelEl.querySelector('.cwas-landmarks-list');
		if (lmList) lmList.innerHTML = buildLandmarksHTML();
		refreshActiveChips();
		requestAnimationFrame(() => {
			requestAnimationFrame(() => panelEl.classList.add('is-open'));
		});
		setTimeout(() => panelEl.querySelector('.cwas-close-btn')?.focus(), 50);
	}

	function finishClosePanel() {
		panelEl.classList.remove('is-open');
		panelEl.hidden = true;
		panelEl.setAttribute('aria-hidden', 'true');
		setPanelInert(true);
		triggerEl.setAttribute('aria-expanded', 'false');
		triggerEl.setAttribute('aria-label', t('openMenu', 'Open accessibility menu'));
		triggerEl.focus();
	}

	function closePanel() {
		if (!panelEl || panelEl.hidden) return;
		if (!isPanelOpen()) {
			finishClosePanel();
			return;
		}
		panelEl.classList.remove('is-open');
		triggerEl.setAttribute('aria-expanded', 'false');
		triggerEl.setAttribute('aria-label', t('openMenu', 'Open accessibility menu'));

		if (prefersReducedMotion()) {
			finishClosePanel();
			return;
		}

		let finished = false;
		const done = () => {
			if (finished) return;
			finished = true;
			if (panelCloseTimer) {
				clearTimeout(panelCloseTimer);
				panelCloseTimer = null;
			}
			panelEl.removeEventListener('transitionend', onTransitionEnd);
			finishClosePanel();
		};
		const onTransitionEnd = (e) => {
			if (e.target !== panelEl || e.propertyName !== 'transform') return;
			done();
		};
		panelEl.addEventListener('transitionend', onTransitionEnd);
		panelCloseTimer = setTimeout(done, PANEL_TRANSITION_MS);
	}

	/** True when click originated inside the widget (uses composedPath so detached chip nodes still count). */
	function isWidgetClick(e) {
		const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
		if (path.length) {
			return path.some((node) => node === panelEl || node === triggerEl);
		}
		const t = e.target;
		return Boolean(t && (panelEl.contains(t) || triggerEl.contains(t)));
	}

	function togglePanel() {
		isPanelOpen() ? closePanel() : openPanel();
	}

	/* ─── Panel event dispatcher ───────────────────────────────────────────────── */
	function blurTouchButton(btn) {
		if (!btn || !window.matchMedia('(hover: none)').matches) return;
		requestAnimationFrame(() => btn.blur());
	}

	function onPanelClick(e) {
		const touchBtn = e.target.closest('#cwas-a11y-panel button');
		try {
		const presetBtn = e.target.closest('[data-a11y-preset]');
		if (presetBtn) {
			applyPreset(presetBtn.dataset.a11yPreset);
			return;
		}

		const chipBtn = e.target.closest('[data-chip-clear]');
		if (chipBtn) {
			clearChip(chipBtn.dataset.chipClear);
			e.stopPropagation();
			return;
		}

		/* Toggle */
		const tog = e.target.closest('[data-a11y-toggle]');
		if (tog) {
			const key = tog.dataset.a11yToggle;
			if (key in state) {
				const next = !state[key];
				if (key === 'tts' && next && !ttsSupported()) {
					announcePanelStatus(t('ttsUnsupported', 'Text-to-speech is not supported in this browser.'));
					return;
				}
				if (key === 'tts' && !next) {
					stopTts(true);
					state.tts = false;
					trackToggle(key);
					applyAll();
					saveState();
					syncAllButtons();
					announceTtsState(false);
					return;
				}
				state[key] = next;
				trackToggle(key);
				applyAll();
				saveState();
				syncAllButtons();
				if (key === 'tts') {
					announceTtsState(state.tts);
				} else if (ESSENTIAL_AIDS.some((a) => a.key === key)) {
					announcePanelStatus(essentialToggleMessage(key, state[key]));
				}
			}
			return;
		}

		/* Mode (mutually exclusive group) */
		const mod = e.target.closest('[data-a11y-mode]');
		if (mod) {
			const group    = mod.dataset.a11yMode;
			const value    = mod.dataset.value;
			const stateKey = group + 'Mode';
			state[stateKey] = state[stateKey] === value ? null : value;
			trackToggle(group + '_' + value);
			applyAll();
			saveState();
			syncAllButtons();
			return;
		}

		/* Step (quantity selectors) */
		const stp = e.target.closest('[data-a11y-step]');
		if (stp) {
			if (stp.disabled) return;
			const key = stp.dataset.a11yStep;
			const dir = stp.dataset.a11yStepDir || 'up';
			const idx = stepIndex(key);
			if (key === 'fontScale') {
				const next = dir === 'down' ? idx - 1 : idx + 1;
				state.fontScale = FONT_SCALE_LEVELS[Math.max(0, Math.min(FONT_SCALE_LEVELS.length - 1, next))];
			} else if (key === 'lineHeight' || key === 'letterSpacing' || key === 'wordSpacing') {
				const max = stepLevels(key).length - 1;
				const next = dir === 'down' ? idx - 1 : idx + 1;
				state[key] = Math.max(0, Math.min(max, next));
			}
			trackToggle(key + (dir === 'down' ? '_down' : '_up'));
			applyAll();
			saveState();
			syncAllButtons();
			return;
		}

		/* Actions */
		const act = e.target.closest('[data-a11y-action]');
		if (act) {
			const action = act.dataset.a11yAction;
			if (action === 'reset') {
				state = Object.assign({}, DEFAULTS);
				applyAll();
				saveState();
				syncAllButtons();
				const pick = panelEl.querySelector('.cwas-color-pick');
				if (pick) pick.value = primaryColor;
			}
			if (action === 'saveProfile') saveProfile();
			if (action === 'openReport')  openReport();
			if (action === 'stopTts') {
				stopTts();
				announcePanelStatus(t('stoppedSpeaking', 'Stopped speaking'));
			}
			return;
		}

		/* Profile load */
		const pLoad = e.target.closest('.cwas-profile-load');
		if (pLoad) { loadProfile(pLoad.dataset.profile); return; }

		/* Profile delete */
		const pDel  = e.target.closest('.cwas-profile-del');
		if (pDel) { deleteProfile(pDel.dataset.profile); return; }

		/* Landmark jump — close panel after navigation */
		if (e.target.closest('[data-close-panel]')) closePanel();
		} finally {
			blurTouchButton(touchBtn);
		}
	}

	/* ─── Init ─────────────────────────────────────────────────────────────────── */
	async function init() {
		const mount = document.getElementById('cwas-a11y-widget');
		if (!mount) return;

		ensurePageFilterRoot();

		document.documentElement.style.setProperty('--cwas-primary', state.customColor || primaryColor);
		mount.style.setProperty('--cwas-trigger-top', triggerTop + '%');
		mount.style.setProperty('--cwas-trigger-top-mobile', triggerTopMobile + '%');

		/* Panel */
		panelEl = document.createElement('div');
		panelEl.id         = 'cwas-a11y-panel';
		panelEl.className  = 'cwas-a11y-panel cwas-pos-' + position + ' cwas-theme-' + theme;
		panelEl.setAttribute('role', 'dialog');
		panelEl.setAttribute('aria-modal', 'false');
		panelEl.setAttribute('aria-labelledby', 'cwas-panel-title');
		panelEl.hidden = true;
		panelEl.setAttribute('aria-hidden', 'true');
		setPanelInert(true);
		if (isRtl) panelEl.setAttribute('dir', 'rtl');
		panelEl.innerHTML = buildPanel();

		/* Trigger: inline SVG is the interactive control (not a wrapper button). */
		triggerAnchor = document.createElement('div');
		triggerAnchor.className = 'cwas-trigger-anchor cwas-pos-' + position;
		triggerEl = await loadTriggerSvg();
		triggerAnchor.appendChild(triggerEl);

		mount.appendChild(triggerAnchor);
		mount.appendChild(panelEl);

		/* ── Wire events ── */
		wireTrigger(triggerEl);
		panelEl.querySelector('.cwas-close-btn').addEventListener('click', closePanel);
		panelEl.addEventListener('click', onPanelClick);

		/* Color picker */
		panelEl.querySelector('.cwas-color-pick')?.addEventListener('input', e => {
			state.customColor = e.target.value;
			document.documentElement.style.setProperty('--cwas-primary', e.target.value);
			saveState();
			refreshActiveChips();
		});

		warmTtsVoices();
		/* Screen reader mode – read focused or clicked page content. */
		document.addEventListener('click', onTtsClick, true);
		document.addEventListener('focusin', onTtsFocusIn, true);

		/* Reading content hover */
		const READING_SEL = 'p, li, blockquote, h1, h2, h3, h4, h5, h6, article, section';
		document.addEventListener('mouseover', e => {
			if (!state.readingContent) return;
			document.querySelectorAll('.a11y-reading-active').forEach(n => n.classList.remove('a11y-reading-active'));
			const el = e.target.closest(READING_SEL);
			if (el && !mount.contains(el)) el.classList.add('a11y-reading-active');
		});

		/* Highlight click (page only — never widget controls) */
		document.addEventListener('click', e => {
			if (!state.highlightClick || !e.target) return;
			if (e.target.closest('#cwas-a11y-trigger')) return;
			if (isWidgetUiNode(e.target)) return;
			const el = e.target.closest('button, a, input, select, textarea, summary, [tabindex]') || e.target;
			el.classList.add('a11y-clicked');
			setTimeout(() => el.classList.remove('a11y-clicked'), 700);
		}, true);

		/* Keyboard */
		document.addEventListener('keydown', e => {
			if (e.key === 'Escape') {
				if (reportModal && !reportModal.hidden) { closeReport(); return; }
				if (isPanelOpen()) closePanel();
			}
		});

		/* Click outside */
		document.addEventListener('click', e => {
			if (!isPanelOpen()) return;
			if (!isWidgetClick(e)) closePanel();
		});

		/* Apply saved state */
		applyAll();
		syncAllButtons();
	}

	/* ─── Boot ─────────────────────────────────────────────────────────────────── */
	function boot() {
		loadState();
		warmTtsVoices();
		/* Re-apply saved prefs immediately so refresh/navigation does not flash defaults. */
		if (document.documentElement) {
			applyAll();
		}
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', init);
		} else {
			init();
		}
	}

	boot();

	if (rememberPrefs) {
		window.addEventListener('pagehide', saveState);
	}
})();
