import React, { useEffect } from "react";
import { X, FileText, ShieldCheck, ScrollText, AlertTriangle } from "lucide-react";
import { useTheme } from "../lib/theme.jsx";

/* ==========================================================================
   PAGES LÉGALES — Mentions légales · Politique de confidentialité · CGU

   ⚠️ IMPORTANT : ces textes sont un MODÈLE sérieux et adapté à l'application,
   mais ils doivent être COMPLÉTÉS (champs ⟨ … ⟩) puis VALIDÉS par un juriste
   avant toute ouverture au public, a fortiori pour des données financières.
   Les zones ⟨entre chevrons⟩ sont à renseigner ; le bandeau d'avertissement
   en tête est à retirer une fois la validation juridique effectuée.

   Éditeur / responsable de traitement : Seine Gestion Privée,
   représentée par M. Julien DANIEL (Président).
   ========================================================================== */

export const EDITEUR = {
  service: "Mon Kap Pat",
  raisonSociale: "Seine Gestion Privée",
  president: "Julien DANIEL",
  email: "julien_daniel@yahoo.fr",
  telephone: "06 58 80 36 30",
};

export const LEGAL_DOCS = [
  { id: "mentions", label: "Mentions légales", icon: FileText },
  { id: "confidentialite", label: "Confidentialité", icon: ShieldCheck },
  { id: "cgu", label: "CGU", icon: ScrollText },
];

const MAJ = "juin 2026"; // date de dernière mise à jour (à confirmer à la validation)

/* ----------------------------- petits blocs ----------------------------- */
function H({ children }) {
  const C = useTheme();
  return <h3 style={{ color: C.ivory, fontSize: 15.5, fontWeight: 600, margin: "22px 0 8px" }}>{children}</h3>;
}
function P({ children }) {
  const C = useTheme();
  return <p style={{ color: C.ivorySoft, fontSize: 13.5, lineHeight: 1.65, margin: "0 0 10px" }}>{children}</p>;
}
function UL({ children }) {
  const C = useTheme();
  return <ul style={{ color: C.ivorySoft, fontSize: 13.5, lineHeight: 1.65, margin: "0 0 10px", paddingLeft: 20 }}>{children}</ul>;
}
function Strong({ children }) {
  const C = useTheme();
  return <strong style={{ color: C.ivory, fontWeight: 600 }}>{children}</strong>;
}
// Zone à compléter, visuellement repérable.
function Fill({ children }) {
  return <mark style={{ background: "rgba(201,162,107,0.22)", color: "inherit", padding: "0 5px", borderRadius: 4, fontStyle: "normal", fontWeight: 500 }}>⟨{children}⟩</mark>;
}

/* ------------------------------ documents -------------------------------- */
function MentionsLegales() {
  return (
    <>
      <H>Éditeur du service</H>
      <P>
        L'application « {EDITEUR.service} » est éditée par <Strong>{EDITEUR.raisonSociale}</Strong>,
        {" "}<Fill>forme juridique, ex. SAS / SASU</Fill> au capital de <Fill>montant</Fill> €,
        immatriculée au RCS de <Fill>ville</Fill> sous le numéro <Fill>SIREN / SIRET</Fill>,
        dont le siège social est situé <Fill>adresse complète du siège</Fill>.
      </P>
      <UL>
        <li>Représentant légal : <Strong>M. {EDITEUR.president}</Strong>, Président.</li>
        <li>Contact : {EDITEUR.email} — {EDITEUR.telephone}.</li>
        <li>N° de TVA intracommunautaire : <Fill>n° TVA</Fill>.</li>
      </UL>

      <H>Directeur de la publication</H>
      <P>M. {EDITEUR.president}, en qualité de Président de {EDITEUR.raisonSociale}.</P>

      <H>Hébergement</H>
      <P>
        <Strong>Base de données et authentification</Strong> (où sont stockées les données
        personnelles) : Supabase, hébergement dans une région de l'<Strong>Union européenne</Strong>.
        {" "}<Fill>entité et adresse du sous-traitant, voir le DPA Supabase</Fill>.
      </P>
      <P>
        <Strong>Diffusion de l'application</Strong> (fichiers de l'interface) :
        {" "}<Fill>hébergeur front, ex. Vercel Inc. — adresse officielle</Fill>.
      </P>

      <H>Propriété intellectuelle</H>
      <P>
        L'ensemble des éléments de l'application (marque « {EDITEUR.service} », logo, textes,
        interface, code) est protégé et demeure la propriété exclusive de {EDITEUR.raisonSociale},
        sauf mention contraire. Toute reproduction non autorisée est interdite.
      </P>

      <H>Médiateur de la consommation</H>
      <P>
        Conformément aux articles L.611-1 et suivants du Code de la consommation, le consommateur
        peut recourir gratuitement à un médiateur : <Fill>nom et coordonnées du médiateur de la
        consommation (obligatoire si vente aux particuliers)</Fill>.
      </P>

      <H>Données personnelles</H>
      <P>
        Le traitement des données personnelles est décrit dans la <Strong>Politique de
        confidentialité</Strong>. Pour toute question : {EDITEUR.email}.
      </P>
    </>
  );
}

