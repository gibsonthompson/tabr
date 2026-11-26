// Deletes the calling user's tabr account (App Store requires in-app account deletion).
// The sign-in pool is shared with other apps in this Supabase project, so:
//   1. every tabr_ row for the user is always deleted
//   2. the login itself is deleted only if no other app uses it
import { createClient } from 'npm:@supabase/supabase-js@2';

const TABR_TABLES = [
  'tabr_sync_events',
  'tabr_integrations', // tokens cascade
  'tabr_curriculum_items',
  'tabr_curricula',
  'tabr_lesson_attempts',
  'tabr_mastery_evidence',
  'tabr_practice_items',
  'tabr_practice_sessions',
  'tabr_assessments',
  'tabr_skill_mastery',
  'tabr_repertoire',
  'tabr_equipment',
  'tabr_profiles',
];

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Not signed in' }, 401);

  const url = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) return json({ error: 'Not signed in' }, 401);
  const userId = userData.user.id;

  for (const table of TABR_TABLES) {
    const { error } = await admin.from(table).delete().eq('user_id', userId);
    if (error) return json({ error: `Could not delete ${table}: ${error.message}` }, 500);
  }

  const [iron, biz, resto] = await Promise.all([
    admin.from('iron_profiles').select('user_id', { count: 'exact', head: true }).eq('user_id', userId),
    admin.from('businesses').select('id', { count: 'exact', head: true }).eq('owner_id', userId),
    admin.from('resto_org_members').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);
  const lookupFailed = [iron, biz, resto].some((r) => r.error);
  const usedElsewhere = lookupFailed || (iron.count ?? 0) + (biz.count ?? 0) + (resto.count ?? 0) > 0;

  if (!usedElsewhere) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return json({ error: `tabr data deleted, but the login could not be removed: ${error.message}` }, 500);
  }

  return json({ deleted: true, loginRemoved: !usedElsewhere });
});
