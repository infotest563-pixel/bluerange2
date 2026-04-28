import Link from 'next/link';
import { getMedia } from '../../lib/wp';
import DomainsContactForm from '../DomainsContactForm';

export default async function Broadband({ page }: { page: any }) {
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

    const bgImage = await resolveImage(acf.background_image);

    return (
        <div className="broadband-template">
            {/* Banner */}
            <section className="brd-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bgImage}')` }}>
                <div className="container">
                    <div className="row brd-contbaner-inner sem-baner-inner tx-wht">
                        <div className="bl-box col-sm-12 col-lg-12 mx-975">
                            <div className="wd-100 text-center">
                                {acf.banner_title && <h1>{acf.banner_title}</h1>}
                                {acf.banner_description && (
                                    <div className="page-content" dangerouslySetInnerHTML={{ __html: acf.banner_description }} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Plan Repeater */}
            {acf.plan_repeater && (
                <section className="brd-sec-interntcompny sec-padd ed_section">
                    <div className="container">
                        <div className="brd-intrntcompny-inner brd-intrntcompny-inner-vs">
                            {acf.plan_repeater.map((plan: any, i: number) => (
                                <div key={i} className="bl-box">
                                    <div className="wd-100">
                                        {/* Plan Title */}
                                        {plan.plan_title && <h5>{plan.plan_title}</h5>}

                                        {/* Features */}
                                        {plan.plan_features && (
                                            <ul>
                                                {plan.plan_features.map((feature: any, k: number) => (
                                                    <li key={k}>
                                                        {feature.features_lable}
                                                        {feature.features_value && <span>{feature.features_value}</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {/* Price Note */}
                                        {plan.price_note && (
                                            <div className="price-note" dangerouslySetInnerHTML={{ __html: plan.price_note }} />
                                        )}

                                        {/* Inline Request Form */}
                                        <div className="request-form-wrapper">
                                            {plan.form_title && <h4 className="request-form-title">{plan.form_title}</h4>}

                                            <form className="request-form">
                                                <label htmlFor={`speed-${i}`}>
                                                    {plan.form_speed_label}
                                                </label>
                                                <select id={`speed-${i}`} name="speed" required>
                                                    <option value="">
                                                        {plan.form_speed_option_label}
                                                    </option>
                                                    {plan.form_speed_option?.map((opt: any, m: number) => (
                                                        opt.speed_value && (
                                                            <option key={m} value={opt.speed_value}>
                                                                {opt.speed_value}
                                                            </option>
                                                        )
                                                    ))}
                                                </select>

                                                <label htmlFor={`address-${i}`}>
                                                    {plan.form_address_label}
                                                </label>
                                                <input type="text" id={`address-${i}`} name="address"
                                                    placeholder={plan.form_address_placeholder} required />

                                                <button type="submit" className="buy-btn request-the-plan-btn">
                                                    {plan.submit_button_text || 'Submit Request'}
                                                </button>
                                            </form>
                                        </div>

                                        {/* CTA Button */}
                                        {plan.buttone_link && (
                                            <div className="btn-group">
                                                <Link href={plan.buttone_link.url} className="buy-btn" target={plan.buttone_link.target || '_self'}>
                                                    {plan.buttone_link.title}
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

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
