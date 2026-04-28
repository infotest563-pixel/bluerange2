import Link from 'next/link';
import { getMedia } from '../../lib/wp';
import ContactForm from '../ContactForm';

export default async function SoftwareEntrepreneurs({ page }: { page: any }) {
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

    // Resolve repeater images
    const services = await Promise.all((acf.entrepreneual_services || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.entrepreneual_services_image)
    })));

    return (
        <div className="software-entrepreneurs-template">
            {/* Banner */}
            <section className="sh-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container">
                    <div className="row sh-contbaner-inner sem-baner-inner tx-wht mx-975">
                        <div className="bl-box col-sm-12 col-lg-12">
                            <div className="wd-100 text-center">
                                <h1 dangerouslySetInnerHTML={{ __html: title }} />
                                {acf.banner_content && <div dangerouslySetInnerHTML={{ __html: acf.banner_content }} />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Entrepreneurs Services */}
            <section className="ia-sec-Software sec-padd ed_section">
                <div className="container">
                    <div className="row ia-sftwrehtx-inner1">
                        <div className="bl-box col-sm-12 col-md-12">
                            <div className="wd-100 text-center">
                                {acf.retain_control_title && <h2>{acf.retain_control_title}</h2>}
                                {acf.retain_control_content && <div dangerouslySetInnerHTML={{ __html: acf.retain_control_content }} />}
                            </div>
                        </div>
                    </div>

                    <div className="row ia-sftwrehst-inner2 sm-centercnt-box tx-16">
                        {services.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-12 col-sm-6 col-md-6 col-lg-4">
                                <div className="wd-100">
                                    {row.imgUrl && (
                                        <div className="rounded-circle">
                                            <img src={row.imgUrl} className="img-fluid" alt="" />
                                        </div>
                                    )}
                                    {row.entrepreneual_services_title && <h4>{row.entrepreneual_services_title}</h4>}
                                    {row.entrepreneual_services_content && <div dangerouslySetInnerHTML={{ __html: row.entrepreneual_services_content }} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Get in Touch */}
            <section className="all-sec-lastform-vs sec-padd">
                <div className="container">
                    <div className="row">
                        <div className="bl-box col-md-12">
                            <div className="wd-100 vs-getintouch-box">
                                <h2 className="mb-3 text-center">Get in touch</h2>
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
