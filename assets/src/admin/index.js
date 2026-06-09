import { createRoot, useState, useEffect } from '@wordpress/element';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Notice,
    SelectControl,
    RangeControl,
    Spinner,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { fetchSettings, saveSettings } from './api/client';
import './styles.scss';

const i18n = window.CWAS_ADMIN?.i18n ?? {};
const remediationsUrl = window.CWAS_ADMIN?.remediationsUrl ?? 'https://clearweb.co.il';

apiFetch.use(apiFetch.createNonceMiddleware(window.CWAS_ADMIN?.nonce));
apiFetch.use(apiFetch.createRootURLMiddleware(window.CWAS_ADMIN?.restUrl?.replace('/cwas/v1', '/')));

function clampTopPercent(value, fallback = 50) {
    const num = Number(value);
    return Number.isFinite(num) ? Math.max(0, Math.min(100, num)) : fallback;
}

function VerticalPositionControl({ label, value, onChange }) {
    const positionLabel = (i18n.widgetVerticalOffsetPercent ?? '%d%%').replace('%d', String(value));

    return (
        <RangeControl
            label={label}
            help={i18n.widgetVerticalOffsetHelp ?? ''}
            value={value}
            onChange={onChange}
            min={0}
            max={100}
            step={1}
            allowReset
            resetFallbackValue={50}
            initialPosition={50}
            currentInputValue={positionLabel}
        />
    );
}

function App() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState(null);
    const [allSettings, setAllSettings] = useState({});
    const [position, setPosition] = useState('right');
    const [verticalDesktop, setVerticalDesktop] = useState(50);
    const [verticalMobile, setVerticalMobile] = useState(50);

    useEffect(() => {
        let cancelled = false;

        fetchSettings()
            .then((data) => {
                if (cancelled) {
                    return;
                }
                const settings = data?.settings ?? {};
                const desktop = clampTopPercent(settings.widget_vertical_position, 50);
                const mobile = clampTopPercent(
                    settings.widget_vertical_position_mobile,
                    desktop
                );
                setAllSettings(settings);
                setPosition(settings.widget_position === 'left' ? 'left' : 'right');
                setVerticalDesktop(desktop);
                setVerticalMobile(mobile);
            })
            .catch(() => {
                if (!cancelled) {
                    setNotice({ status: 'error', message: i18n.settingsSaveError ?? 'Could not load settings.' });
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const onSave = async () => {
        setSaving(true);
        setNotice(null);

        try {
            await saveSettings({
                ...allSettings,
                widget_position: position,
                widget_vertical_position: verticalDesktop,
                widget_vertical_position_mobile: verticalMobile,
            });
            setAllSettings((prev) => ({
                ...prev,
                widget_position: position,
                widget_vertical_position: verticalDesktop,
                widget_vertical_position_mobile: verticalMobile,
            }));
            setNotice({ status: 'success', message: i18n.settingsSaved ?? 'Settings saved.' });
        } catch {
            setNotice({ status: 'error', message: i18n.settingsSaveError ?? 'Could not save settings.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={`cwas-admin${window.CWAS_ADMIN?.isRtl ? ' cwas-admin--rtl' : ''}`} dir={window.CWAS_ADMIN?.isRtl ? 'rtl' : undefined}>
            <h1>{i18n.title ?? 'Clearweb Accessibility Add-on'}</h1>
            <Notice status="warning" isDismissible={false}>
                {i18n.notice ?? ''}
            </Notice>
            <div className="cwas-admin-cta">
                <p className="cwas-admin-cta__text">
                    {i18n.remediationsCta ?? 'Need help fixing accessibility issues on your site? Clear Web offers audits, WCAG remediations, and ongoing support.'}
                </p>
                <a
                    className="cwas-admin-cta__link"
                    href={remediationsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={i18n.remediationsCtaLinkAria ?? 'Contact Clear Web for accessibility remediations (opens in a new tab)'}
                >
                    {i18n.remediationsCtaLink ?? 'Contact Clear Web'}
                </a>
            </div>
            {loading ? (
                <Card>
                    <CardBody className="cwas-settings-loading">
                        <Spinner />
                        <span>{i18n.loadingSettings ?? 'Loading settings…'}</span>
                    </CardBody>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <strong>{i18n.widgetSettingsTitle ?? 'Widget appearance'}</strong>
                    </CardHeader>
                    <CardBody>
                        {notice && (
                            <Notice status={notice.status} isDismissible={false} onRemove={() => setNotice(null)}>
                                {notice.message}
                            </Notice>
                        )}
                        <p className="cwas-settings-intro">{i18n.widgetSettingsIntro ?? ''}</p>
                        <div className="cwas-settings-form">
                            <SelectControl
                                label={i18n.widgetPosition ?? 'Horizontal position'}
                                help={i18n.widgetPositionHelp ?? ''}
                                value={position}
                                options={[
                                    { label: i18n.widgetPositionLeft ?? 'Left edge', value: 'left' },
                                    { label: i18n.widgetPositionRight ?? 'Right edge', value: 'right' },
                                ]}
                                onChange={setPosition}
                            />
                            <VerticalPositionControl
                                label={i18n.widgetVerticalDesktop ?? 'Vertical position (desktop)'}
                                value={verticalDesktop}
                                onChange={setVerticalDesktop}
                            />
                            <VerticalPositionControl
                                label={i18n.widgetVerticalMobile ?? 'Vertical position (mobile)'}
                                value={verticalMobile}
                                onChange={setVerticalMobile}
                            />
                        </div>
                        <div className="cwas-settings-actions">
                            <Button variant="primary" onClick={onSave} isBusy={saving} disabled={saving}>
                                {saving ? (i18n.savingSettings ?? 'Saving…') : (i18n.saveSettings ?? 'Save settings')}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}

const root = createRoot(document.getElementById('cwas-admin-app'));
root.render(<App />);
