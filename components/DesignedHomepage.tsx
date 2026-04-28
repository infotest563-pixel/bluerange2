import Link from 'next/link';
import { getMedia } from '../lib/wp';
import ContactForm from './ContactForm';
import DomainSearch from './DomainSearch';
import { resolveUrl } from '../lib/resolveUrl';

export default async function DesignedHomepage({ page, lang = 'en' }: { page: any; lang?: string }) {
    const acf = page.acf;

    // Helper to resolve image URL from ID or Object
    const resolveImage = async (field: any) => {
        if (!field) return '';
        if (typeof field === 'string') return field; // Already URL?
        if (field.url) return field.url;
        if (typeof field === 'number') {
            const media = await getMedia(field).catch(() => null);
            return media?.source_url || '';
        }
        return '';
    };

    // Pre-fetch all necessary images
    // We map over all fields that might be IDs or Objects
    // This is a bit manual but ensures robust rendering
    const imgMap = new Map<string, string>();

    // Collect all potential image input values
    const imageInputs: any[] = [];

    // Add singular images
    imageInputs.push(acf.banner_icon_image_1);
    imageInputs.push(acf.banner_icon_image_2);
    imageInputs.push(acf.fantastic_customer_background_image);
    imageInputs.push(acf.sustainable_cloud_background_image);
    imageInputs.push(acf.take_your_first_background_image);
    imageInputs.push(acf.high_quality_cloud_background_image);
    imageInputs.push(acf.get_a_quote_image);

    // Add repeater images
    acf.cloud_services?.forEach((row: any) => imageInputs.push(row.services_image));
    acf.fantastic_customers_logos?.forEach((row: any) => imageInputs.push(row.fantastic_images));
    acf.service_support_system?.forEach((row: any) => imageInputs.push(row.service_support_image));
    acf.sustainable_services?.forEach((row: any) => imageInputs.push(row.services_image));
    acf.highly_available_support?.forEach((row: any) => imageInputs.push(row.highly_available_support_images));
    acf.services?.forEach((row: any) => imageInputs.push(row.services_image));
    acf.address?.forEach((row: any) => {
        imageInputs.push(row.mail_icon);
        imageInputs.push(row.phone_number_icon);
    });
    acf.software_logos?.forEach((row: any) => imageInputs.push(row.software_images));
    acf.high_quality_cloud_services?.forEach((row: any) => imageInputs.push(row.cloud_service_image));

    // Deduplicate and fetch
    const uniqueInputs = Array.from(new Set(imageInputs.filter(x => x)));

    // Fetch in parallel
    await Promise.all(uniqueInputs.map(async (input) => {
        const url = await resolveImage(input);
        // Store by ID (if number) or by Object ref (weak) or just use the resolved value directly?
        // Since we can't key by object easily in Map for retrieval unless we use the same reference,
        // we'll just re-resolve in render or store in a way we can lookup.
        // Actually, resolveImage handles both. 
        // We can just create a map where key is the input value (if primitive) or ID.
        // If input is Object, we don't need to fetch usually.
        // The issue is if input is ID (number).
        if (typeof input === 'number') {
            imgMap.set(String(input), url);
        }
    }));

    // Render helper
    const getImg = (field: any) => {
        if (!field) return '';
        if (field.url) return field.url;
        if (typeof field === 'number') return imgMap.get(String(field)) || '';
        return '';
    };

    //return (
    return (
        <>
            {/* Cloud services hosted in Sweden */}
            <section className="hm-sec-firstsection sec-padd ed_section">
                <div className="container">
                    <div className="row hm-frstsc-inner mb-3">
                        <div className="col col-12">
                            <div className="wd-100 d-flex justify-content-center align-items-center">
                                {acf.banner_icon_image_1 && <img src={getImg(acf.banner_icon_image_1)} className="img-fluid" alt="" />}
                                {acf.banner_icon_image_2 && <img src={getImg(acf.banner_icon_image_2)} className="img-fluid" alt="" />}
                            </div>
                        </div>
                    </div>

                    <div className="row hm-frstx-inner2">
                        <div className="bl-box col-sm-12">
                            <div className="wd-100 tx-21 text-center">
                                {acf.cloud_services_title && <h1>{acf.cloud_services_title}</h1>}
                                {acf.cloud_services_subtitle && <p>{acf.cloud_services_subtitle}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="row hm-frstx-inner3 top-round greybx-inner circle-hover">
                        {acf.cloud_services?.map((row: any, i: number) => {
                            const imgUrl = getImg(row.services_image);
                            return (
                                <div key={i} className="bl-box col-sm-6 col-lg-4">
                                    <div className="wd-100">
                                        <div className="rounded-circle" style={{ backgroundColor: row.services_image_background }}>
                                            {imgUrl && <img src={imgUrl} className="img-fluid" alt="" />}
                                        </div>
                                        <h4>{row.services_title}</h4>
                                        <p>{row.services_content}</p>
                                        <Link className="btn" href={resolveUrl(row.view_more_url, lang)} role="button">
                                            {row.view_more_button_text || 'View More'}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Fantastic Customers */}
            <section className="hm-sec-frstbner sec-padd bl-overlay ed_section"
                style={{ backgroundImage: `url('${getImg(acf.fantastic_customer_background_image)}')` }}>
                <div className="container-fluid">
                    <div className="row hm-frstbnrtx-inner mx-975 tx-wht">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            <div className="wd-100 fade-in-top">
                                {acf.fantastic_customers_title && <h2>{acf.fantastic_customers_title}</h2>}
                                {acf.fantastic_customers_subtitle && <p>{acf.fantastic_customers_subtitle}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="hm-frstbner-inner bl-inners">
                        <div className="wd-100">
                            {/* Swiper Structure */}
                            <div className="swiper hm-firstbnr">
                                <div className="swiper-wrapper hm_frtbnr-inner">
                                    {acf.fantastic_customers_logos?.map((row: any, i: number) => {
                                        const imgUrl = getImg(row.fantastic_images);
                                        if (!imgUrl) return null;
                                        return (
                                            <div key={i} className="swiper-slide wd-100">
                                                <img src={imgUrl} className="mx-100" alt="" />
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="swiper-button-next"></div>
                                <div className="swiper-button-prev"></div>
                            </div>
                        </div>
                    </div>
                    <div className="row hm-frstbnrbtn-inner mt-4">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            {acf.contact_us_button && (
                                <div className="wd-100">
                                    <Link className="btn" href={resolveUrl(acf.contact_us_button.url, lang)} role="button" target={acf.contact_us_button.target || '_self'}>
                                        {acf.contact_us_button.title}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Support System */}
            <section className="hm-sec-servicsuport sec-padd ed_section">
                <div className="container">
                    <div className="row hm-servicsuport-inner top-round tx-center bounce-hover">
                        {acf.service_support_system?.map((row: any, i: number) => {
                            const imgUrl = getImg(row.service_support_image);
                            return (
                                <div key={i} className="bl-box col-sm-6 col-lg-4">
                                    <div className="wd-100">
                                        <div className="rounded-circle">
                                            {imgUrl && <img src={imgUrl} className="img-fluid" alt="" />}
                                        </div>
                                        <h4>{row.service_support_system_title}</h4>
                                        <p>{row.service_support_content}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Sustainable Cloud Services */}
            <section className="hm-sec-sustainable sec-padd ed_section bl-overlay"
                style={{ backgroundImage: `url('${getImg(acf.sustainable_cloud_background_image)}')` }}>
                <div className="container">
                    <div className="row hm-Sustinble-inner1">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-6 tx-wht">
                            <div className="wd-100">
                                {acf.sustainable_cloud_services_title && <h2>{acf.sustainable_cloud_services_title}</h2>}
                                {acf.sustainable_cloud_services_content && <p>{acf.sustainable_cloud_services_content}</p>}
                                {acf.sustainable_cloud_services_subtitle && <h5>{acf.sustainable_cloud_services_subtitle}</h5>}
                            </div>
                        </div>
                    </div>
                    <div className="row hm-Sustinble-inner top-round whtbx-inner tx-center">
                        {acf.sustainable_services?.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-sm-6 col-lg-4">
                                <div className="wd-100">
                                    <div className="rounded-circle">
                                        <img src={getImg(row.services_image)} className="img-fluid" alt="" />
                                    </div>
                                    {/* Content HTML */}
                                    <div dangerouslySetInnerHTML={{ __html: row.services_content }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVICE DESK */}
            <section className="hm-sec-servicedesk sec-padd ed_section">
                <div className="container">
                    <div className="row hm-servicedesk-inner text-center">
                        {acf.services?.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-sm-6 col-lg-4">
                                <div className="wd-100">
                                    <div className="rounded-circle">
                                        <img src={getImg(row.services_image)} className="img-fluid" alt="" />
                                    </div>
                                    <h4>{row.services_title}</h4>
                                    <p>{row.services_content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Take your first step */}
            <section className="hm-sec-takeyour sec-padd ed_section bl-overlay"
                style={{ backgroundImage: `url('${getImg(acf.take_your_first_background_image)}')` }}>
                <div className="container">
                    <div className="row hm-takeyour-inner text-center">
                        <div className="bl-box col-md-12 tx-wht tx-21">
                            <div className="wd-100">
                                {acf.take_your_first_title && <h2>{acf.take_your_first_title}</h2>}

                                {/* Domain Search */}
                                <DomainSearch buttonText="Search Domain" />

                                {acf.take_your_first_subtitle && <h4>{acf.take_your_first_subtitle}</h4>}
                                {acf.take_your_first_content && <p>{acf.take_your_first_content}</p>}
                            </div>
                        </div>
                    </div>
                    {acf.contact_support_button && (
                        <div className="hm-takebtn-inner text-center">
                            <Link className="btn" href={resolveUrl(acf.contact_support_button.url, lang)} role="button" target={acf.contact_support_button.target || '_self'}>
                                {acf.contact_support_button.title}
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* About us */}
            <section className="hm-sec-aboutus sec-padd ed_section">
                <div className="container">
                    <div className="row hm-aboutus-inner">
                        <div className="bl-box col-md-12 col-lg-6">
                            <div className="wd-100 tx-21">
                                {acf.about_us_title && <h6>{acf.about_us_title}</h6>}
                                {acf.about_us_subtitle && <h2>{acf.about_us_subtitle}</h2>}
                                {acf.about_us_content && <p>{acf.about_us_content}</p>}

                                <div className="row hm-abuts-boxx">
                                    {acf.address?.map((row: any, i: number) => (
                                        <div key={i} className="bl-box col-sm-6 col-lg-6">
                                            <div className="wd-100 tx-18">
                                                {row.address_title && <h5>{row.address_title}</h5>}
                                                {row.detail_address && <div dangerouslySetInnerHTML={{ __html: row.detail_address }} />}
                                                <ul>
                                                    <li>
                                                        {row.mail_link && (
                                                            <a href={row.mail_link.url} target={row.mail_link.target || '_self'}>
                                                                <img src={getImg(row.mail_icon)} className="img-fluid" />
                                                                <span>{row.email_address}</span>
                                                            </a>
                                                        )}
                                                    </li>
                                                    <li>
                                                        {row.phone_number && (
                                                            <a href={row.phone_number.url} target={row.phone_number.target || '_self'}>
                                                                <img src={getImg(row.phone_number_icon)} className="img-fluid" />
                                                                <span>{row.phone_number_text}</span>
                                                            </a>
                                                        )}
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bl-box col-md-12 col-lg-6 ">
                            <div className="wd-100 text-center text-lg-right" id="map"></div>
                            <div className="wd-100 text-center mt-4">
                                <img src="https://dev-bluerange.pantheonsite.io/wp-content/uploads/2023/11/headquarter.png" className="mx-100" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Software to Choose */}
            <section className="sh-sec-softwrchose sec-padd ed_section bg-blue">
                <div className="container">
                    <div className="row sh-softwrchose-inner1 tx-wht">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            {acf.software_to_choose_title && (
                                <div className="wd-100">
                                    <h2>{acf.software_to_choose_title}</h2>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="swiper hm-partswiper">
                        <div className="swiper-wrapper hm_frtbnr-inner">
                            {acf.software_logos?.map((row: any, i: number) => {
                                const imgUrl = getImg(row.software_images);
                                if (!imgUrl) return null;
                                return (
                                    <div key={i} className="swiper-slide wd-100">
                                        <img src={imgUrl} className="mx-100" alt="" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* High Quality Cloud Services */}
            <section className="hm-sec-sustainable sec-padd ed_section bl-overlay"
                style={{ backgroundImage: `url('${getImg(acf.high_quality_cloud_background_image)}')` }}>
                <div className="container">
                    <div className="row hm-Sustinble-inner1">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-6 tx-wht">
                            <div className="wd-100">
                                {acf.high_quality_cloud_title && <h2>{acf.high_quality_cloud_title}</h2>}
                            </div>
                        </div>
                    </div>
                    <div className="row hm-Sustinble-inner top-round whtbx-inner tx-center">
                        {acf.high_quality_cloud_services?.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-sm-6 col-lg-4">
                                <div className="wd-100">
                                    {row.cloud_service_image && (
                                        <div className="rounded-circle">
                                            <img src={getImg(row.cloud_service_image)} className="img-fluid" alt="" />
                                        </div>
                                    )}
                                    {row.cloud_service_content && <div dangerouslySetInnerHTML={{ __html: row.cloud_service_content }} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Get a Quote */}
            <section className="hm-sec-getaquote ed_section mb-gap0">
                <div className="container-fluid">
                    <div className="row hm-getaquote-inner">
                        {acf.get_a_quote_image && (
                            <div className="bl-box col-sm-12 col-lg-6">
                                <div className="wd-100">
                                    <img src={getImg(acf.get_a_quote_image)} className="img-fluid" alt="" />
                                </div>
                            </div>
                        )}
                        <div className="bl-box col-sm-12 col-lg-6 hm-col-frm">
                            <div className="wd-100">
                                {acf.get_a_quote_title && <h2>{acf.get_a_quote_title}</h2>}
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
