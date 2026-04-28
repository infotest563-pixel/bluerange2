import { getPageBySlug, getPostBySlug, getSettings } from '../../../lib/wp';
import { redirect, notFound } from 'next/navigation';
import WordPressPageRenderer from '../../../components/pages/WordPressPageRenderer';

// ✅ ISR: revalidate every 60 seconds after first visit
export const revalidate = 60;

// Generate static params for all English pages
export async function generateStaticParams() {
    try {
        const res = await fetch('https://dev-bluerange.pantheonsite.io/wp-json/wp/v2/pages?per_page=100&lang=en');
        const pages = await res.json();
        
        return pages.map((page: any) => ({
            slug: page.slug,
        }));
    } catch (error) {
        console.error('Error generating static params for English:', error);
        return [];
    }
}

// Enable dynamic rendering for pages not in generateStaticParams
export const dynamicParams = true;

export default async function EnglishPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Prevent massive redirect loops if slug is 'home' or empty
    if (slug === 'home') {
        redirect('/en');
    }

    const settings = await getSettings('en');

    // 1. Try Page with English language
    let data = await getPageBySlug(slug, 'en');
    let type = 'page';

    // 2. Try Post if Page not found
    if (!data) {
        data = await getPostBySlug(slug, 'en');
        type = 'post';
    }

    // 3. 404 if neither
    if (!data) {
        notFound();
    }

    // 4. Redirect if this is actually the homepage
    if (type === 'page' && data.id === settings.page_on_front) {
        redirect('/en');
    }

    // 5. Render Page via Engine
    if (type === 'page') {
        return <WordPressPageRenderer page={data} />;
    }

    // 6. Render Post (Generic fallback for posts)
    const post = data as any;
    return (
        <main className="site-main" id="main">
            <article id={`post-${post.id}`} className={`${type} type-${type} status-publish hentry`}>
                <header className="entry-header">
                    <div className="container">
                        <h1 className="entry-title" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                    </div>
                </header>

                <div className="entry-content">
                    <div className="container">
                        <div dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
                    </div>
                </div>
            </article>
        </main>
    );
}
