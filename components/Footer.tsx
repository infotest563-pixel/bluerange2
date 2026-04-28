import Link from 'next/link';
import { getMenu, getSettings } from '../lib/wp';

const WP_HOST = 'https://dev-bluerange.pantheonsite.io';

export default async function Footer({ lang = 'sv' }: { lang?: string }) {
    const settings = await getSettings(lang);
    const options = settings?.options || {};
    const formHtml = settings?.footer_form_html || '';

    const serviceSlug = lang === 'sv' ? 'our-services-se' : 'our-services';
    const aboutSlug = lang === 'sv' ? 'about-se' : 'about';
    const insightSlug = lang === 'sv' ? 'insight-se' : 'insight';

    const [menuServices, menuAbout, menuInsight] = await Promise.all([
        getMenu(serviceSlug, lang).catch(() => null),
        getMenu(aboutSlug, lang).catch(() => null),
        getMenu(insightSlug, lang).catch(() => null)
    ]);

    const resolveUrl = (url: string) => {
        if (!url) return '#';
        // External links — return as-is
        if (url.startsWith('http') && !url.startsWith(WP_HOST)) return url;
        // Strip WP host
        let path = url.startsWith(WP_HOST) ? (url.replace(WP_HOST, '') || '/') : url;
        // Strip ?page_id= query params
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

    //return (
    return (
        <div suppressHydrationWarning>
            {/* API-driven Contact Form Section */}
            <div className="all-sec-lastform sec-padd">
                <div className="container">
                    <div className="row all-lastform-inner tx-wht">
                        <div className="bl-box col-md-12 all-lstform cu-formbx">
                            <div className="wd-100">
                                {options.title && <h2 className="mb-3">{options.title}</h2>}

                                {/* Dangerously set HTML for shortcode result */}
                                <div dangerouslySetInnerHTML={{ __html: formHtml }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="site-footer" id="colophon">
                <div className="container">
                    <div className="row footer-logo1">
                        <div className="bl-box col-md-12">
                            {options.site_logo && (
                                <div className="wd-100">
                                    <img src={options.site_logo.url} className="img-fluid" alt="" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="row footer-inner1">
                        {/* Services Menu */}
                        <div className="bl-box col-sm-4 col-md-3 col-lg-3 ftr-menu tx-wht">
                            <div className="wd-100 foot-menu">
                                <h5 className="ft-title">{settings?.options?.our_services_title}</h5>
                                <ul>
                                    {Array.isArray(menuServices) && menuServices.map((item: any) => (
                                        <li key={item.id}>
                                            <Link href={resolveUrl(item.url)}>{item.title}</Link>
                                            {item.children && item.children.length > 0 && (
                                                <ul>
                                                    {item.children.map((child: any) => (
                                                        <li key={child.id}>
                                                            <Link href={resolveUrl(child.url)}>{child.title}</Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-3 ftr-menu tx-wht">
                            <div className="wd-100 foot-menu">
                                <h5 className="ft-title">{settings?.options?.about_title}</h5>
                                <ul>
                                    {Array.isArray(menuAbout) && menuAbout.map((item: any) => (
                                        <li key={item.id}>
                                            <Link href={resolveUrl(item.url)}>{item.title}</Link>
                                            {item.children && item.children.length > 0 && (
                                                <ul>
                                                    {item.children.map((child: any) => (
                                                        <li key={child.id}>
                                                            <Link href={resolveUrl(child.url)}>{child.title}</Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-3 ftr-menu tx-wht">
                            <div className="wd-100 foot-menu">
                                <h5 className="ft-title">{settings?.options?.insight_title}</h5>
                                <ul>
                                    {Array.isArray(menuInsight) && menuInsight.map((item: any) => (
                                        <li key={item.id}>
                                            <Link href={resolveUrl(item.url)}>{item.title}</Link>
                                            {item.children && item.children.length > 0 && (
                                                <ul>
                                                    {item.children.map((child: any) => (
                                                        <li key={child.id}>
                                                            <Link href={resolveUrl(child.url)}>{child.title}</Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Social */}
                        <div className="bl-box col-sm-4 col-md-3 col-lg-3 ftr-social tx-wht">
                            <div className="wd-100">
                                {options.socail_links_title && <h5 className="ft-title">{options.socail_links_title}</h5>}
                                <ul>
                                    {options.social_media_links?.map((row: any, i: number) => {
                                        const link = row.social_links;
                                        const img = row.socail_media_images;
                                        if (!link) return null;
                                        return (
                                            <li key={i}>
                                                <a href={link.url} target={link.target || '_self'}>
                                                    {img && <img src={img.url} className="img-fluid" alt="" />}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                                {options.uc_image && <div><img src={options.uc_image.url} className="img-fluid" alt="" /></div>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Slider (Static Logos) */}
                <div className="container-fluid footer-part2">
                    <div className="row footer-inner2 d-flex align-items-center">
                        {options.images_slider?.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-md-4 col-sm-6 d-flex justify-content-center">
                                <div className="wd-100 blue-image text-center">
                                    <img src={row.image_slide.url} className="img-fluid" alt="g" style={{ maxHeight: '60px', width: 'auto' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="container">
                    <div className="row footer-bottom">
                        <div className="bl-box col-lg-12 col-xl-6 tx-wht ftr-copyrgt">
                            <div className="wd-100 tx-16">
                                {options.copyright_title && <p>{options.copyright_title} {new Date().getFullYear()}</p>}
                                <p>
                                    {options.copyright_content}
                                    {options.cookies_link && (
                                        <a href={options.cookies_link.url} target={options.cookies_link.target || '_blank'}>
                                            {options.cookies_link.title}
                                        </a>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="bl-box col-lg-12 col-xl-6 tx-wht ftr-botom-menu">
                            <div className="wd-100">
                                <ul>
                                    {options.policies?.map((row: any, i: number) => {
                                        const link = row.policy_links;
                                        if (!link) return null;
                                        return <li key={i}><a href={link.url} target={link.target}>{link.title}</a></li>
                                    })}
                                </ul>
                                <ul>
                                    {options.contact_details?.map((row: any, i: number) => {
                                        const link = row.contact_link;
                                        const icon = row.contact_icon;
                                        if (!link) return null;
                                        return (
                                            <li key={i}>
                                                <a href={link.url}>
                                                    {icon && <img src={icon.url} className="img-fluid" alt="" />}
                                                    <span>{row.contact_name}</span>
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