function Confidentialite() {
  return (
    <>
      <H>1. Responsable du traitement</H>
      <P>
        Le responsable du traitement est <Strong>{EDITEUR.raisonSociale}</Strong>, représentée par
        {" "}<Strong>M. {EDITEUR.president}</Strong>, Président. Pour toute question relative à vos
        données : {EDITEUR.email}.
      </P>
      <P><Fill>Le cas échéant, coordonnées du Délégué à la protection des données (DPO)</Fill>.</P>

      <H>2. Données que nous traitons</H>
      <UL>
        <li><Strong>Identité</Strong> : civilité, nom, prénom, date de naissance, résidence fiscale.</li>
        <li><Strong>Coordonnées</Strong> : adresse e-mail, numéro de téléphone.</li>
        <li><Strong>Données patrimoniales que vous saisissez</Strong> : actifs, valeurs, dettes, simulations.</li>
        <li><Strong>Données techniques</Strong> : journaux de connexion et d'accès, à des fins de sécurité.</li>
      </UL>
      <P>
        Nous <Strong>ne collectons pas vos identifiants bancaires</Strong> et ne nous connectons pas à
        vos comptes : la saisie de votre patrimoine est entièrement manuelle.
      </P>

      <H>3. Finalités et bases légales</H>
      <UL>
        <li>Fournir et gérer votre espace de suivi de patrimoine — <Strong>exécution des CGU</Strong>.</li>
        <li>Enregistrer et afficher vos données patrimoniales — <Strong>votre consentement</Strong>.</li>
        <li>Assurer la sécurité du service et tracer les accès — <Strong>intérêt légitime</Strong>.</li>
        <li>Vous recontacter à des fins commerciales (facultatif) — <Strong>consentement</Strong>, retirable à tout moment.</li>
      </UL>

      <H>4. Durées de conservation</H>
      <UL>
        <li>Données du compte et données patrimoniales : pendant toute la vie du compte, puis supprimées sous <Fill>délai, ex. 30 jours</Fill> après fermeture.</li>
        <li>Journaux techniques : <Fill>durée, ex. 12 mois</Fill>.</li>
        <li>Preuves de consentement : conservées à titre de preuve pendant <Fill>durée légale applicable</Fill>.</li>
      </UL>

      <H>5. Destinataires et sous-traitants</H>
      <P>
        Vos données sont accessibles à {EDITEUR.raisonSociale} et à ses sous-traitants techniques
        strictement nécessaires au fonctionnement : hébergeur de la base (Supabase, UE), hébergeur de
        diffusion et <Fill>prestataire d'envoi d'e-mails, ex. Resend / Brevo</Fill>. Nous
        {" "}<Strong>ne vendons ni ne cédons jamais</Strong> vos données à des tiers à des fins publicitaires.
      </P>

      <H>6. Transferts hors Union européenne</H>
      <P>
        Vos données sont hébergées dans l'Union européenne. Si un sous-traitant venait à les traiter
        hors UE, ce transfert serait encadré par les <Strong>clauses contractuelles types</Strong> de
        la Commission européenne ou un mécanisme équivalent. <Fill>à vérifier selon vos prestataires</Fill>.
      </P>

      <H>7. Sécurité</H>
      <P>
        Connexion chiffrée (HTTPS), mots de passe hachés et jamais accessibles, cloisonnement strict des
        données par utilisateur (Row Level Security), et double authentification (2FA) disponible.
      </P>

      <H>8. Cookies et traceurs</H>
      <P>
        L'application utilise uniquement un <Strong>stockage strictement nécessaire</Strong> à votre
        connexion (maintien de la session). Elle <Strong>n'utilise aucun cookie publicitaire ni outil de
        mesure d'audience</Strong> : aucun bandeau de consentement aux cookies n'est donc requis.
      </P>

      <H>9. Vos droits</H>
      <P>
        Vous disposez des droits d'accès, de rectification, d'effacement, de limitation, d'opposition, de
        portabilité, ainsi que du droit de retirer votre consentement et de définir des directives sur le
        sort de vos données après votre décès.
      </P>
      <UL>
        <li>Depuis l'application : onglet <Strong>« Mes données »</Strong> (export de vos données et suppression).</li>
        <li>Par e-mail : {EDITEUR.email}.</li>
      </UL>
      <P>
        Vous pouvez introduire une réclamation auprès de la <Strong>CNIL</Strong> (www.cnil.fr) si vous
        estimez que vos droits ne sont pas respectés.
      </P>

      <H>10. Modifications</H>
      <P>
        La présente politique peut évoluer. La version applicable est celle en vigueur lors de votre
        utilisation du service. Dernière mise à jour : {MAJ}.
      </P>
    </>
  );
}

