import Link from 'next/link';
import { getMedia, renderShortcode } from '../../lib/wp';

export default async function ContactUs({ page }: { page: any }) {
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

    const bannerBg = await resolveImage(acf.banner_backgroung_image);

    // Contact Form Shortcode
    const contactFormHtml = acf.contact_form
        ? await renderShortcode(acf.contact_form)
        : '';

    // Phone logic
    const contactNo = acf.phone_number;
    const telHref = contactNo ? `tel:${contactNo.replace(/ /g, '')}` : '#';

    return (
        <div className="contact-us-template">
            {/* Banner */}
            <section className="cu-sec-contbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container">
                    <div className="row cu-contbaner-inner sem-baner-inner tx-wht">
                        <div className="bl-box col-sm-12 col-lg-12">
                            <div className="wd-100 text-center">
                                <h1 dangerouslySetInnerHTML={{ __html: title }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Details & Form */}
            <section className="cu-sec-conctpart ed_section sec-padd">
                <div className="container">
                    <div className="row cu-conctpart-inner align-items-center">
                        <div className="bl-box col-sm-12 col-lg-6 cu-txtbx">
                            <div className="wd-100">
                                {acf.get_in_touch_title && <h4>{acf.get_in_touch_title}</h4>}
                                {acf.get_in_touch_subtitle && <p>{acf.get_in_touch_subtitle}</p>}
                                <ul>
                                    {acf.address && (
                                        <li><i className="fa fa-location-arrow" aria-hidden="true"></i><span>{acf.address}</span></li>
                                    )}
                                    {acf.email_address && (
                                        <li>
                                            <a href={`mailto:${acf.email_address}`}>
                                                <i className="fa fa-envelope" aria-hidden="true"></i><span>{acf.email_address}</span>
                                            </a>
                                        </li>
                                    )}
                                    {contactNo && (
                                        <li>
                                            <a href={telHref}>
                                                <i className="fa fa-phone" aria-hidden="true"></i><span>{contactNo}</span>
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                        <div className="bl-box col-sm-12 col-lg-6 cu-formbx">
                            {contactFormHtml && (
                                <div className="wd-100">
                                    <div dangerouslySetInnerHTML={{ __html: contactFormHtml }} suppressHydrationWarning />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Map */}
            <section className="cu-sec-conctmap ed_section">
                <div className="container-fluid">
                    <div className="row cu-conctmap-inner">
                        <div className="bl-box col-sm-12 col-lg-12">
                            {acf.iframe_url && (
                                <div className="wd-100">
                                    <iframe
                                        src={acf.iframe_url}
                                        width="100%"
                                        height="450"
                                        style={{ border: 0 }}
                                        allowFullScreen={true}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
