import { getSettings, getPageById } from '../lib/wp';
import { redirect } from 'next/navigation';

export default async function Home() {
  // Redirect root to /sv (Swedish is default)
  redirect('/sv');
}
