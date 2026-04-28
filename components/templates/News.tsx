import Link from 'next/link';

export default async function News({ page }: { page: any }) {
    // Note: The original news.php template seems to have hardcoded content and references to WP sidebars / dynamic outputs 
    // that are more complex to replicate in headless without fetching posts. 

    // For now, we will structure the static parts. 
    // In a real headless implementation, "News" would likely need to fetch a list of posts.
    // The provided PHP template shows a mix of hardcoded HTML structure (repeating news boxes) and dynamic sidebar.
    // I will replicate the structure. If dynamic posts are needed, they should be fetched via API.

    // I will placeholder the news items with static content from the template or empty loops for now,
    // assuming the expectation is structure migration.

    return (
        <div className="news-template">
            {/* News Banner */}
            <section className="nw-sec-newsbner sem-sec-baner ed_section sec-padd bl-overlay"
                style={{ backgroundImage: "url('/wp-content/uploads/2023/09/vertual.jpg')" }}>
                <div className="container">
                    <div className="row nw-newsbner-inner sem-baner-inner tx-wht">
                        <div className="bl-box col-sm-12 col-lg-12">
                            <div className="wd-100 text-center">
                                <h1>News</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* News Box */}
            <section className="nw-sec-newsboxx sec-padd ed_section">
                <div className="container">
                    <div className="row nw-newsboxx-inner">
                        <div className="bl-box col-sm-12 col-md-12 col-lg-8">
                            <div className="wd-100">
                                <div className="row nw-newsbox">
                                    {/* Placeholder for Dynamic News Loop */}
                                    {/* This mimics the hardcoded blocks in original PHP, repeated 10 times in original */}
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="bl-box col-sm-12 col-md-12 col-lg-6">
                                            <div className="wd-100">
                                                <a href="#"><img src="/wp-content/uploads/2023/09/take-your.png" className="ig-100" /></a>
                                                <div className="nw-nextx">
                                                    <a href="#"><h4>How to Use Schema Markup our news</h4></a>
                                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, eiusmod tempor incididunt labore et dolore</p>
                                                    <a href="#" className="btn">Continue Reading</a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Placeholder */}
                        {/* dynamic_sidebar( 'sidebar-1' ) logic is server-side PHP. We'd need to fetch widgets or recreate. */}
                        <div className="bl-box col-sm-12 col-md-12 col-lg-4">
                            <div className="wd-100">
                                <div className="nw-catgroes nw-sidebx">
                                    <h3>Categories</h3>
                                    <ul>
                                        <li><a href="#">Beauty</a> (1)</li>
                                        <li><a href="#">Business</a> (4)</li>
                                        <li><a href="#">Food & Drink</a> (1)</li>
                                        <li><a href="#">Lifestyle</a> (2)</li>
                                        <li><a href="#">Motivation</a> (1)</li>
                                        <li><a href="#">Uncategorized</a> (1)</li>
                                    </ul>
                                </div>
                                <div className="nw-poplr nw-sidebx">
                                    <h3>Popular Tags</h3>
                                    <ul>
                                        <li>Beauty</li>
                                        <li>Business</li>
                                        <li>Food & Drink</li>
                                        <li>Lifestyle</li>
                                        <li>Motivation</li>
                                        <li>Spain Travel</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
