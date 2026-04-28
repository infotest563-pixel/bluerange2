const WP_HOST = 'https://dev-bluerange.pantheonsite.io';

// English slug → Swedish slug
const EN_TO_SV: Record<string, string> = {
    'virtual-server':                 'virtuell-server',
    's3-storage':                     's3-lagring',
    'infrastructure-as-a-service':    'infrastruktur-som-en-tjanst',
    'software-hosting-as-a-service':  'programvaruhosting-som-en-tjanst',
    'software-entrepreneurs':         'programvaruentreprenorer',
    'our-partners':                   'vara-partners',
    'web-hotel':                      'webbhotell',
    'web-hosting':                    'webbhotell',
    'domains':                        'domaner',
    'broadband':                      'bredband-se',
    'security-awareness-training':    'sakerhetsmedvetenhetsutbildning',
    'sercurity-awarness-training':    'sakerhetsmedvetenhetsutbildning',
    'public-sector':                  'offentlig-sektor',
    'about-bluerange':                'om-bluerange',
    'about':                          'om-bluerange',
    'career':                         'karriar',
    'kubernetes-as-a-service':        'kubernetes-som-tjanst',
    'contact-us':                     'kontakta-oss',
    'news':                           'nyheter',
    'products':                       'produkter',
    'services':                       'tjanster',
};

// Swedish slug → English slug (reverse map)
const SV_TO_EN: Record<string, string> = Object.fromEntries(
    Object.entries(EN_TO_SV).map(([en, sv]) => [sv, en])
);

/**
 * Translates a slug to the correct language equivalent.
 * e.g. "contact-us" + "sv" → "kontakta-oss"
 *      "kontakta-oss" + "en" → "contact-us"
 */
function translateSlug(slug: string, lang: string): string {
    if (lang === 'sv') return EN_TO_SV[slug] || slug;
    if (lang === 'en') return SV_TO_EN[slug] || slug;
    return slug;
}

/**
 * Converts a WP URL or bare path to a lang-prefixed Next.js path,
 * translating the slug to the correct language.
 *
 * e.g. "/contact-us" + "sv" → "/sv/kontakta-oss"
 *      "/contact-us" + "en" → "/en/contact-us"
 *      "https://dev-bluerange.pantheonsite.io/contact-us" + "sv" → "/sv/kontakta-oss"
 */
export function resolveUrl(url: string, lang: string = 'en'): string {
    if (!url) return '#';

    let path = url;

    // Strip WP host
    if (path.startsWith(WP_HOST)) {
        path = path.replace(WP_HOST, '') || '/';
    }

    // Handle ?page_id= (homepage)
    if (path.includes('?page_id=')) return `/${lang}`;

    // Already has correct lang prefix — return as-is
    if (path.startsWith(`/${lang}/`)) return path;

    // Has the other lang prefix — swap it
    const otherLang = lang === 'en' ? 'sv' : 'en';
    if (path.startsWith(`/${otherLang}/`)) {
        const slug = path.replace(`/${otherLang}/`, '').split('/')[0];
        const translated = translateSlug(slug, lang);
        return `/${lang}/${translated}`;
    }

    // Bare path like /contact-us
    if (path.startsWith('/')) {
        const slug = path.replace(/^\//, '').split('/')[0];
        const translated = translateSlug(slug, lang);
        const rest = path.replace(/^\/[^/]+/, ''); // preserve sub-paths
        return `/${lang}/${translated}${rest}`;
    }

    // External URL (mailto:, tel:, https://other-domain.com)
    return url;
}

/**
 * Detect language from a WP page object.
 */
export function getLang(page: any): string {
    return page.lang
        || (typeof page.link === 'string' && page.link.includes('/sv/') ? 'sv' : 'en');
}