function CGU() {
  return (
    <>
      <H>1. Objet</H>
      <P>
        Les présentes conditions générales d'utilisation (« CGU ») régissent l'accès et l'utilisation de
        l'application « {EDITEUR.service} », éditée par {EDITEUR.raisonSociale}. En créant un compte, vous
        acceptez sans réserve les présentes CGU.
      </P>

      <H>2. Description du service</H>
      <P>
        {EDITEUR.service} est un <Strong>outil d'information et de suivi de patrimoine</Strong> : vous
        saisissez vos biens et l'application les organise, les visualise et calcule des indicateurs.
      </P>
      <P>
        <Strong>Avertissement important :</Strong> {EDITEUR.service} ne constitue pas un conseil en
        investissement financier, ni un conseil juridique ou fiscal au sens réglementaire. Les analyses,
        rendements (TRI) et indicateurs sont fournis à titre <Strong>purement informatif</Strong> et ne
        valent pas recommandation personnalisée. Vous restez seul responsable de vos décisions.
      </P>

      <H>3. Compte et accès</H>
      <UL>
        <li>La création d'un compte requiert des informations exactes et à jour.</li>
        <li>Vous êtes responsable de la confidentialité de vos identifiants ; la 2FA est recommandée.</li>
        <li>Le service est réservé aux personnes majeures capables de contracter.</li>
      </UL>

      <H>4. Données saisies et exactitude</H>
      <P>
        Vous demeurez responsable de l'exactitude des données que vous saisissez. {EDITEUR.raisonSociale}
        ne garantit pas l'exactitude des résultats calculés à partir de données erronées ou incomplètes.
      </P>

      <H>5. Disponibilité et évolution</H>
      <P>
        Le service est fourni « en l'état » et peut faire l'objet de maintenances, d'évolutions ou
        d'interruptions. {EDITEUR.raisonSociale} s'efforce d'assurer une disponibilité continue sans
        pouvoir la garantir de manière absolue.
      </P>

      <H>6. Tarifs</H>
      <P>
        <Fill>Préciser le modèle : service gratuit, ou conditions tarifaires et modalités de paiement,
        d'abonnement et de résiliation si payant (des CGV seront alors ajoutées)</Fill>.
      </P>

      <H>7. Propriété intellectuelle</H>
      <P>
        L'application et l'ensemble de ses composants restent la propriété de {EDITEUR.raisonSociale}.
        L'utilisateur bénéficie d'un droit d'usage personnel, non exclusif et non cessible.
      </P>

      <H>8. Responsabilité</H>
      <P>
        Dans les limites permises par la loi, la responsabilité de {EDITEUR.raisonSociale} ne saurait être
        engagée pour les dommages indirects ni pour les conséquences de décisions prises sur la base des
        informations affichées, celles-ci étant fournies à titre informatif.
      </P>

      <H>9. Données personnelles</H>
      <P>
        Le traitement de vos données est décrit dans la <Strong>Politique de confidentialité</Strong>, qui
        fait partie intégrante des présentes CGU.
      </P>

      <H>10. Durée et résiliation</H>
      <P>
        Les CGU s'appliquent pendant toute la durée d'utilisation. Vous pouvez fermer votre compte à tout
        moment depuis l'onglet « Mes données ». {EDITEUR.raisonSociale} peut suspendre un compte en cas de
        manquement aux présentes.
      </P>

      <H>11. Modification des CGU</H>
      <P>Les CGU peuvent être modifiées ; la version applicable est celle en vigueur lors de l'utilisation. Dernière mise à jour : {MAJ}.</P>

      <H>12. Droit applicable et litiges</H>
      <P>
        Les présentes CGU sont régies par le <Strong>droit français</Strong>. En cas de litige, et après
        tentative de résolution amiable (y compris la médiation de la consommation mentionnée dans les
        mentions légales), les tribunaux français sont compétents.
      </P>
    </>
  );
}

