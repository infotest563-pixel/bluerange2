'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getMedia } from '../../lib/wp';

// Client component for interactivity
export default function Microsoft365({ page }: { page: any }) {
    const acf = page.acf;
    const [activeTab, setActiveTab] = useState(acf.tab_items?.[0]?.tab_id || 'tab1');

    const resolveImage = (field: any) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        if (field.url) return field.url;
        return '';
    };

    const bannerBg = resolveImage(acf.microsoft_banner_image);

    return (
        <div className="microsoft-template">
            {/* Banner */}
            <section className="mcr-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container">
                    <div className="row mcr-contbaner-inner sem-baner-inner tx-wht">
                        <div className="bl-box col-sm-12 col-lg-12 mx-975">
                            <div className="wd-100 text-center">
                                {acf.microsoft_title && <h1>{acf.microsoft_title}</h1>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technology */}
            <section className="mcr-sec-technology sec-padd ed_section">
                <div className="container">
                    <div className="row cre-crowdsecbx-inner mcr-technology-inner">
                        {acf.technology_feachers?.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-12 col-sm-6 col-md-6 col-lg-4">
                                <div className="tech-card">
                                    {row.icon_class && (
                                        <div className="tech-icon">
                                            <i className={row.icon_class}></i>
                                        </div>
                                    )}
                                    {row.tech_title && <h4>{row.tech_title}</h4>}
                                    {row.tech_desc && <p>{row.tech_desc}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Package Section */}
            <section className="microsoft-365-package-sec sec-padd ed_section">
                <div className="container">
                    <div className="microsoft-365-package-sec-tabs-wrapper">
                        {/* Tab Buttons */}
                        <div className="tab-header">
                            {acf.tab_items?.map((tab: any, i: number) => (
                                <button
                                    key={i}
                                    className={`tab-btn ${activeTab === tab.tab_id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.tab_id)}
                                >
                                    {tab.tab_title}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        {acf.tab_items?.map((tab: any) => (
                            <div key={tab.tab_id} id={tab.tab_id} className={`tab-content ${activeTab === tab.tab_id ? 'active' : ''}`}>
                                {acf.plans?.map((plan: any, i: number) => {
                                    if (plan.parent_tab_id !== tab.tab_id) return null;
                                    return (
                                        <div key={i} className="package-card package-card-js">
                                            {plan.plan_title && <h3>{plan.plan_title}</h3>}
                                            {plan.plan_desc && <p>{plan.plan_desc}</p>}

                                            {plan.plan_price && (
                                                <div className="price">
                                                    {plan.plan_price}
                                                    {plan.price_per && <span className="per">{plan.price_per}</span>}
                                                </div>
                                            )}

                                            {plan.plan_sub_info && (
                                                <div className="sub-info" dangerouslySetInnerHTML={{ __html: plan.plan_sub_info }} />
                                            )}

                                            {plan.plan_vat_info && <p className="vat-info">{plan.plan_vat_info}</p>}

                                            <div className="btn-group">
                                                {plan.buy_url && plan.buy_label && (
                                                    <Link href={plan.buy_url} className="buy-btn">
                                                        {plan.buy_label}
                                                    </Link>
                                                )}
                                                {plan.try_url && plan.try_label && (
                                                    <Link href={plan.try_url} className="try-btn">
                                                        {plan.try_label}
                                                    </Link>
                                                )}
                                            </div>

                                            {plan.parent_tab_id === 'tab2' && plan.plan_desc_extra && (
                                                <div className="extra-description" dangerouslySetInnerHTML={{ __html: plan.plan_desc_extra }} />
                                            )}

                                            {plan.plan_extra_content && (
                                                <>
                                                    {tab.tab_id === 'tab2' && <div className="divider"></div>}
                                                    <div className="content-card-vertical" dangerouslySetInnerHTML={{ __html: plan.plan_extra_content }} />
                                                </>
                                            )}

                                            {plan.plan_features && (
                                                <div className="content-card-vertical">
                                                    <ul className="features">
                                                        {plan.plan_features.map((feature: any, k: number) => (
                                                            <li key={k}>{feature.feature_item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {(plan.app_heading || plan.plan_apps) && (
                                                <div className="apps-services">
                                                    {plan.app_heading && <div dangerouslySetInnerHTML={{ __html: plan.app_heading }} />}
                                                    {plan.plan_apps && (
                                                        <div className="apps-grid">
                                                            {plan.plan_apps.map((app: any, m: number) => {
                                                                const appIcon = resolveImage(app.app_icon);
                                                                return appIcon ? (
                                                                    <img key={m} src={appIcon} alt={app.app_name} />
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Get in Touch */}
            <Microsoft365ContactSection />
        </div>
    );
}

// Server component for the contact form section
import DomainsContactForm from '../DomainsContactForm';

function Microsoft365ContactSection() {
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
