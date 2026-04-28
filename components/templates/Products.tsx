import Link from 'next/link';
import { getMedia, renderShortcode } from '../../lib/wp';
import DomainsContactForm from '../DomainsContactForm';

export default async function Products({ page }: { page: any }) {
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
    const customerSupportImg = await resolveImage(acf.customer_support_image);

    // Products Plans Loop
    const plans = acf.products_plans || [];

    // Help Questions Shortcode
    const helpQSShortcodeHtml = acf.help_questions
        ? await renderShortcode(acf.help_questions)
        : '';

    return (
        <div className="products-template">
            {/* Banner */}
            <section className="prd-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container">
                    <div className="row prd-contbaner-inner sem-baner-inner tx-wht">
                        <div className="bl-box col-sm-12 col-lg-12">
                            <div className="wd-100 text-center">
                                <h1 dangerouslySetInnerHTML={{ __html: title }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Customer Support */}
            <section className="prd-sec-parrt2 sec-padd ed_section">
                <div className="container">
                    <div className="row prd-parrts-inner sm-boxx-inr2 align-items-center md-revers">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-6">
                            <div className="wd-100">
                                {acf.customer_support_title && <h2>{acf.customer_support_title}</h2>}
                                {acf.customer_support_content && <div dangerouslySetInnerHTML={{ __html: acf.customer_support_content }} />}
                            </div>
                        </div>
                        <div className="bl-box col-sm-12 col-md-12 col-lg-6">
                            {customerSupportImg && (
                                <div className="wd-100">
                                    <img src={customerSupportImg} className="img-fluid" alt="" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Products */}
            <section className="prd-sec-products sec-padd ed_section bg-light">
                <div className="container">
                    <div className="row prd-products-inner">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            <div className="wd-100 mx-800 tx-21">
                                {acf.products_plans_title && <h2>{acf.products_plans_title}</h2>}
                                {acf.products_plans_subtitle && <p>{acf.products_plans_subtitle}</p>}
                            </div>
                        </div>
                    </div>
                    {plans.length > 0 && (
                        <div className="row prd-products-inner2">
                            {plans.map((row: any, i: number) => (
                                <div key={i} className="bl-box col-sm-12 col-md-6 col-lg-4">
                                    <div className="wd-100 tx-21">
                                        <div className="prd-indtop">
                                            <h4>{row.plan_title} <small>{row.plan_subtitle}</small></h4>
                                            <span>{row.plan_price}<small>Per month</small></span>
                                            <p>{row.plan_content}</p>
                                        </div>
                                        <div className="prd-ulindtp">
                                            <ul>
                                                {row.plan_feature?.map((feature: any, k: number) => (
                                                    <li key={k}><i className="fa fa-check" aria-hidden="true"></i>{feature.feature_list}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        {row.plan_button && (
                                            <Link className="btn" href={row.plan_button.url} role="button">
                                                {row.plan_button.title}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Service Questions */}
            <section className="sr-sec-srvicqestn sec-padd ed_section">
                <div className="container">
                    <div className="row sr-srvicqestn-inner">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-5">
                            <div className="wd-100 tx-21 pr-lg-2">
                                {acf.need_help_title && <h2>{acf.need_help_title}</h2>}
                                {acf.need_help_subtitle && <p>{acf.need_help_subtitle}</p>}
                            </div>
                        </div>
                        <div className="bl-box col-sm-12 col-md-12 col-lg-7 sr-srqstacrod">
                            {helpQSShortcodeHtml && (
                                <div className="wd-100">
                                    <div dangerouslySetInnerHTML={{ __html: helpQSShortcodeHtml }} suppressHydrationWarning />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Get in Touch */}
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
        </div>
    );
}
