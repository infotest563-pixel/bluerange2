import { getMedia } from '../../lib/wp';
import CoLocationContactForm from '../../components/CoLocationContactForm';

const WP_HOST = 'https://dev-bluerange.pantheonsite.io';

export default async function CoLocation({ page }: { page: any }) {
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

    const features = await Promise.all((acf.you_can_trust_features || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.trust_features_icons)
    })));

    return (
        <div className="co-location-template">
            {/* Banner */}
            <section className="cl-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${WP_HOST}/wp-content/uploads/2023/10/co-loction.jpg')` }}>
                <div className="container">
                    <div className="row cl-contbaner-inner sem-baner-inner">
                        <div className="bl-box col-sm-12 col-lg-12">
                            <div className="wd-100 text-center coloc-banner-text">
                                <h1   className="white-text" dangerouslySetInnerHTML={{ __html: title }} />
                                {acf.banner_content && (
                                    <div dangerouslySetInnerHTML={{ __html: acf.banner_content }} />
                                )}
                                {acf.banner_subcontent && (
                                    <div dangerouslySetInnerHTML={{ __html: acf.banner_subcontent }} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Co-location you can trust */}
            <section className="cl-sec-location2 sec-padd ed_section">
                <div className="container">
                    <div className="row cl-lcatin-inner1 smll_titl">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            <div className="wd-100 mx-800">
                                <h2>
                                    <span dangerouslySetInnerHTML={{ __html: title || '' }} />
                                    {acf.you_can_trust_title && (
                                        <span dangerouslySetInnerHTML={{ __html: acf.you_can_trust_title }} />
                                    )}
                                </h2>
                                {acf.you_can_trust_subtitle && (
                                    <div dangerouslySetInnerHTML={{ __html: acf.you_can_trust_subtitle }} />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="row lcl-catin-inner2">
                        {features.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-12 col-sm-6 col-md-6 col-lg-4">
                                <div className="wd-100">
                                    {row.imgUrl && (
                                        <div className="rounded-circle">
                                            <img src={row.imgUrl} className="img-fluid" alt="" />
                                        </div>
                                    )}
                                    {row.trust_features_title && <h4>{row.trust_features_title}</h4>}
                                    {row.trust_features_content && (
                                        <div dangerouslySetInnerHTML={{ __html: row.trust_features_content }} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Request a Quote */}
            <section className="colc-sec-bkmeetings sec-padd ed_section">
                <div className="container">
                    <div className="row pbs-bkmeting-inner mx-975">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-12">
                            <div className="wd-100 pr-lg-2 mb-3 text-center">
                                <h2>Request will be answered within 24 hours</h2>
                            </div>
                            <div className="wd-100">
                                <CoLocationContactForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
