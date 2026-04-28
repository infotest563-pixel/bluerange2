import Link from 'next/link';
import { getMedia } from '../../lib/wp';
import DomainsContactForm from '../DomainsContactForm';
import { wpImgUrl, wpAcfImg } from '../../lib/localImage';

export default async function About({ page }: { page: any }) {
    const acf = page.acf;
    const title = page.title.rendered;

    const resolveImage = async (field: any) => {
        if (!field) return '';
        // Use wpAcfImg first — handles string/object shapes
        const fromAcf = wpAcfImg(field);
        if (fromAcf) return fromAcf;
        // If it's a numeric media ID, fetch from WP API
        if (typeof field === 'number') {
            const media = await getMedia(field).catch(() => null);
            return wpImgUrl(media?.source_url || '');
        }
        return '';
    };

    const bannerBg = await resolveImage(acf.banner_background_image);
    const rightImg = await resolveImage(acf.right_image);
    const leftImg  = await resolveImage(acf.left_image);
    const hostingBg = await resolveImage(acf.latest_hosting_backgroung_img);
    const featureImg = await resolveImage(acf.important_feature_image);

    const latestTech = await Promise.all((acf.latest_technologies || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.latest_technology_image)
    })));

    return (
        <div className="about-template">
            {/* Banner */}
            <section className="ab-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container">
                    <div className="row ab-contbaner-inner sem-baner-inner tx-wht">
                        <div className="bl-box col-sm-12 col-lg-12">
                            <div className="wd-100 text-center">
                                <h1 dangerouslySetInnerHTML={{ __html: title }} />
                                {acf.banner_text && <div dangerouslySetInnerHTML={{ __html: acf.banner_text }} />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Customer Support */}
            <section className="ab-sec-custmer sec-padd ed_section">
                <div className="container">
                    <div className="row ab-custmer-inner align-items-center md-revers">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-6 ab-cstrtx">
                            <div className="wd-100">
                                {acf.right_image_title && <h2>{acf.right_image_title}</h2>}
                                {acf.right_image_content && <div dangerouslySetInnerHTML={{ __html: acf.right_image_content }} />}
                            </div>
                        </div>
                        {rightImg && (
                            <div className="bl-box col-sm-12 col-md-12 col-lg-6">
                                <img src={rightImg} className="img-fluid" alt="" />
                            </div>
                        )}
                    </div>

                    <div className="row ab-custmer-inner align-items-center">
                        {leftImg && (
                            <div className="bl-box col-sm-12 col-md-12 col-lg-6">
                                <img src={leftImg} className="img-fluid" alt="" />
                            </div>
                        )}
                        <div className="bl-box col-sm-12 col-md-12 col-lg-6 ab-cstrtx">
                            <div className="wd-100">
                                {acf.left_image_title && <h2>{acf.left_image_title}</h2>}
                                {acf.left_image_content && <div dangerouslySetInnerHTML={{ __html: acf.left_image_content }} />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Latest Hosting Server */}
            <section className="ab-sec-ltshosting sec-padd ed_section bl-overlay"
                style={{ backgroundImage: `url('${hostingBg}')` }}>
                <div className="container">
                    <div className="row ab-ltshosting-inner">
                        <div className="bl-box col-sm-12 col-md-12 text-center tx-wht">
                            <div className="wd-100 mx-800 tx-21">
                                {acf.latest_hosting_title && <h2>{acf.latest_hosting_title}</h2>}
                                {acf.latest_hosting_subtitle && <p>{acf.latest_hosting_subtitle}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="row ab-ltshosting-inner2">
                        {latestTech.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-sm-6 col-lg-4">
                                <div className="wd-100">
                                    {row.imgUrl && (
                                        <div className="rounded-circle">
                                            <img src={row.imgUrl} className="img-fluid" alt="" />
                                        </div>
                                    )}
                                    <div className="ab-ltshot">
                                        {row.latest_technology_title && <h4>{row.latest_technology_title}</h4>}
                                        {row.latest_technology_content && <p>{row.latest_technology_content}</p>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Important Features */}
            <section className="ab-sec-features sec-padd">
                <div className="container">
                    <div className="row align-items-center md-revers">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-6">
                            <div className="wd-100 mb-4">
                                {acf.important_features_title && <h2>{acf.important_features_title}</h2>}
                                {acf.import_features_subtitle && <p>{acf.import_features_subtitle}</p>}
                            </div>
                            <div className="row ab-fetriner2">
                                {acf.important_features?.map((row: any, i: number) => (
                                    <div key={i} className="col-md-6 col-lg-6">
                                        <div className="wd-100">
                                            {row.features_title && <h4>{row.features_title}</h4>}
                                            {row.features_content && <p>{row.features_content}</p>}
                                            {row.read_more_button && (
                                                <Link href={row.read_more_button.url}>
                                                    {row.read_more_button.title}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bl-box col-sm-12 col-md-12 col-lg-6">
                            {featureImg && (
                                <div className="wd-100">
                                    <img src={featureImg} alt="image" />
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
