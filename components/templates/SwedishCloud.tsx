import Link from 'next/link';
import { getMedia, renderShortcode } from '../../lib/wp';

export default async function SwedishCloud({ page }: { page: any }) {
    const acf = page.acf;
    const title = page.title.rendered;

    const resolveImage = async (field: any) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        if (field.url) return field.url;
        if (typeof field === 'number') {
            const media = await getMedia(field).catch(() => null);
            return media?.source_url || '';
        }
        return '';
    };

    const bannerBg = await resolveImage(acf.banner_background_image);
    const rightSideImg = await resolveImage(acf.looking_for_image);

    // Hosting Plans
    const hostingPlans = acf.hosting_plan || [];

    // Tutorials
    const tutorials = await Promise.all((acf.tutorials || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.tutorial_image)
    })));

    // FAQ Shortcode
    const faqShortcodeHtml = acf.faq_shortcode
        ? await renderShortcode(acf.faq_shortcode)
        : '';

    return (
        <div className="swedish-cloud-template">
            {/* Banner */}
            <section className="sc-sec-swedishcld sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container">
                    <div className="row sc-swedishcld-inner sem-baner-inner tx-wht">
                        <div className="bl-box col-sm-12 col-lg-12">
                            <div className="wd-100 text-center">
                                <h1 dangerouslySetInnerHTML={{ __html: title }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Customer Support / Looking For */}
            <section className="sc-sec-crerboxx sec-padd ed_section">
                <div className="container">
                    <div className="row sc-crerboxx-inner sm-boxx-inr2 align-items-center md-revers">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-6">
                            <div className="wd-100">
                                {acf.looking_for_title && <h2>{acf.looking_for_title}</h2>}
                                {acf.looking_for_content && <div dangerouslySetInnerHTML={{ __html: acf.looking_for_content }} />}
                            </div>
                        </div>
                        <div className="bl-box col-sm-12 col-md-12 col-lg-6">
                            {rightSideImg && (
                                <div className="wd-100">
                                    <img src={rightSideImg} className="img-fluid" alt="" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Choose Your Cloud */}
            <section className="sc-sec-chosecld sec-padd ed_section bg-light">
                <div className="container">
                    <div className="row sc-chosecld-inner">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            <div className="wd-100 mx-800 tx-21">
                                {acf.choose_your_cloud_title && <h2>{acf.choose_your_cloud_title}</h2>}
                                {acf.choose_your_cloud_content && <p>{acf.choose_your_cloud_content}</p>}
                            </div>
                        </div>
                    </div>
                    {hostingPlans.length > 0 && (
                        <div className="row sc-chosecld-inner2">
                            {hostingPlans.map((row: any, i: number) => (
                                <div key={i} className="bl-box col-sm-12 col-md-6 col-lg-4">
                                    <div className="wd-100">
                                        <div className="sc-chostosin">
                                            <div className="sc-cldtop">
                                                <h4>{row.cloud_title}<small>{row.cloud_subtitle}</small></h4>
                                            </div>
                                            <div className="sc-clsave">
                                                <span>{row.save_price}</span>
                                                <p>{row.save_percentage}</p>
                                            </div>
                                            <div className="sc-clprice">
                                                <h2><small>₹</small>{row.month_price}<small>/mo</small></h2>
                                                <p>{row.free_month_trial}</p>
                                            </div>
                                            <div className="sc-clcart">
                                                {row.add_to_cart_button && (
                                                    <Link className="btn" href={row.add_to_cart_button.url} role="button">
                                                        Add to cart
                                                    </Link>
                                                )}
                                            </div>
                                            <p>{row.renew_price}</p>
                                        </div>
                                        <div className="sc-topfetures">
                                            <h4>{row.features_title}</h4>
                                            <ul>
                                                {row.feature_list?.map((feature: any, k: number) => (
                                                    <li key={k}><i className={feature.icon_class} aria-hidden="true"></i>{feature.icon_title}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Tutorials */}
            <section className="sc-sec-tutorials sec-padd ed_section">
                <div className="container">
                    <div className="row sc-tutorials-inner">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            <div className="wd-100 mx-800 tx-21">
                                {acf.tutorials_title && <h2>{acf.tutorials_title}</h2>}
                                {acf.tutorials_substitle && <p>{acf.tutorials_substitle}</p>}
                            </div>
                        </div>
                    </div>
                    {tutorials.length > 0 && (
                        <div className="row sc-tutorials-inner2">
                            {tutorials.map((row: any, i: number) => (
                                <div key={i} className="bl-box col-sm-12 col-md-6 col-lg-4">
                                    <div className="wd-100">
                                        {row.imgUrl && <img src={row.imgUrl} className="ig-100" alt="" />}
                                        <h4>{row.tutorial_title}</h4>
                                        <p>{row.tutorial_content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* FAQ */}
            <section className="sc-sec-swidsfq sec-padd pt-0 ed_section">
                <div className="container">
                    <div className="row sc-swidsfq-inner">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            <div className="wd-100 mx-800 tx-21">
                                {acf.faq_title && <h2>{acf.faq_title}</h2>}
                                {acf.faq_subtitle && <p>{acf.faq_subtitle}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="row sc-tutorials-inner2">
                        {faqShortcodeHtml && (
                            <div className="bl-box col-sm-12 col-md-12">
                                <div dangerouslySetInnerHTML={{ __html: faqShortcodeHtml }} suppressHydrationWarning />
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
