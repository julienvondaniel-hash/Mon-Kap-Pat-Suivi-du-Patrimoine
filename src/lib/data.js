import { supabase } from "./supabase";

/* ==========================================================================
   AUTHENTIFICATION
   ========================================================================== */

// Inscription. Les données d'identité passent en metadata : le trigger SQL
// handle_new_user() crée automatiquement la ligne dans `profiles`.
export async function signUp({ email, password, identity }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        civilite: identity.civilite,
        prenom: identity.prenom,
        nom: identity.nom,
        telephone: identity.telephone,
        date_naissance: identity.naissance || null,
        residence_fiscale: identity.residenceFiscale,
      },
    },
  });
  return { data, error };
}

export async function signIn({ email, password }) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Écoute les changements d'état (connexion/déconnexion/refresh).
export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

// Active une 2e étape (TOTP) — à appeler depuis les réglages de sécurité.
export async function enrollMfa() {
  return await supabase.auth.mfa.enroll({ factorType: "totp" });
}

/* ==========================================================================
   PROFIL
   ========================================================================== */
export async function getProfile(userId) {
  return await supabase.from("profiles").select("*").eq("id", userId).single();
}

/* ==========================================================================
   ACTIFS
   ========================================================================== */
export async function listAssets() {
  return await supabase.from("assets").select("*").order("value", { ascending: false });
}

export async function upsertAsset(asset) {
  const { id, ...rest } = asset;
  const session = await getSession();
  const payload = { ...rest, owner_id: session?.user?.id };
  if (id && typeof id === "string") {
    return await supabase.from("assets").update(payload).eq("id", id).select().single();
  }
  return await supabase.from("assets").insert(payload).select().single();
}

export async function deleteAsset(id) {
  return await supabase.from("assets").delete().eq("id", id);
}

/* ==========================================================================
   SIMULATIONS SCI À L'IS
   ========================================================================== */
export async function saveSciSimulation({ label, params, resultTri }) {
  const session = await getSession();
  return await supabase.from("sci_simulations").insert({
    owner_id: session?.user?.id,
    label,
    params,
    result_tri: resultTri,
  }).select().single();
}

export async function listSciSimulations() {
  return await supabase.from("sci_simulations").select("*").order("created_at", { ascending: false });
}

/* ==========================================================================
   CONSENTEMENTS (RGPD) — on insère, on ne modifie jamais
   ========================================================================== */
const POLICY_VERSION = "2026-06"; // à incrémenter quand la politique change

export async function recordConsent({ userId, type, granted }) {
  return await supabase.from("consents").insert({
    user_id: userId,
    type,                       // 'cgu' | 'data_processing' | 'marketing'
    granted,
    policy_version: POLICY_VERSION,
    user_agent: navigator.userAgent,
    // ip_address : renseignée côté serveur (Edge Function), pas fiable côté client
  });
}

// Enregistre en une fois les consentements collectés à l'inscription.
export async function recordSignupConsents(userId, { cgu, dataProcessing, marketing }) {
  const rows = [
    { user_id: userId, type: "cgu", granted: cgu, policy_version: POLICY_VERSION },
    { user_id: userId, type: "data_processing", granted: dataProcessing, policy_version: POLICY_VERSION },
    { user_id: userId, type: "marketing", granted: marketing, policy_version: POLICY_VERSION },
  ];
  return await supabase.from("consents").insert(rows);
}

/* ==========================================================================
   BACK-OFFICE CABINET — vue consolidée des clients du conseiller
   ========================================================================== */
export async function listClientsNetWorth() {
  // La vue client_net_worth est protégée par RLS : ne renvoie que les clients
  // dont advisor_id = utilisateur courant.
  return await supabase.from("client_net_worth").select("*").order("net_worth", { ascending: false });
}

export async function getClientAssets(clientId) {
  return await supabase.from("assets").select("*").eq("owner_id", clientId);
}

/* ==========================================================================
   DROITS RGPD — portabilité (export) et effacement
   ========================================================================== */

// Export complet des données de l'utilisateur courant (droit à la portabilité,
// art. 20 RGPD). Rassemble profil, actifs, simulations et historique de
// consentement dans un objet structuré, prêt à être téléchargé en JSON.
export async function exportMyData() {
  const session = await getSession();
  const uid = session?.user?.id;
  if (!uid) return { error: "Non connecté" };

  const [profile, assets, sims, consents] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).single(),
    supabase.from("assets").select("*").eq("owner_id", uid),
    supabase.from("sci_simulations").select("*").eq("owner_id", uid),
    supabase.from("consents").select("*").eq("user_id", uid),
  ]);

  return {
    data: {
      exportDate: new Date().toISOString(),
      account: { id: uid, email: session.user.email },
      profile: profile.data ?? null,
      assets: assets.data ?? [],
      sci_simulations: sims.data ?? [],
      consents: consents.data ?? [],
    },
  };
}

// Effacement des données patrimoniales de l'utilisateur (droit à l'effacement,
// art. 17 RGPD). Supprime actifs, valorisations (en cascade) et simulations.
// NOTE : la suppression du compte d'authentification lui-même (auth.users)
// nécessite des droits admin et doit passer par une Edge Function côté serveur
// (voir docs/SECURITE-RGPD.md). On consigne donc aussi la demande.
export async function eraseMyData() {
  const session = await getSession();
  const uid = session?.user?.id;
  if (!uid) return { error: "Non connecté" };

  const delAssets = await supabase.from("assets").delete().eq("owner_id", uid);
  if (delAssets.error) return { error: delAssets.error.message };

  const delSims = await supabase.from("sci_simulations").delete().eq("owner_id", uid);
  if (delSims.error) return { error: delSims.error.message };

  // Trace la demande d'effacement dans le registre de consentement (retrait).
  await supabase.from("consents").insert({
    user_id: uid, type: "data_processing", granted: false, policy_version: "erasure-request",
  });

  return { data: { erased: true } };
}

/* ==========================================================================
   PRÉFÉRENCE DE THÈME (clair / sombre)
   Stockée dans profiles.theme pour être retrouvée sur tous les appareils.
   ========================================================================== */
export async function setThemePreference(mode) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Non connecté" };
  return await supabase.from("profiles").update({ theme: mode }).eq("id", session.user.id);
}
