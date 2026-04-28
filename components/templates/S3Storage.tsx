import { getMedia } from '../../lib/wp';
import S3ContactForm from '../S3ContactForm';

export default async function S3Storage({ page, lang = 'en' }: { page: any; lang?: string }) {
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

    const bannerBg = await resolveImage(acf.background_image);

    const features = await Promise.all((acf.s3_storage_features || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.s3_storage_image)
    })));

    const subheading = lang === 'sv'
        ? 'Vi svarar inom 24 timmar'
        : 'Request will be answered within 24 hours';

    return (
        <div className="s3-storage-template">
            {/* Banner */}
            <section className="str-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url(${bannerBg})` }}>
                <div className="container">
                    <div className="row str-contbaner-inner sem-baner-inner tx-wht mx-975">
                        <div className="bl-box col-sm-12 col-lg-12">
                            <div className="wd-100 text-center">
                                <h1 dangerouslySetInnerHTML={{ __html: title }} />
                                {acf.banner_subtitle && <p>{acf.banner_subtitle}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What is S3 Object Storage? */}
            <section className="str-sec-whtobject sec-padd ed_section">
                <div className="container">
                    <div className="row str-whtobject-inner">
                        <div className="bl-box col-12 col-sm-6 col-md-6 col-lg-6 str-wtob1">
                            <div className="wd-100">
                                {acf.what_is_s3_title && <h4>{acf.what_is_s3_title}</h4>}
                                {acf.s3_object_storage && <p>{acf.s3_object_storage}</p>}
                            </div>
                        </div>
                        <div className="bl-box col-12 col-sm-6 col-md-6 col-lg-6 str-wtob2">
                            <div className="wd-100">
                                {acf.bluerange_offers && <p>{acf.bluerange_offers}</p>}
                                {acf.store_virtually && <p>{acf.store_virtually}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* S3 Storage you can trust */}
            <section className="str-sec-cantrust sec-padd pt-0 ed_section">
                <div className="container">
                    <div className="row str-cantrust-inner1 smll_titl">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            <div className="wd-100">
                                <h2>
                                    {acf.s3_storage_text} <span>{acf.you_can_trust_text}</span>
                                </h2>
                                {acf.s3_storage_subtitle && <p>{acf.s3_storage_subtitle}</p>}
                            </div>
                        </div>
                    </div>
                    <div className="row str-sftwrehst-inner2 sm-centercnt-box tx-16">
                        {features.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-12 col-sm-6 col-md-6 col-lg-4">
                                <div className="wd-100">
                                    {row.imgUrl && (
                                        <div className="rounded-circle">
                                            <img src={row.imgUrl} className="img-fluid" alt="" />
                                        </div>
                                    )}
                                    {row.s3_storage_title && <h4>{row.s3_storage_title}</h4>}
                                    {row.s3_storage_subtitle && <p>{row.s3_storage_subtitle}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form */}
            <section className="colc-sec-bkmeetings sec-padd pt-0 ed_section">
                <div className="container">
                    <div className="row pbs-bkmeting-inner mx-975">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-12">
                            <div className="wd-100 pr-lg-2 mb-3 text-center">
                                {acf.colc_heading && <h2>{acf.colc_heading}</h2>}
                                {/* <p>{subheading}</p> */}
                            </div>
                            <div className="wd-100">
                                <S3ContactForm lang={lang} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
