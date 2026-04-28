import React from 'react';
import Link from 'next/link';
import { getMedia } from '../../lib/wp';

export default async function KubernetesAsAService({ page }: { page: any }) {
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

    const services = await Promise.all((acf.kubernetes_services || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row.kubernetes_services_image)
    })));

    return (
        <div className="kubernetes-template">
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

            {/* Kubernetes as a service Grid */}
            <section className="ia-sec-kubernetes sec-padd ed_section">
                <div className="container">
                    {services.length > 0 && (
                        <div className="row ia-sftwrehst-inner2 sm-centercnt-box tx-16">
                            {services.map((row: any, i: number) => (
                                <div key={i} className="bl-box col-12 col-sm-6 col-md-6 col-lg-4">
                                    <div className="wd-100">
                                        {row.imgUrl && (
                                            <div className="rounded-circle">
                                                <img src={row.imgUrl} className="img-fluid" alt="" />
                                            </div>
                                        )}
                                        {row.kubernetes_services_title && <h4>{row.kubernetes_services_title}</h4>}
                                        {row.kubernetes_services_content && <p>{row.kubernetes_services_content}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
