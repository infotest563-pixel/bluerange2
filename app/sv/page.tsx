import { getSettings, getPageById } from '../../lib/wp';
import DesignedHomepage from '../../components/DesignedHomepage';

// ✅ ISR: revalidate this page every 60 seconds
export const revalidate = 60;

export default async function SwedishHome() {
  const settings = await getSettings('sv');

  if (!settings?.page_on_front) {
    return <h1>WordPress Front Page not configured</h1>;
  }

  const page = await getPageById(settings.page_on_front, 'sv');

  if (!page || !page.acf) {
    return <h1>ACF data missing on homepage</h1>;
  }

  // If SV page has no address data, fall back to EN address data
  if (!(page.acf as any).address || (page.acf as any).address.length === 0) {
    const enSettings = await getSettings('en');
    if (enSettings?.page_on_front) {
      const enPage = await getPageById(enSettings.page_on_front, 'en');
      if (enPage && (enPage?.acf as any)?.address) {
        (page.acf as any).address = (enPage.acf as any).address;
      }
    }
  }

  return <DesignedHomepage page={page} lang="sv" />;
}
