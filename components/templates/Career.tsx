import Link from 'next/link';
import { getMedia } from '../../lib/wp';
import CareerContactForm from '../CareerContactForm';

export default async function Career({ page, lang = 'en' }: { page: any; lang?: string }) {
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

    const featuredJobs = await Promise.all((acf.featured_jobs || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.featured_jobs_image_)
    })));

    const galleryImages = await Promise.all((acf.gallery_images_ || []).map(async (img: any) => ({
        imgUrl: await resolveImage(img),
        alt: img?.alt || '',
    })));

    const embodyListing = acf.embody_listing || [];

    return (
        <div className="career-template">
            {/* Banner */}
            <section className="ab-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container">
                    <div className="row ab-contbaner-inner sem-baner-inner tx-wht">
                        <div className="bl-box col-sm-12 col-lg-12">
                            <div className="wd-100 text-center">
                                <h1 dangerouslySetInnerHTML={{ __html: title }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Jobs */}
            <section className="ia-sec-Software cr-sec-doyuwnt sec-padd ed_section">
                <div className="container">
                    <div className="row ia-sftwrehtx-inner1 cer-doyuwnt-inner1">
                        <div className="bl-box col-sm-12 col-md-12 mx-800">
                            <div className="wd-100 text-center tx-20">
                                {acf.featured_jobs_title && <h3>{acf.featured_jobs_title}</h3>}
                                {acf.featured_jobs_subtitle && <p>{acf.featured_jobs_subtitle}</p>}
                            </div>
                        </div>
                    </div>
                    {featuredJobs.length > 0 && (
                        <div className="row ia-sftwrehst-inner2 cer-doyuwnt-inner2">
                            {featuredJobs.map((row: any, i: number) => (
                                <div key={i} className="bl-box col-12 col-sm-6 col-md-6 col-lg-4">
                                    <div className="wd-100">
                                        {row.imgUrl && <img src={row.imgUrl} className="img-fluid" alt="" />}
                                        {row.featured_jobs_title && <h4>{row.featured_jobs_title}</h4>}
                                        {row.featured_jobs_subtitle && <p>{row.featured_jobs_subtitle}</p>}
                                        {row.contact_button && (
                                            <Link href={row.contact_button.url || '#'} className="btn">
                                                {row.contact_button.title}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Gallery Slider */}
            {galleryImages.length > 0 && (
                <section className="cr-sec-carerimg ed_section">
                    <div className="container">
                        <div className="row cr-carerimg-inner1">
                            <div className="bl-box col-sm-12 col-md-12">
                                <div className="wd-100">
                                    <div className="swiper cr-imgcrr">
                                        <div className="swiper-wrapper">
                                            {galleryImages.map((img: any, i: number) => (
                                                <div key={i} className="swiper-slide wd-100">
                                                    <img src={img.imgUrl} alt={img.alt} className="ig-100" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="swiper-pagination"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Together At */}
            <section className="cr-sec-together sm-padd ed_section">
                <div className="container">
                    <div className="row cr-together-inner">
                        <div className="bl-box col-sm-12 col-md-12">
                            <div className="wd-100 tx-20 tx-wht">
                                {acf.customer_support_title && <h3>{acf.customer_support_title}</h3>}
                                {acf.customer_support_content && <p>{acf.customer_support_content}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* We Embody Our Values */}
            {embodyListing.length > 0 && (
                <section className="cr-sec-weemnody pt-0 sec-padd ed_section">
                    <div className="container">
                        <div className="row cr-weemnody-inner mb-4">
                            <div className="bl-box col-sm-12 col-md-12">
                                <div className="wd-100 tx-20">
                                    {acf.embody__title && <h3>{acf.embody__title}</h3>}
                                </div>
                            </div>
                        </div>
                        <div className="grid-section cr-weemnody-inner2">
                            {embodyListing.map((row: any, i: number) => (
                                <div key={i} className="bl-box">
                                    <div className="wd-100 grid-box">
                                        {row.em_title && <h4>{row.em_title}</h4>}
                                        {row.em_descprition && <p>{row.em_descprition}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Career Form */}
            <section className="cr-sec-carerfrm bg-light sec-padd ed_section">
                <div className="container">
                    <div className="row cr-carerfrm-inner">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-12">
                            <div className="wd-100 pr-lg-2">
                                {acf.career_form_title && <h3>{acf.career_form_title}</h3>}
                            </div>
                        </div>
                        <div className="bl-box col-sm-12 col-md-12 col-lg-12">
                            <div className="wd-100">
                                <CareerContactForm lang={lang} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
