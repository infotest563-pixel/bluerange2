import Link from 'next/link';
import { getMedia } from '../../lib/wp';
import DomainsContactForm from '../DomainsContactForm';

export default async function Crowdsec({ page }: { page: any }) {
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

    const bgImage = await resolveImage(acf.bg_image);
    const crowdsecImage = await resolveImage(acf.crowdsec_image);

    const features = await Promise.all((acf.crowdsec_features || []).map(async (row: any) => ({
        ...row,
        iconUrl: await resolveImage(row.icon)
    })));

    return (
        <div className="crowdsec-template">
            {/* Banner */}
            <section className="crw-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bgImage}')` }}>
                <div className="container">
                    <div className="row crw-contbaner-inner sem-baner-inner tx-wht">
                        <div className="bl-box col-sm-12 col-lg-12 mx-975">
                            <div className="wd-100 text-center">
                                {acf.crowdsec_title && <h1>{acf.crowdsec_title}</h1>}
                                {acf.crowdsec_description && (
                                    <div className="page-content" dangerouslySetInnerHTML={{ __html: acf.crowdsec_description }} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Crowdsec Image */}
            <section className="crw-sec-discover sec-padd ed_section">
                <div className="container">
                    <div className="row crw-discover-inner">
                        <div className="bl-box col-12 col-sm-12">
                            <div className="wd-100">
                                {crowdsecImage && <img src={crowdsecImage} alt="" />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Crowdsec Features Box */}
            {features.length > 0 && (
                <section className="cre-sec-crowdsecbx ed_section">
                    <div className="container">
                        <div className="row cre-crowdsecbx-inner">
                            {features.map((row: any, i: number) => (
                                <div key={i} className="bl-box col-12 col-sm-6 col-md-6 col-lg-4">
                                    <div className="wd-100">
                                        <div className="rounded-circle">
                                            {row.iconUrl && <img src={row.iconUrl} alt="" className="img-fluid" />}
                                        </div>
                                        {row.crowdsec_title && <h4>{row.crowdsec_title}</h4>}
                                        {row.crowdsec_discription && <p>{row.crowdsec_discription}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Crowdsec Overview */}
            {acf.crowdsec_section && (
                <section className="cre-sec-overviwe sec-padd ed_section">
                    <div className="container">
                        <div className="row cre-overviwe-inner">
                            {acf.crowdsec_section.map((row: any, i: number) => (
                                <div key={i} className="bl-box col-12 col-sm-12 col-md-12 col-lg-6">
                                    <div className="wd-100">
                                        {row.overview_title && <h3>{row.overview_title}</h3>}
                                        {row.overview_discription && (
                                            <div dangerouslySetInnerHTML={{ __html: row.overview_discription }} />
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
