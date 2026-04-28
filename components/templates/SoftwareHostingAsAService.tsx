import { getMedia } from '../../lib/wp';
import ContactForm from '../ContactForm';

export default async function SoftwareHostingAsAService({ page }: { page: any }) {
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
    const getQuoteImg = await resolveImage(acf.get_a_quote_image);
    const services = await Promise.all((acf.softwarer_hosting_services || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.service_image)
    })));

    const softwareLogos = await Promise.all((acf.software_logos || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.software_images)
    })));

    return (
        <div className="software-hosting-template">
            {/* Banner */}
            <section className="sh-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container">
                    <div className="row sh-contbaner-inner sem-baner-inner tx-wht mx-975">
                        <div className="bl-box col-sm-12 col-lg-12">
                            <div className="wd-100 text-center">
                                <h1 dangerouslySetInnerHTML={{ __html: title }} />
                                {acf.banner_content && <div dangerouslySetInnerHTML={{ __html: acf.banner_content }} />}
                                {acf.banner_subcontent && <div dangerouslySetInnerHTML={{ __html: acf.banner_subcontent }} />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="sh-sec-softwrehost sec-padd ed_section">
                <div className="container">
                    <div className="row sh-sftwrehst-inner2 sm-leftcnt-box tx-16">
                        {services.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-12 col-sm-6 col-md-6 col-lg-4">
                                <div className="wd-100">
                                    {row.imgUrl && (
                                        <div className="rounded-circle">
                                            <img src={row.imgUrl} className="img-fluid" alt="" />
                                        </div>
                                    )}
                                    {row.service_title && <h4>{row.service_title}</h4>}
                                    {row.service_content && <div dangerouslySetInnerHTML={{ __html: row.service_content }} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Software to Choose */}
            <section className="sh-sec-softwrchose sec-padd ed_section bg-blue">
                <div className="container">
                    <div className="row sh-softwrchose-inner1 tx-wht">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            {acf.software_in_swedish_data_title && (
                                <div className="wd-100">
                                    <h2>{acf.software_in_swedish_data_title}</h2>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bl-grid5 ia-softwrchose-inner2">
                        {softwareLogos.map((row: any, i: number) => (
                            <div key={i} className="swiper-slide wd-100">
                                <img src={row.imgUrl} className="mx-100" alt="" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Get a Quote */}
            <section className="hm-sec-getaquote ed_section mb-gap0">
                <div className="container-fluid">
                    <div className="row hm-getaquote-inner">
                        <div className="bl-box col-sm-12 col-lg-6">
                            {getQuoteImg && (
                                <div className="wd-100">
                                    <img src={getQuoteImg} className="img-fluid" alt="" />
                                </div>
                            )}
                        </div>
                        <div className="bl-box col-sm-12 col-lg-6 hm-col-frm sh-col-form">
                            <div className="wd-100">
                                {acf.get_a_quote_title && <h2>{acf.get_a_quote_title}</h2>}
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
