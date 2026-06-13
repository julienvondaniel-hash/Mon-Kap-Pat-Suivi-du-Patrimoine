import { createClient } from "@supabase/supabase-js";

// Les clés viennent de variables d'environnement (.env), JAMAIS en dur dans le code.
// La "anon key" est publique par nature : la sécurité repose sur les règles RLS
// de la base, pas sur le secret de cette clé. Ne jamais mettre la "service_role" ici.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "Supabase non configuré : copiez .env.example en .env et renseignez vos clés."
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "", {
  auth: {
    persistSession: true,       // garde la session entre les rechargements
    autoRefreshToken: true,     // renouvelle le token automatiquement
    detectSessionInUrl: true,
  },
});

export const isConfigured = Boolean(url && anonKey);
