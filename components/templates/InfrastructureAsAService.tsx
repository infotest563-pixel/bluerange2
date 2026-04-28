import Link from 'next/link';
import React from 'react';
import { getMedia } from '../../lib/wp';

export default async function InfrastructureAsAService({ page }: { page: any }) {
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

    const bannerBg = await resolveImage(acf.baner_background_image);

    // Gallery
    const galleryImages = await Promise.all((acf.gallery_images || []).map(async (row: any) => ({
        ...row,
        imgUrl: await resolveImage(row)
    })));

    // Helper for rendering icons
    const renderClientCell = (value: string) => {
        if (value === 'tick') return <i className="fa fa-check" aria-hidden="true"></i>;
        if (value === 'cross') return <i className="fa fa-times" aria-hidden="true"></i>;
        return null;
    };

    const renderNetworkCell = (professional: string) => {
        const val = (professional || '').toLowerCase();
        if (val === 'tick') return <i className="fa fa-check" aria-hidden="true"></i>;
        if (val === 'cross') return <i className="fa fa-times" aria-hidden="true"></i>;
        return professional;
    };

    const renderServerCell = (cellType: string, cellText: string) => {
        if (cellType === 'tick') return <i className="fa fa-check" aria-hidden="true"></i>;
        if (cellType === 'cross') return <i className="fa fa-times" aria-hidden="true"></i>;
        return cellText;
    };

    return (
        <div className="infrastructure-template">
            {/* Banner */}
            <section className="ia-sec-srcbanner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: `url('${bannerBg}')` }}>
                <div className="container">
                    <div className="row ia-contbaner-inner sem-baner-inner tx-wht mx-975">
                        <div className="bl-box col-sm-12 col-lg-12">
                            <div className="wd-100 text-center">
                                <h1 dangerouslySetInnerHTML={{ __html: title }} />
                                {acf.banner_content && <div dangerouslySetInnerHTML={{ __html: acf.banner_content }} />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Blocks (Proactive) */}
            <section className="iaf-sec-proactive sec-padd ed_section">
                <div className="container">
                    <div className="row iaf-practiv-inner1 smll_titl">
                        <div className="bl-box col-sm-12 col-md-12 text-center">
                            <div className="wd-100 mx-800">
                                {acf.title && <h2>{acf.title}</h2>}
                            </div>
                        </div>
                    </div>

                    <div className="row lcl-catin-inner2 iaf-practiv-inner2">
                        {acf.content_blocks?.map((row: any, i: number) => (
                            <div key={i} className="bl-box col-12 col-sm-6 col-md-6 col-lg-4">
                                <div className="wd-100">
                                    <p>{row.content_text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Logo Slider */}
            <section className="iaf-sec-infralogos ed_section">
                <div className="container">
                    <div className="row ifa-infralogos-inner1 mb-4">
                        <div className="bl-box col-12 col-lg-12">
                            <div className="wd-100">
                                <div className="swiper sat-securlog">
                                    <div className="swiper-wrapper">
                                        {galleryImages.map((img: any, i: number) => (
                                            <div key={i} className="swiper-slide wd-100">
                                                <img src={img.imgUrl} alt={img.alt} className="mx-100" />
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

            {/* Client Table */}
            <section className="ia-sec-client ed_section sec-padd">
                <div className="container">
                    <div className="row ia-client-inner1 mb-4">
                        <div className="bl-box col-12 col-lg-12">
                            <div className="wd-100">
                                {acf.client_table_title && <h2>{acf.client_table_title}</h2>}
                            </div>
                        </div>
                    </div>

                    <div className="row ia-client-inner1">
                        <div className="bl-box col-12 col-lg-12">
                            <div className="wd-100 ia-clenttable ia-infra_sametable same_tables">
                                <table>
                                    <thead className="thead-dark">
                                        <tr>
                                            <th scope="col"><p></p></th>
                                            <th scope="col"><p>Antivirus</p></th>
                                            <th scope="col"><p>Essentials</p></th>
                                            <th scope="col"><p>Professional</p></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {acf.client_table?.map((row: any, i: number) => (
                                            <tr key={i}>
                                                <th scope="row">{row.feature}</th>
                                                <td>{renderClientCell(row.antivirus)}</td>
                                                <td>{renderClientCell(row.essentials)}</td>
                                                <td>{renderClientCell(row.professional)}</td>
                                            </tr>
                                        ))}
                                        {/* Price Row */}
                                        <tr className="tr-price">
                                            <th scope="row">Price per month</th>
                                            <td>{acf.price_antivirus}</td>
                                            <td>{acf.price_essentials}</td>
                                            <td>{acf.price_professional}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Network Features Table */}
            <section className="ia-sec-network pt-0 ed_section sec-padd">
                <div className="container">
                    <div className="row ia-network-inner1 mb-4">
                        <div className="bl-box col-12 col-lg-12">
                            <div className="wd-100">
                                {acf.network_section_title && <h2>{acf.network_section_title}</h2>}
                            </div>
                        </div>
                    </div>
                    <div className="row ia-network-inner1">
                        <div className="bl-box col-12 col-lg-12">
                            <div className="wd-100 ia-ntwrktable ia-infra_sametable same_tables">
                                <table>
                                    <thead className="thead-dark">
                                        <tr>
                                            <th scope="col"><p></p></th>
                                            <th scope="col"><p>{acf.network_table_headers}</p></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {acf.network_features?.map((row: any, i: number) => (
                                            <tr key={i}>
                                                <th scope="row">{row.feature_name}</th>
                                                <td>{renderNetworkCell(row.professional)}</td>
                                            </tr>
                                        ))}

                                        {/* Price Row */}
                                        {acf.price_row_title && acf.price && (
                                            <tr className="tr-price">
                                                <th scope="row">{acf.price_row_title}</th>
                                                <td>{acf.price}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Servers IA Table */}
            <section className="ia-sec-serversia pt-0 ed_section sec-padd">
                <div className="container">
                    <div className="row ia-serveria-inner1 mb-4">
                        <div className="bl-box col-12 col-lg-12">
                            <div className="wd-100">
                                {acf.server_table_title && <h2>{acf.server_table_title}</h2>}
                            </div>
                        </div>
                    </div>

                    <div className="row ia-serveria-inner1">
                        <div className="bl-box col-12 col-lg-12">
                            <div className="wd-100 ia-srvrtable ia-infra_sametable same_tables">
                                <table>
                                    <thead className="thead-dark">
                                        <tr>
                                            <th scope="col"><p></p></th>
                                            {acf.server_table_columns?.map((col: any, i: number) => (
                                                <th scope="col" key={i}><p>{col.column_name}</p></th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {acf.server_table_sections?.map((section: any, i: number) => (
                                            <React.Fragment key={i}>
                                                <tr>
                                                    <td className="table-section-header" scope="row" colSpan={(acf.server_table_columns?.length || 0) + 1}>
                                                        <h5>{section.section_title}</h5>
                                                    </td>
                                                </tr>
                                                {section.section_rows?.map((row: any, j: number) => (
                                                    <tr key={`sec-${i}-row-${j}`}>
                                                        <th scope="row">{row.row_label}</th>
                                                        {row.row_cells?.map((cell: any, k: number) => (
                                                            <td key={k}>
                                                                {renderServerCell(cell.cell_type, cell.cell_text)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}

                                        {/* Price Row */}
                                        {acf.price_row && (
                                            <tr className="tr-price">
                                                <th scope="row">Price per month</th>
                                                {acf.price_row?.map((price: any, i: number) => (
                                                    <td key={i}>{price.price_text}</td>
                                                ))}
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
