'use client';
import { useState } from 'react';
import Link from 'next/link';
import { resolveUrl, getLang } from '../../lib/resolveUrl';

export default function WebHotel({ page }: { page: any }) {
    const acf = page.acf;
    const [modalOpen, setModalOpen] = useState(false);

    // In a real scenario, we might want to fetch shortcode content server-side.
    // However, since this is a client component, we pass pre-fetched shortcode or fetch it here.
    // For simplicity, we'll assume the shortcode content is passed or we rendered it server-side wrapper.
    // But since we are converting to pure client component for interaction, let's just use the raw shortcode string
    // or better yet, if the shortcode is static (like the buy now popup), we can't easily run PHP.
    // We will render the shortcode string inside a div and hope the contact form logic (if JS based) picks it up, 
    // OR we fetch the rendered HTML.

    // Actually, creating a server wrapper that passes data to client component is better.
    // But for now, let's keep it simple. If shortcode rendering is needed, we'll use a prop.

    const resolveImage = (field: any) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        if (field.url) return field.url;
        return '';
    };

    // Prefix bare paths with lang prefix from page
    const lang = getLang(page);

    const bannerBg = resolveImage(acf.banner_background_image);
    const takeYourBg = resolveImage(acf.take_your_bg);

    // Helper for FAQ toggles could be added, but the original code had simple structure.
    // The original code commented out the first FAQ section and had a valid "How it works" section.

    return (
        <div className="web-hotel-template">
            {/* Banner */}
            <section className="wbh-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container">
                    <div className="row wbh-contbaner-inner sem-baner-inner tx-wht">
                        <div className="bl-box col-sm-12 col-lg-12 mx-975">
                            <div className="wd-100 text-center">
                                <h1>{acf.banner_title}</h1>
                                {acf.banner_description && <p>{acf.banner_description}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What is Web Hotel */}
            <section className="wbh-sec-whthtl sec-padd ed_section">
                <div className="container">
                    <div className="row wbh-whthtl-inner">
                        <div className="bl-box col-12 col-sm-12">
                            <div className="wd-100">
                                <h3>{acf.title}</h3>
                                {acf.description && (
                                    <div dangerouslySetInnerHTML={{ __html: acf.description }} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Package */}
            <section className="wbh-sec-wbpackge sm-sec-packges pt-0 sec-padd ed_section">
                <div className="container">
                    <div className="row wbh-wbpackge-inner1">
                        <div className="bl-box col-sm-12 col-md-12">
                            <div className="wd-100 text-center">
                                <h2>{acf.package_title}</h2>
                                {acf.package_description && <p>{acf.package_description}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="row wbh-wbpackge-inner2 sm-packges-inner text-center">
                        {acf.packages?.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-12 col-sm-6 col-md-6 col-lg-4">
                                <div className={`wd-100 sm-pckgs-box sm-pckgs-bx${i + 1}`}>
                                    <h4>{row.title}</h4>
                                    <h2>{row.currency}{row.price}<span>{row.billing_cycle}</span></h2>
                                    <div>
                                        <button className="btn buyNowBtn" type="button" onClick={() => setModalOpen(true)}>
                                            {row.buy_now_label}
                                        </button>
                                    </div>
                                    <div className="sm-pkg-feturs text-left">
                                        <ul>
                                            {row.features?.map((feature: any, k: number) => (
                                                <li key={k}>
                                                    <p>{feature.feature_name}</p>
                                                    <p>
                                                        {feature.feature_value}
                                                        {k > 1 && feature.feature_available_1 ? <i className="fa fa-check" aria-hidden="true"></i> : ''}
                                                    </p>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Take your first step — only show if content exists */}
            {(acf.take_your_title || acf.take_your_bg) && (
            <section className="hm-sec-takeyour web-hotel-takeyour sec-padd ed_section bl-overlay"
                style={{ backgroundImage: `url('${takeYourBg}')` }}>
                <div className="container">
                    <div className="row hm-takeyour-inner text-center">
                        <div className="bl-box col-md-12 tx-wht tx-21">
                            <div className="wd-100 fade-in-top">
                                <h2>{acf.take_your_title}</h2>
                                {acf.take_your_subtitle && <h4>{acf.take_your_subtitle}</h4>}
                                {acf.take_your_desc && <p>{acf.take_your_desc}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="hm-takebtn-inner text-center">
                        {acf.take_your_btn_link && (
                            <Link className="btn" href={resolveUrl(acf.take_your_btn_link, lang)} role="button">
                                {acf.take_your_btn_text}
                            </Link>
                        )}
                    </div>
                </div>
            </section>
            )}

            {/* Easy Use */}
            <section className="web-sec-easeuse sec-padd ed_section">
                <div className="container">
                    <div className="row web-easeuse-inner text-center">
                        <div className="bl-box col-md-12 tx-20">
                            <div className="wd-100 mx-800">
                                <h2>{acf.easy_use_title}</h2>
                                {acf.easy_use_description && <p>{acf.easy_use_description}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="how-it-works-section sec-padd ed_section">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-md-12 process-wrapper">
                            <div className="process-heading">
                                <h2>{acf.how_it_works_title}</h2>
                            </div>

                            <div className="process-horizontal">
                                {acf.how_it_works_steps?.map((step: any, i: number) => (
                                    <div key={i} className="process-step">
                                        {step.step_number && <div className="step-circle">{step.step_number}</div>}
                                        {step.step_title && <h3>{step.step_title}</h3>}
                                        {step.step_description && (
                                            <div className="step-desc" dangerouslySetInnerHTML={{ __html: step.step_description }} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Need Help */}
            <section className="need-help-section sec-padd ed_section bg-light">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-md-12 need-help-wrapper">
                            <div className="wd-100 faq-heading">
                                <h2>
                                    {acf.need_help_title} <span>{acf.need_help_subtitle}</span>
                                </h2>
                            </div>

                            <div className="need-help-content wd-100">
                                {acf.need_help_desc && <div className="desc" dangerouslySetInnerHTML={{ __html: acf.need_help_desc }} />}

                                {acf.wiki_link && acf.wiki_text && (
                                    <p>
                                        <a href={acf.wiki_link} target="_blank" className="wiki-link">
                                            {acf.wiki_text}
                                        </a>
                                    </p>
                                )}

                                {acf.need_help_extra_text && <div className="extra-text" dangerouslySetInnerHTML={{ __html: acf.need_help_extra_text }} />}

                                <div className="contact-info mt-1">
                                    <p>
                                        {acf.phone_number && (
                                            <>
                                                <strong>{acf.phone_label} </strong>
                                                <a href={acf.phone_number.url} className="contact-link" target={acf.phone_number.target}>
                                                    {acf.phone_number.title}
                                                </a><br />
                                            </>
                                        )}
                                        {acf.email_address && (
                                            <>
                                                <strong>{acf.email_label} </strong>
                                                <a href={`mailto:${acf.email_address}`} className="contact-link">
                                                    {acf.email_address}
                                                </a>
                                            </>
                                        )}
                                    </p>

                                    {acf.button_link && acf.button_text && (
                                        <Link href={resolveUrl(acf.button_link, lang)} className="btn">
                                            {acf.button_text}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Get in Touch */}
            <WebHotelContactSection />

            {/* Popup Modal */}
            {modalOpen && (
                <div id="popupModal" className="popup-overlay" style={{ display: 'flex' }}>
                    <div className="popup-content-buy-now">
                        <span className="close-btn" onClick={() => setModalOpen(false)}>&times;</span>
                        <h2>Complete Your Purchase</h2>
                        <p>Please contact our sales team or proceed with checkout.</p>
                        {/* Hardcoded Shortcode for Buy Now - in purely client component, we might not render this safely unless we fetch HTML or use a generic form. 
                             For now, let's assuming we cannot re-fetch shortcode in client easily without a server prop. 
                             We will output a placeholder. In a standard React conversion, we'd render the form manually or fetch it.
                         */}
                        <div className="shortcode-placeholder">
                            <p>Contact form placeholder - Shortcodes require server rendering.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Server component for contact form
import DomainsContactForm from '../DomainsContactForm';

function WebHotelContactSection() {
    return (
        <section className="all-sec-lastform sec-padd">
            <div className="container">
                <div className="row all-lastform-inner tx-wht">
                    <div className="bl-box col-md-12 all-lstform cu-formbx">
                        <div className="wd-100 fade-in-top">
                            <h2 className="mb-3">get in touch</h2>
                            <DomainsContactForm />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
