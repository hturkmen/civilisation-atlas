import {parseView} from '@atlas/domain/catalog';
import {catalog} from '@/lib/catalog';
import {Explorer} from '@/components/explorer';

export const dynamic = 'force-dynamic';

export default async function Page({searchParams}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const values = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === 'string') params.set(key, value);
  }
  // Current civil year only. Ancient years always use @atlas/domain/chronology.
  const maxYear = new Date().getUTCFullYear();
  return <Explorer catalog={catalog} maxYear={maxYear} initialView={parseView(params, maxYear, catalog.places)} />;
}
