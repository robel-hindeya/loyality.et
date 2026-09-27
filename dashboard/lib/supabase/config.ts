export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    anonKey &&
    !url.includes('your-project-id') &&
    !url.includes('placeholder-project') &&
    anonKey !== 'placeholder-anon-key'
  );
};
