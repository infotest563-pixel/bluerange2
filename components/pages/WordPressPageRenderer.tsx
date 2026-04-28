import VirtualServer from '../templates/VirtualServer';
import CoLocation from '../templates/CoLocation';
import S3Storage from '../templates/S3Storage';
import Backup from '../templates/Backup';
import InfrastructureAsAService from '../templates/InfrastructureAsAService';
import SoftwareHostingAsAService from '../templates/SoftwareHostingAsAService';
import SoftwareEntrepreneurs from '../templates/SoftwareEntrepreneurs';
import OurPartners from '../templates/OurPartners';
import Microsoft365 from '../templates/Microsoft365';
import WebHotel from '../templates/WebHotel';
import Domains from '../templates/Domains';
import Broadband from '../templates/Broadband';
import Crowdsec from '../templates/Crowdsec';
import SecurityAwarenessTraining from '../templates/SecurityAwarenessTraining';
import PublicSector from '../templates/PublicSector';
import About from '../templates/About';
import Career from '../templates/Career';
import KubernetesAsAService from '../templates/KubernetesAsAService';
import SwedishCloud from '../templates/SwedishCloud';
import ContactUs from '../templates/ContactUs';
import News from '../templates/News';
import Products from '../templates/Products';
import Services from '../templates/Services';
import ScreenConnect from '../templates/ScreenConnect';
import { replaceWpImagesInHtml } from '../../lib/localImage';


export default function WordPressPageRenderer({ page }: { page: any }) {
    const slug = page.slug;

    // Detect language from page link or lang field
    const lang: string = page.lang
        || (typeof page.link === 'string' && page.link.includes('/sv/') ? 'sv' : 'en');

    // Route to specific template components based on slug
    switch (slug) {
        case 'virtual-server':
        case 'virtuell-server':
            return <VirtualServer page={page} />;
        case 'co-location':
        case 'colocation':
            return <CoLocation page={page} />;
        case 's3-storage':
        case 's3-lagring':
            return <S3Storage page={page} lang={lang} />;
        case 'backup':
            return <Backup page={page} />;
        case 'infrastructure-as-a-service':
        case 'infrastruktur-som-en-tjanst':
            return <InfrastructureAsAService page={page} />;
        case 'software-hosting-as-a-service':
        case 'programvaruhosting-som-en-tjanst':
            return <SoftwareHostingAsAService page={page} />;
        case 'software-entrepreneurs':
        case 'programvaruentreprenorer':
            return <SoftwareEntrepreneurs page={page} />;
        case 'our-partners':
        case 'vara-partners':
            return <OurPartners page={page} />;
        case 'microsoft-365':
            return <Microsoft365 page={page} />;
        case 'web-hotel':
        case 'web-hosting':
        case 'webbhotell':
            return <WebHotel page={page} />;
        case 'domains':
        case 'domaner':
            return <Domains page={page} />;
        case 'broadband':
        case 'bredband-se':
            return <Broadband page={page} />;
        case 'crowdsec':
            return <Crowdsec page={page} />;
        case 'sercurity-awarness-training':
        case 'security-awareness-training':
        case 'sakerhetsmedvetenhetsutbildning':
            return <SecurityAwarenessTraining page={page} />;
        case 'public-sector':
        case 'offentlig-sektor':
            return <PublicSector page={page} />;
        case 'about-bluerange':
        case 'about':
        case 'om-bluerange':
            return <About page={page} />;
        case 'career':
        case 'karriar':
            return <Career page={page} lang={lang} />;
        case 'kubernetes-as-a-service':
        case 'kubernetes-som-tjanst':
            return <KubernetesAsAService page={page} />;
        case 'swedish-cloud':
            return <SwedishCloud page={page} />;
        case 'contact-us':
        case 'kontakta-oss':
            return <ContactUs page={page} />;
        case 'news':
        case 'nyheter':
            return <News page={page} />;
        case 'products':
        case 'produkter':
            return <Products page={page} />;
        case 'services':
        case 'tjanster':
            return <Services page={page} />;
        case 'screenconnect':
            return <ScreenConnect page={page} />;

        // TODO: Implement other pages
        // case 'backup': return <Backup page={page} />;
        // ...

        default:
            // Generic Fallback (Gutenberg Content)
            return (
                <main className="site-main" id="main">
                    <article id={`post-${page.id}`} className={`page type-page status-publish hentry`}>
                        <header className="entry-header">
                            <div className="container">
                                <h1 className="entry-title" dangerouslySetInnerHTML={{ __html: page.title.rendered }} />
                            </div>
                        </header>
                        <div className="entry-content">
                            <div className="container">
                                <div dangerouslySetInnerHTML={{ __html: replaceWpImagesInHtml(page.content.rendered) }} />
                            </div>
                        </div>
                    </article>
                </main>
            );
    }
}
