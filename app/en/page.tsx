import { getSettings, getPageById } from '../../lib/wp';
import DesignedHomepage from '../../components/DesignedHomepage';

// ✅ ISR with on-demand revalidation
// Pages are static (fast) but revalidate when WordPress webhook fires
export const revalidate = 0; // Only revalidate via webhook

export default async function EnglishHome() {
  const settings = await getSettings('en');

  if (!settings?.page_on_front) {
    return <h1>WordPress Front Page not configured</h1>;
  }

  const page = await getPageById(settings.page_on_front, 'en');

  if (!page || !page.acf) {
    return <h1>ACF data missing on homepage</h1>;
  }

  return <DesignedHomepage page={page} lang="en" />;
}
