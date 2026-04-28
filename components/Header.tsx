import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher';
import DeskSidebar from './DeskSidebar';
import { getMenu, getSite, getSettings } from '../lib/wp';
import { wpImgUrl } from '../lib/localImage';

const WP_HOST = 'https://dev-bluerange.pantheonsite.io';

export default async function Header({ lang = 'sv' }: { lang?: string }) {
    const siteData = await getSite(lang);
    const settings = await getSettings(lang);
    let menuItems = await getMenu('primary', lang);

    let logoUrl: string | null = null;

    if (!logoUrl && settings?.custom_logo_url) {
        logoUrl = settings.custom_logo_url;
    }

    if (!logoUrl && siteData?.logo) {
        const potentialLogo = typeof siteData.logo === 'string' ? siteData.logo : siteData.logo.url;
        if (potentialLogo && !potentialLogo.startsWith('data:image')) {
            logoUrl = potentialLogo;
        }
    }

    if (!menuItems || menuItems.length === 0) {
        menuItems = await getMenu('primary-menu', lang);
    }
    if (!menuItems || menuItems.length === 0) {
        menuItems = await getMenu('main-menu', lang);
    }

    const resolveUrl = (url: string) => {
        if (!url) return '#';
        // External links — return as-is
        if (url.startsWith('http') && !url.startsWith(WP_HOST)) return url;
        // Strip WP host
        let path = url.startsWith(WP_HOST) ? (url.replace(WP_HOST, '') || '/') : url;
        // Strip ?page_id= query params — these are WordPress homepage aliases, map to language root
        if (path.includes('?page_id=')) {
            path = path.startsWith('/en') ? '/en' : '/sv';
        }
        // Already has language prefix
        if (path.startsWith('/en/') || path.startsWith('/sv/') || path === '/en' || path === '/sv') return path;
        // Hash or mailto or tel — return as-is
        if (path.startsWith('#') || path.startsWith('mailto:') || path.startsWith('tel:')) return path;
        // Add language prefix
        return `/${lang}${path.startsWith('/') ? path : '/' + path}`;
    };

    const filteredItems = Array.isArray(menuItems)
        ? menuItems.filter((item: any) => {
            if (item.classes && Array.isArray(item.classes)) {
                return !item.classes.includes('pll-parent-menu-item');
            }
            return true;
        })
        : [];

    const sidebarItems = filteredItems.map((item: any) => ({
        title: item.title,
        url: resolveUrl(item.url),
        children: item.children?.map((child: any) => ({
            title: child.title,
            url: resolveUrl(child.url),
        })),
    }));

    return (
        <div suppressHydrationWarning>
            {/* Top bar */}
            <div className="top-header">
                <div className="container">
                    <div className="row">
                        <div className="col col-12">
                            <div className="wd-100 tophead-ul">
                                <ul>
                                    <li>
                                        <a href="tel:036345900">
                                            <img src={wpImgUrl(`${WP_HOST}/wp-content/uploads/2023/09/telephone-fill.svg`)} className="img-fluid" alt="" />
                                            <span>036-34 59 00</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="mailto:Support@bluerange.se">
                                            <img src={wpImgUrl(`${WP_HOST}/wp-content/uploads/2023/09/envelope-fill.svg`)} className="img-fluid" alt="" />
                                            <span>Support@bluerange.se</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <header id="wrapper-navbar">
                <a className="skip-link screen-reader-text sr-only" href="#content">
                    Skip to content
                </a>

                <nav id="main-nav" className="navbar navbar-expand-md navbar-dark bg-primary" aria-labelledby="main-nav-label">
                    <h2 id="main-nav-label" className="screen-reader-text sr-only">
                        Main Navigation
                    </h2>

                    <div className="container">

                        {/* Logo */}
                        <Link href="/" className="navbar-brand custom-logo-link" rel="home">
                            {logoUrl ? (
                                <img
                                    src={wpImgUrl(logoUrl)}
                                    className="custom-logo"
                                    alt={siteData?.name || 'Bluerange'}
                                    width={200}
                                    height={50}
                                    style={{ width: 'auto', height: 'auto', maxHeight: '50px' }}
                                />
                            ) : (
                                <span>{siteData?.name || 'Bluerange'}</span>
                            )}
                        </Link>

                        {/* Desktop nav */}
                        <div className="collapse navbar-collapse" id="navbarNavDropdown">
                            <ul className="navbar-nav ml-auto" id="main-menu">
                                {filteredItems.map((item: any) => {
                                    const hasChildren = item.children && item.children.length > 0;
                                    const liClasses = ['nav-item'];
                                    if (item.classes && Array.isArray(item.classes)) {
                                        liClasses.push(...item.classes);
                                    }
                                    if (hasChildren) liClasses.push('dropdown');

                                    return (
                                        <li key={item.id} className={liClasses.join(' ')}>
                                            <Link
                                                href={resolveUrl(item.url)}
                                                className={`nav-link ${hasChildren ? 'dropdown-toggle' : ''}`}
                                                {...(hasChildren ? {
                                                    'data-toggle': 'dropdown',
                                                    'aria-haspopup': 'true',
                                                    'aria-expanded': 'false',
                                                    'id': `dropdown-target-${item.id}`,
                                                } : {})}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: item.title }} />
                                            </Link>
                                            {hasChildren && (
                                                <div className="dropdown-menu" aria-labelledby={`dropdown-target-${item.id}`}>
                                                    {item.children.map((child: any) => (
                                                        <Link key={child.id} href={resolveUrl(child.url)} className="dropdown-item">
                                                            {child.title}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            </div>

                        {/* Language switcher */}
                        <LanguageSwitcher />

                        {/* Sidebar — hamburger on the RIGHT */}
                        <DeskSidebar menuItems={sidebarItems} />

                    </div>
                </nav>
            </header>
        </div>
    );
}
