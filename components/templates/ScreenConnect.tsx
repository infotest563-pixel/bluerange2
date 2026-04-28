import DomainsContactForm from '../DomainsContactForm';

export default async function ScreenConnect({ page }: { page: any }) {
    const title = page.title?.rendered || '';
    const content = page.content?.rendered || '';

    return (
        <div className="screenconnect-template">
            {/* Page Content */}
            <main className="site-main" id="main">
                <article id={`post-${page.id}`} className="page type-page status-publish hentry">
                    {title && (
                        <header className="entry-header">
                            <div className="container">
                                <h1 className="entry-title" dangerouslySetInnerHTML={{ __html: title }} />
                            </div>
                        </header>
                    )}
                    {content && (
                        <div className="entry-content">
                            <div className="container">
                                <div dangerouslySetInnerHTML={{ __html: content }} />
                            </div>
                        </div>
                    )}
                </article>
            </main>

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
