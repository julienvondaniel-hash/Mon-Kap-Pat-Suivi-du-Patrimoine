/* ==========================================================================
   SCORING DE POTENTIEL — qualification des prospects/clients
   Logique pure (aucune dépendance), donc testable et réutilisable.

   Le score (0–100) combine plusieurs signaux commerciaux observables à
   partir des données déjà saisies. Chaque signal contribue au score ET
   produit un libellé explicatif (le "pourquoi") affiché au conseiller.

   Important : c'est un outil d'AIDE À LA PRIORISATION interne, pas une
   recommandation d'investissement. Il ne décide rien à la place du conseiller.
   ========================================================================== */

// catégories considérées comme "liquidités mobilisables"
const LIQUID_CATS = ["Liquidités", "Actions", "Obligations"];

export function scoreClient({ netWorth = 0, gross = 0, totalDebt = 0, assets = [] }) {
  const signals = [];
  let score = 0;

  // --- Signal 1 : taille du patrimoine (capacité) ---
  if (netWorth >= 1_000_000) { score += 35; signals.push({ w: "high", label: `Patrimoine net élevé (${fmtShort(netWorth)})` }); }
  else if (netWorth >= 500_000) { score += 25; signals.push({ w: "mid", label: `Patrimoine net significatif (${fmtShort(netWorth)})` }); }
  else if (netWorth >= 150_000) { score += 15; signals.push({ w: "low", label: `Patrimoine en constitution (${fmtShort(netWorth)})` }); }

  // --- Signal 2 : liquidités dormantes (besoin de placement) ---
  const cash = assets.filter((a) => a.category === "Liquidités").reduce((s, a) => s + Number(a.value || 0), 0);
  const cashShare = gross > 0 ? cash / gross : 0;
  if (cash >= 100_000 && cashShare >= 0.2) { score += 30; signals.push({ w: "high", label: `${fmtShort(cash)} de liquidités à faire travailler` }); }
  else if (cash >= 30_000) { score += 15; signals.push({ w: "mid", label: `Liquidités disponibles (${fmtShort(cash)})` }); }

  // --- Signal 3 : concentration / déséquilibre (besoin de conseil) ---
  const top = gross > 0 ? Math.max(0, ...assets.map((a) => Number(a.value || 0))) / gross : 0;
  if (top > 0.5) { score += 15; signals.push({ w: "mid", label: `Concentration forte (${(top * 100).toFixed(0)} % sur un actif)` }); }

  // --- Signal 4 : effet de levier immobilier (profil investisseur actif) ---
  const ltv = gross > 0 ? totalDebt / gross : 0;
  if (ltv > 0.3) { score += 10; signals.push({ w: "low", label: `Recours au crédit (levier ${(ltv * 100).toFixed(0)} %)` }); }

  // --- Signal 5 : engagement (a renseigné plusieurs lignes) ---
  if (assets.length >= 4) { score += 10; signals.push({ w: "low", label: "Profil bien renseigné (engagement)" }); }

  score = Math.min(100, score);
  const tier = score >= 70 ? "chaud" : score >= 40 ? "tiède" : "froid";
  return { score, tier, signals };
}

// Tri décroissant par score, pour la liste du back-office.
export function rankClients(rows) {
  return rows
    .map((r) => ({ ...r, ...scoreClient(r) }))
    .sort((a, b) => b.score - a.score);
}

function fmtShort(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1).replace(".", ",") + " M€";
  if (n >= 1_000) return Math.round(n / 1000) + " k€";
  return Math.round(n) + " €";
}
