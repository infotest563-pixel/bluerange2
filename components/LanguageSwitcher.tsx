'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const languages = [
    { code: 'sv', label: 'Svenska', flag: '/flags/se.png' },
    { code: 'en', label: 'English', flag: '/flags/gb.png' },
];

export default function LanguageSwitcher() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [translatedUrls, setTranslatedUrls] = useState<Record<string, string>>({});
    const router = useRouter();
    const pathname = usePathname();
    const ref = useRef<HTMLDivElement>(null);

    const current = pathname?.startsWith('/en') ? languages[1] : languages[0];

    // Only render after mount to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Fetch translated URLs
    useEffect(() => {
        if (!pathname) return;

        async function fetchTranslations() {
            let currentLang = 'sv';
            let slug = '';

            if (pathname!.startsWith('/sv/')) {
                currentLang = 'sv';
                slug = pathname!.replace('/sv/', '').split('/')[0];
            } else if (pathname!.startsWith('/en/')) {
                currentLang = 'en';
                slug = pathname!.replace('/en/', '').split('/')[0];
            } else {
                setTranslatedUrls({ sv: '/sv', en: '/en' });
                return;
            }

            if (!slug) {
                setTranslatedUrls({ sv: '/sv', en: '/en' });
                return;
            }

            try {
                const res = await fetch(
                    `https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages?slug=${slug}&lang=${currentLang}`
                );
                const data = await res.json();

                if (data?.[0]?.translations) {
                    const page = data[0];
                    const urls: Record<string, string> = { [currentLang]: pathname! };

                    await Promise.all(
                        Object.keys(page.translations).map(async (lang) => {
                            const postId = page.translations[lang];
                            try {
                                const r = await fetch(
                                    `https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages/${postId}?lang=${lang}`
                                );
                                const p = await r.json();
                                if (p?.slug) urls[lang] = `/${lang}/${p.slug}`;
                            } catch { /* ignore */ }
                        })
                    );

                    setTranslatedUrls(urls);
                } else {
                    setTranslatedUrls({ sv: '/sv', en: '/en' });
                }
            } catch {
                setTranslatedUrls({ sv: '/sv', en: '/en' });
            }
        }

        fetchTranslations();
    }, [pathname]);

    const handleSwitch = (code: string) => {
        setOpen(false);
        router.push(translatedUrls[code] || (code === 'en' ? '/en' : '/sv'));
    };

    // Don't render until mounted (avoids hydration mismatch)
    if (!mounted) return null;

    return (
        <div
            ref={ref}
            className="lang-switcher"
            style={{ position: 'relative', marginLeft: '8px', flexShrink: 0 }}
        >
            <button
                onClick={() => setOpen(o => !o)}
                aria-label="Switch language"
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px',
                    lineHeight: 1,
                }}
            >
                <img
                    src={current.flag}
                    alt={current.label}
                    width={16}
                    height={11}
                    style={{ width: '16px', height: '11px', display: 'block', flexShrink: 0 }}
                />
                <span style={{ fontSize: '12px', color: '#3a3a3a', lineHeight: 1 }}>▼</span>
            </button>

            {open && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 9999,
                    minWidth: '140px',
                    marginTop: '4px',
                }}>
                    {languages.map((lang, i) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSwitch(lang.code)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 12px',
                                color: '#333',
                                fontSize: '14px',
                                width: '100%',
                                border: 'none',
                                borderBottom: i < languages.length - 1 ? '1px solid #f0f0f0' : 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                textAlign: 'left',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <img
                                src={lang.flag}
                                alt={lang.label}
                                width={16}
                                height={11}
                                style={{ width: '16px', height: '11px', display: 'block' }}
                            />
                            {lang.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
