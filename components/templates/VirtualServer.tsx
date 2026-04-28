import Link from 'next/link';
import { getMedia } from '../../lib/wp';
import ContactForm from '../ContactForm';
import { resolveUrl, getLang } from '../../lib/resolveUrl';

export default async function VirtualServer({ page }: { page: any }) {
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

    const bannerBg = await resolveImage(acf.seo_company_background_image);
    const bannerImg = await resolveImage(acf.seo_company_image);
    const takeFirstBg = await resolveImage(acf.take_your_first_background_image);

    const lang = getLang(page);

    // Resolve repeater images
    const flexibleScalable = await Promise.all((acf.flexible_and_scalable || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.flexible_and_scalable_image)
    })));

    const securityManagement = await Promise.all((acf.security_and_management || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.security_and_management_image)
    })));

    return (
        <div className="virtual-server-template">
            {/* Virtual Banner */}
            <section className="vs-sec-virtualbnr sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container">
                    <div className="row vs-virtualbnr-inner sem-baner-inner tx-wht">
                        <div className="bl-box col-sm-12 col-md-12">
                            <div className="wd-100 text-center">
                                {bannerImg && <img src={bannerImg} className="img-fluid" alt="" />}
                                {acf.seo_company_title && <h2>{acf.seo_company_title}</h2>}
                                {acf.seo_company_subtitle && <h5>{acf.seo_company_subtitle}</h5>}
                                {acf.seo_company_content && <div dangerouslySetInnerHTML={{ __html: acf.seo_company_content }} />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Flexible and Scalable */}
            <section className="vs-sec-flexible sec-padd ed_section">
                <div className="container">
                    <div className="row vs-flxibl-inner">
                        {flexibleScalable.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-sm-12 col-md-12">
                                <div className="wd-100 vs-bx-flebl">
                                    <div className="rounded-circle">
                                        {row.imgUrl && <img src={row.imgUrl} className="img-fluid" alt="" />}
                                    </div>
                                    <div className="vs-flebtx">
                                        <h4>{row.flexible_and_scalable_title}</h4>
                                        <div dangerouslySetInnerHTML={{ __html: row.flexible_and_scalable_content }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Service Level Agreement */}
            <section className="vs-sec-serviclvel sec-padd pt-0 ed_section">
                <div className="container text-center">
                    <div className="row vs-servilvl-inner">
                        <div className="bl-box col-sm-12 col-md-12">
                            <div className="wd-100">
                                {acf.service_level_agreement_title && <h2>{acf.service_level_agreement_title}</h2>}
                            </div>
                        </div>
                    </div>
                    <div className="row vs-servilvl-inner2 tx-wht">
                        {acf.service_level_agreement?.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-sm-12 col-md-12 col-lg-4" style={{ backgroundColor: row.service_level_backgroundcolor }}>
                                <div className="wd-100">
                                    <h4>{row.service_level_title}</h4>
                                    <div dangerouslySetInnerHTML={{ __html: row.service_level_content }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security and Management */}
            <section className="vs-sec-securitmg sec-padd pt-0 ed_section">
                <div className="container text-center">
                    <div className="row vs-secrtmg-inner1">
                        <div className="bl-box col-sm-12 col-md-12">
                            <div className="wd-100">
                                {acf.security_and_management_title && <h2>{acf.security_and_management_title}</h2>}
                            </div>
                        </div>
                    </div>
                    <div className="row vs-secrtmg-inner2 tx-16">
                        {securityManagement.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-sm-12 col-md-6 col-lg-4">
                                <div className="wd-100">
                                    <div className="rounded-circle">
                                        {row.imgUrl && <img src={row.imgUrl} className="img-fluid" alt="" />}
                                    </div>
                                    <h4>{row.security_and_management_title}</h4>
                                    <div dangerouslySetInnerHTML={{ __html: row.security_and_management_content }} />
                                </div>
                            </div>
                        ))}

                        <div className="bl-box col-sm-12 col-md-6 col-lg-4 vs-scrtig"
                            style={{ backgroundImage: `url('${takeFirstBg}')` }}>
                            <div className="wd-100 tx-wht">
                                {acf.take_your_first_title && <h3>{acf.take_your_first_title}</h3>}
                                {acf.contact_support && (
                                    <Link className="btn" href={resolveUrl(acf.contact_support.url, lang)} role="button">
                                        {acf.contact_support.title}
                                    </Link>
                                )}
                            </div>
                        </div>
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
