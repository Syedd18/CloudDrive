import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'files';

if (!url || !anon) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env');
  process.exit(2);
}

const supabase = createClient(url, anon);

(async () => {
  try {
    console.log('Supabase URL:', url);
    console.log('Bucket:', bucket);
    const { data, error } = await supabase.storage.from(bucket).list('', { limit: 10 });
    if (error) {
      console.error('Storage list error:', error);
      process.exit(1);
    }
    console.log('List result:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
})();
