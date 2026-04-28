import Link from 'next/link';
import { getMedia, renderShortcode } from '../../lib/wp';

export default async function PublicSector({ page }: { page: any }) {
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

    const gallery = await Promise.all((acf.image || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row)
    })));

    const publicFeatures = await Promise.all((acf.public_features || []).map(async (row: any) => ({
        ...row,
        iconUrl: await resolveImage(row.icon)
    })));

    const bannerBg = await resolveImage(acf.banner_bg);

    const customerLogos = await Promise.all((acf.customer_logos || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.logo_img)
    })));

    const customerFeatures = await Promise.all((acf.customers_features || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.icon_images)
    })));

    // Shortcode
    const shortcodeHtml = acf.metting_form_shortcode
        ? await renderShortcode(acf.metting_form_shortcode)
        : '';

    return (
        <div className="public-sector-template">
            {/* Public Sector First Section */}
            <section className="hm-sec-firstsection pbs-sec-pblctbnr sec-padd ed_section">
                <div className="container">
                    <div className="row hm-frstsc-inner mb-3">
                        <div className="col col-12">
                            <div className="wd-100 d-flex justify-content-center align-items-center">
                                {gallery.map((img: any, i: number) => (
                                    <img key={i} src={img.imgUrl} className="img-fluid" alt={img.alt} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="row hm-frstx-inner2">
                        <div className="bl-box col-sm-12">
                            <div className="wd-100 tx-21 text-center">
                                {acf.public_title && <h1>{acf.public_title}</h1>}
                                {acf.public_description && <p>{acf.public_description}</p>}
                            </div>
                        </div>
                    </div>

                    {publicFeatures.length > 0 && (
                        <div className="row hm-frstx-inner3 pbs-frstx-inner3 top-round greybx-inner circle-hover">
                            {publicFeatures.map((row: any, i: number) => (
                                <div key={i} className="bl-box col-sm-6 col-lg-4">
                                    <div className="wd-100">
                                        <div className="rounded-circle" style={{ backgroundColor: row.bg_color }}>
                                            {row.iconUrl && <img src={row.iconUrl} className="img-fluid" alt="" />}
                                        </div>
                                        {row.feature_title && <h4>{row.feature_title}</h4>}
                                        {row.feature_desc && <p>{row.feature_desc}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Customer Slider */}
            <section className="hm-sec-frstbner pbs-sec-customers sec-padd bl-overlay ed_section"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container-fluid">
                    <div className="row hm-frstbnrtx-inner mx-975 tx-wht">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            <div className="wd-100 fade-in-top">
                                {acf.banner_title && <h2>{acf.banner_title}</h2>}
                                {acf.banner_desc && <p>{acf.banner_desc}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="hm-frstbner-inner bl-inners">
                        <div className="wd-100">
                            <div className="swiper hm-firstbnr sw-aropad">
                                <div className="swiper-wrapper hm_frtbnr-inner">
                                    {customerLogos.map((row: any, i: number) => (
                                        <div key={i} className="swiper-slide wd-100">
                                            {row.imgUrl && <img src={row.imgUrl} className="mx-100" alt="" />}
                                        </div>
                                    ))}
                                </div>
                                <div className="swiper-button-next"></div>
                                <div className="swiper-button-prev"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Service Support */}
            <section className="hm-sec-servicsuport sec-padd ed_section">
                <div className="container">
                    {customerFeatures.length > 0 && (
                        <div className="row hm-servicsuport-inner top-round tx-center bounce-hover">
                            {customerFeatures.map((row: any, i: number) => (
                                <div key={i} className="bl-box col-sm-6 col-lg-4">
                                    <div className="wd-100">
                                        <div className="rounded-circle">
                                            {row.imgUrl && <img src={row.imgUrl} className="img-fluid" alt="" />}
                                        </div>
                                        {row.customers_features_title && <h4>{row.customers_features_title}</h4>}
                                        {row.customers_features_description && <p>{row.customers_features_description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Book a meeting */}
            <section className="pbs-sec-bkmeetings pt-0 sec-padd ed_section">
                <div className="container">
                    <div className="row pbs-bkmeting-inner">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-5">
                            <div className="wd-100 pr-lg-2">
                                {acf.metting_title && <h3>{acf.metting_title}</h3>}
                                {acf.metting_description && <p>{acf.metting_description}</p>}
                            </div>
                        </div>
                        <div className="bl-box col-sm-12 col-md-12 col-lg-7">
                            <div className="wd-100">
                                {shortcodeHtml && (
                                    <div dangerouslySetInnerHTML={{ __html: shortcodeHtml }} suppressHydrationWarning />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
