import Link from 'next/link';
import { getMedia, renderShortcode } from '../../lib/wp';

export default async function Backup({ page }: { page: any }) {
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
    const sustainableBg = await resolveImage(acf.sustainable_background_image);

    // Resolve repeater images
    const backupServices = await Promise.all((acf.backup_services || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.backup_services_image)
    })));

    const sustainableBoxes = await Promise.all((acf.sustainable_boxes || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.box_image)
    })));

    // Shortcode
    const shortcodeHtml = acf.storage_request_form_shortcode
        ? await renderShortcode(acf.storage_request_form_shortcode)
        : '';

    return (
        <div className="backup-template">
            {/* Banner */}
            <section className="sh-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container">
                    <div className="row sh-contbaner-inner sem-baner-inner tx-wht mx-975">
                        <div className="bl-box col-sm-12 col-lg-12">
                            <div className="wd-100 text-center">
                                <h1 dangerouslySetInnerHTML={{ __html: title }} />
                                {acf.banner_subtitle && <p>{acf.banner_subtitle}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Backup Services */}
            <section className="str-sec-backup sec-padd ed_section">
                <div className="container">
                    <div className="row str-backup-inner">
                        <div className="bl-box col-sm-12 col-md-12">
                            <div className="wd-100">
                                {acf.banner_content && <div dangerouslySetInnerHTML={{ __html: acf.banner_content }} />}
                                {acf.banner_subcontent && <div dangerouslySetInnerHTML={{ __html: acf.banner_subcontent }} />}
                                {acf.banner_subcontents && <div dangerouslySetInnerHTML={{ __html: acf.banner_subcontents }} />}
                            </div>
                        </div>
                    </div>
                    <div className="row str-sftwrehst-inner2 sm-centercnt-box tx-16">
                        {backupServices.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-12 col-sm-6 col-md-6 col-lg-4">
                                <div className="wd-100">
                                    {row.imgUrl && (
                                        <div className="rounded-circle">
                                            <img src={row.imgUrl} className="img-fluid" alt="" />
                                        </div>
                                    )}
                                    {row.backup_services_title && <h4>{row.backup_services_title}</h4>}
                                    {row.backup_services_content && <div dangerouslySetInnerHTML={{ __html: row.backup_services_content }} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sustainable Cloud Services */}
            <section className="hm-sec-sustainable bkp-sec-sustainable sec-padd ed_section bl-overlay"
                style={{ backgroundImage: `url('${sustainableBg}')` }}>
                <div className="container">
                    <div className="row hm-Sustinble-inner1">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-8 tx-wht">
                            <div className="wd-100 tx-20 fade-in-left">
                                {acf.sustainable_section_heading && <h2>{acf.sustainable_section_heading}</h2>}
                                {acf.sustainable_section_paragraph && <p>{acf.sustainable_section_paragraph}</p>}
                                {acf.sustainable_section_author && <h5>{acf.sustainable_section_author}</h5>}
                            </div>
                        </div>
                    </div>

                    <div className="row hm-Sustinble-inner top-round whtbx-inner tx-center">
                        {sustainableBoxes.map((box: any, i: number) => (
                            <div key={i} className="bl-box col-sm-6 col-lg-4">
                                <div className="wd-100">
                                    {box.imgUrl && (
                                        <div className="rounded-circle">
                                            <img src={box.imgUrl} className="img-fluid" alt="" />
                                        </div>
                                    )}
                                    {box.box_description && (
                                        <div className="box-description" dangerouslySetInnerHTML={{ __html: box.box_description }} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Request a Quote */}
            <section className="bkp-sec-bkmeetings sec-padd ed_section">
                <div className="container">
                    <div className="row pbs-bkmeting-inner mx-975">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-12">
                            <div className="wd-100 pr-lg-2 mb-3 text-center">
                                {acf.storage_request_heading && <h2>{acf.storage_request_heading}</h2>}
                            </div>
                            <div className="wd-100">
                                <div dangerouslySetInnerHTML={{ __html: shortcodeHtml }} suppressHydrationWarning />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
