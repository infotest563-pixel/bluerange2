import Link from 'next/link';
import { getMedia } from '../../lib/wp';
import DomainsContactForm from '../DomainsContactForm';
import DomainSearch from '../DomainSearch';
import { resolveUrl, getLang } from '../../lib/resolveUrl';

export default async function Domains({ page }: { page: any }) {
    const acf = page.acf;
    const lang = getLang(page);

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
        <div className="domains-template">
            {/* Domains Section */}
            <section className="hm-sec-takeyour web-hotel-takeyour sec-padd ed_section bl-overlay"
                style={{ backgroundImage: `url('${bgImage}')` }}>
                <div className="container">
                    <div className="row hm-takeyour-inner text-center">
                        <div className="bl-box col-md-12 tx-wht tx-21">
                            <div className="wd-100 fade-in-top">
                                {acf.title && <h2>{acf.title}</h2>}
                                <DomainSearch buttonText="Search Domain" />
                                {acf.extra_content && (
                                    <div className="extra-content" dangerouslySetInnerHTML={{ __html: acf.extra_content }} />
                                )}
                            </div>
                        </div>
                    </div>
                    {acf.button_link && acf.button_title && (
                        <div className="hm-takebtn-inner text-center">
                            <Link className="btn" href={resolveUrl(acf.button_link, lang)} role="button">
                                {acf.button_title}
                            </Link>
                        </div>
                    )}
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