const CONTENT = { mentions: MentionsLegales, confidentialite: Confidentialite, cgu: CGU };

/* ------------------------------- overlay --------------------------------- */
export default function LegalOverlay({ initialDoc = "mentions", onClose }) {
  const C = useTheme();
  const [doc, setDoc] = React.useState(initialDoc);
  const Body = CONTENT[doc] || MentionsLegales;
  const current = LEGAL_DOCS.find((d) => d.id === doc) || LEGAL_DOCS[0];

  // Fermeture au clavier (Échap).
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(5,10,22,0.72)", display: "flex", justifyContent: "center", alignItems: "flex-end", padding: "0", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 640, maxHeight: "92vh", background: C.ink, borderRadius: "18px 18px 0 0", border: `1px solid ${C.line}`, display: "flex", flexDirection: "column", overflow: "hidden", animation: "slideUp .22s ease" }}>
        {/* En-tête + onglets */}
        <div style={{ padding: "16px 18px 0", borderBottom: `1px solid ${C.line}`, background: C.inkSoft }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ color: C.ivory, fontSize: 16, fontWeight: 600 }}>{current.label}</div>
            <button onClick={onClose} aria-label="Fermer" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}>
              <X size={20} color={C.ivorySoft} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {LEGAL_DOCS.map((d) => (
              <button key={d.id} onClick={() => setDoc(d.id)}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "9px 6px", border: "none", borderBottom: `2px solid ${doc === d.id ? C.brass : "transparent"}`, background: "none", cursor: "pointer", color: doc === d.id ? C.brass : C.ivorySoft, fontSize: 12.5, fontWeight: 600 }}>
                <d.icon size={14} /> {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu défilant */}
        <div style={{ overflowY: "auto", padding: "8px 20px 28px" }}>
          <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: "rgba(62,140,156,0.12)", border: `1px solid ${C.warn}55`, borderRadius: 12, padding: "11px 13px", margin: "14px 0 4px" }}>
            <AlertTriangle size={16} color={C.warn} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: C.ivorySoft, lineHeight: 1.55 }}>
              Document type à compléter (zones <span style={{ color: C.ivory }}>⟨entre chevrons⟩</span>) et à
              faire valider par un juriste avant l'ouverture au public. Ce bandeau est à retirer ensuite.
            </div>
          </div>
          <Body />
        </div>
      </div>
    </div>
  );
}
