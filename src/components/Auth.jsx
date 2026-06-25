import React, { useState, useMemo } from "react";
import Logo from "./Logo.jsx";
import { Eye, EyeOff, Lock, Shield, Check, Mail, KeyRound, ArrowLeft } from "lucide-react";
import { signIn, signUp, recordSignupConsents, resendConfirmation, requestPasswordReset, updatePassword } from "../lib/data";
import { isConfigured } from "../lib/supabase";
import { useTheme } from "../lib/theme.jsx";
import LegalOverlay, { LEGAL_DOCS } from "./Legal.jsx";
const inputStyle = (C) => ({ background: C.ink, border: `1px solid ${C.line}`, borderRadius: 10, padding: "11px 12px", color: C.ivory, fontSize: 14, width: "100%", boxSizing: "border-box" });

const CABINET = { name: "Mon Kap Pat" };
const fieldLblStyle = (C) => ({ fontSize: 12, color: C.ivorySoft, display: "block", marginBottom: 6 });

function PasswordStrength({ value }) {
  const C = useTheme();
  const input = inputStyle(C);
  const fieldLbl = fieldLblStyle(C);
  const score = useMemo(() => {
    let s = 0;
    if (value.length >= 12) s++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) s++;
    if (/\d/.test(value)) s++;
    if (/[^A-Za-z0-9]/.test(value)) s++;
    return s;
  }, [value]);
  if (!value) return null;
  const labels = ["Faible", "Moyen", "Correct", "Solide"];
  const cols = [C.alert, C.warn, "#7FB59E", C.positive];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < score ? cols[score - 1] : C.line }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: cols[Math.max(0, score - 1)], marginTop: 5 }}>
        {score === 0 ? "Trop court" : labels[score - 1]} · 12 caractères, majuscule, chiffre et symbole recommandés
      </div>
    </div>
  );
}

/* Sous-composants définis au niveau module : stables d'un rendu à l'autre,
   donc les champs ne perdent plus le focus à la frappe. */
function Tab({ id, view, setView, setErr, setInfo, label }) {
  const C = useTheme();
  const input = inputStyle(C);
  const fieldLbl = fieldLblStyle(C);
  return (
    <button onClick={() => { setView(id); setErr(""); setInfo(""); }}
      style={{ flex: 1, padding: "11px", borderRadius: 9, cursor: "pointer", fontSize: 14, fontWeight: 600, border: "none",
        background: view === id ? C.brass : "transparent", color: view === id ? C.ink : C.ivorySoft }}>{label}</button>
  );
}

function PwdField({ value, onChange, show, setShow, showStrength, label = "Mot de passe" }) {
  const C = useTheme();
  const input = inputStyle(C);
  const fieldLbl = fieldLblStyle(C);
  return (
    <div>
      <label style={fieldLbl}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={showStrength ? "12 caractères minimum" : "••••••••••••"} style={{ ...input, paddingRight: 42 }} />
        <button type="button" onClick={() => setShow((s) => !s)} style={{ position: "absolute", right: 10, top: 10, background: "none", border: "none", cursor: "pointer", padding: 2 }}>
          {show ? <EyeOff size={17} color={C.ivorySoft} /> : <Eye size={17} color={C.ivorySoft} />}
        </button>
      </div>
      {showStrength && <PasswordStrength value={value} />}
    </div>
  );
}

function Checkbox({ checked, onToggle, children }) {
  const C = useTheme();
  const input = inputStyle(C);
  const fieldLbl = fieldLblStyle(C);
  return (
    <button type="button" onClick={onToggle} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
      <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: 6, marginTop: 1, border: `1.5px solid ${checked ? C.brass : C.line}`, background: checked ? C.brass : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {checked && <Check size={13} color={C.ink} strokeWidth={3} />}
      </span>
      <span style={{ fontSize: 12, color: C.ivorySoft, lineHeight: 1.5 }}>{children}</span>
    </button>
  );
}

export default function Auth({ initialView = "login", onResetDone }) {
  const C = useTheme();
  const input = inputStyle(C);
  const fieldLbl = fieldLblStyle(C);
  const [view, setView] = useState(initialView);
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [pwd2, setPwd2] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [legal, setLegal] = useState(null); // document légal affiché en overlay (ou null)
  const [f, setF] = useState({
    civilite: "M.", prenom: "", nom: "", email: "", telephone: "",
    naissance: "", residenceFiscale: "France", password: "",
    consentData: false, consentMarketing: false, cgu: false,
  });
  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setErr(""); };

  async function submitLogin() {
    if (!f.email || !f.password) return setErr("Renseignez votre e-mail et votre mot de passe.");
    setBusy(true); setErr("");
    const { error } = await signIn({ email: f.email, password: f.password });
    setBusy(false);
    if (error) setErr(error.message === "Invalid login credentials" ? "Identifiants incorrects." : error.message);
    // En cas de succès, onAuthChange (dans App) bascule automatiquement vers l'app.
  }

  // Demande d'un lien de réinitialisation (écran « mot de passe oublié »).
  async function submitForgot() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return setErr("Adresse e-mail invalide.");
    setBusy(true); setErr("");
    const { error } = await requestPasswordReset(f.email);
    setBusy(false);
    if (error) return setErr(error.message);
    setView("forgot-sent");
  }

  // Définition du nouveau mot de passe après clic sur le lien reçu par e-mail.
  async function submitReset() {
    if (f.password.length < 12) return setErr("Le mot de passe doit comporter au moins 12 caractères.");
    if (f.password !== pwd2) return setErr("Les deux mots de passe ne correspondent pas.");
    setBusy(true); setErr("");
    const { error } = await updatePassword(f.password);
    setBusy(false);
    if (error) return setErr(error.message);
    setView("reset-done");
  }

  async function submitSignup() {
    if (!f.prenom || !f.nom) return setErr("Indiquez votre nom et votre prénom.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) return setErr("Adresse e-mail invalide.");
    if (f.password.length < 12) return setErr("Le mot de passe doit comporter au moins 12 caractères.");
    if (!f.cgu) return setErr("Vous devez accepter les conditions d'utilisation.");
    if (!f.consentData) return setErr("Le consentement au traitement des données est requis.");
    setBusy(true); setErr("");
    const { data, error } = await signUp({
      email: f.email, password: f.password,
      identity: { civilite: f.civilite, prenom: f.prenom, nom: f.nom, telephone: f.telephone, naissance: f.naissance, residenceFiscale: f.residenceFiscale },
    });
    if (error) { setBusy(false); return setErr(error.message); }
    // Enregistre le registre de consentement horodaté.
    if (data?.user?.id) {
      await recordSignupConsents(data.user.id, { cgu: f.cgu, dataProcessing: f.consentData, marketing: f.consentMarketing });
    }
    setBusy(false);
    setView("confirm");
  }

  // Renvoi de l'e-mail de confirmation depuis l'écran dédié.
  const [resent, setResent] = useState(false);
  async function handleResend() {
    setErr(""); setResent(false);
    const { error } = await resendConfirmation(f.email);
    if (error) return setErr(error.message);
    setResent(true);
  }

  // Les sous-composants Tab, PwdField et Checkbox sont définis au niveau module
  // (au-dessus) pour ne pas être recréés à chaque frappe — sinon le champ perd
  // le focus à chaque caractère.

  return (
    <div style={{ display: "flex", justifyContent: "center", minHeight: "100vh", background: "#0A1226", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 430, background: C.ink, minHeight: "100vh", padding: "48px 22px 40px", boxSizing: "border-box", overflowY: "auto" }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ marginBottom: 12 }}><Logo size={54} radius={12} /></div>
          <div style={{ color: C.ivory, fontSize: 19, fontWeight: 600 }}>Mon Kap Pat</div>
          <div style={{ color: C.brass, fontSize: 12, marginTop: 3 }}>Suivi de patrimoine</div>
        </div>

        {!isConfigured && (
          <div style={{ color: C.warn, fontSize: 12, background: "rgba(62,140,156,0.1)", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.warn}40`, marginBottom: 18 }}>
            Supabase non configuré. Renseignez vos clés dans le fichier .env (voir README).
          </div>
        )}

        {view === "confirm" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, textAlign: "center", marginTop: 8 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(62,140,156,0.14)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
              <Mail size={26} color={C.brass} />
            </div>
            <div>
              <div style={{ color: C.ivory, fontSize: 18, fontWeight: 600 }}>Vérifiez votre boîte mail</div>
              <div style={{ color: C.ivorySoft, fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>
                Nous avons envoyé un lien de confirmation à<br />
                <span style={{ color: C.ivory, fontWeight: 600 }}>{f.email}</span>.
              </div>
            </div>
            <div style={{ background: C.inkSoft, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16, textAlign: "left", fontSize: 13, color: C.ivorySoft, lineHeight: 1.6 }}>
              1. Ouvrez l'e-mail de Mon Kap Pat et cliquez sur le lien.<br />
              2. Revenez ici et connectez-vous.<br />
              <span style={{ display: "block", marginTop: 8, color: C.ivory }}>Vous ne le trouvez pas ? Pensez à vérifier vos courriers indésirables (spam).</span>
            </div>

            {resent && <div style={{ color: C.positive, fontSize: 13, background: "rgba(127,166,124,0.12)", padding: "10px 12px", borderRadius: 10 }}>E-mail renvoyé. Vérifiez votre boîte de réception.</div>}
            {err && <div style={{ color: C.alert, fontSize: 13, background: "rgba(194,85,63,0.1)", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.alert}40` }}>{err}</div>}

            <button onClick={handleResend} style={{ background: "none", color: C.brass, border: `1px solid ${C.brass}`, borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Renvoyer l'e-mail de confirmation
            </button>
            <button onClick={() => { setView("login"); setErr(""); setResent(false); }} style={{ background: C.brass, color: C.ink, border: "none", borderRadius: 12, padding: "15px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              J'ai confirmé, me connecter
            </button>
            <button onClick={() => { setView("signup"); setErr(""); }} style={{ background: "none", color: C.ivorySoft, border: "none", fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
              Modifier mon adresse e-mail
            </button>
          </div>
        ) : view === "forgot" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
            <button type="button" onClick={() => { setView("login"); setErr(""); }} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.ivorySoft, fontSize: 13, cursor: "pointer", padding: 0 }}>
              <ArrowLeft size={15} /> Retour à la connexion
            </button>
            <div>
              <div style={{ color: C.ivory, fontSize: 18, fontWeight: 600 }}>Mot de passe oublié</div>
              <div style={{ color: C.ivorySoft, fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>
                Indiquez l'adresse e-mail de votre compte. Nous vous enverrons un lien sécurisé pour définir un nouveau mot de passe.
              </div>
            </div>
            <div>
              <label style={fieldLbl}>E-mail</label>
              <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="vous@exemple.fr" style={input} />
            </div>
            {err && <div style={{ color: C.alert, fontSize: 13, background: "rgba(194,85,63,0.1)", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.alert}40` }}>{err}</div>}
            <button onClick={submitForgot} disabled={busy} style={{ background: C.brass, color: C.ink, border: "none", borderRadius: 12, padding: "15px", fontSize: 15, fontWeight: 600, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Mail size={16} /> {busy ? "Envoi…" : "Envoyer le lien"}
            </button>
          </div>
        ) : view === "forgot-sent" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, textAlign: "center", marginTop: 8 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(62,140,156,0.14)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
              <Mail size={26} color={C.brass} />
            </div>
            <div>
              <div style={{ color: C.ivory, fontSize: 18, fontWeight: 600 }}>Vérifiez votre boîte mail</div>
              <div style={{ color: C.ivorySoft, fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>
                Si un compte est associé à<br />
                <span style={{ color: C.ivory, fontWeight: 600 }}>{f.email}</span>, vous recevrez un e-mail contenant un lien pour réinitialiser votre mot de passe.
              </div>
            </div>
            <div style={{ background: C.inkSoft, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16, textAlign: "left", fontSize: 13, color: C.ivorySoft, lineHeight: 1.6 }}>
              Le lien est valable une heure. Pensez à vérifier vos courriers indésirables (spam) si vous ne le trouvez pas.
            </div>
            <button onClick={() => { setView("login"); setErr(""); }} style={{ background: C.brass, color: C.ink, border: "none", borderRadius: 12, padding: "15px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Retour à la connexion
            </button>
          </div>
        ) : view === "reset" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(62,140,156,0.14)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
              <KeyRound size={24} color={C.brass} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: C.ivory, fontSize: 18, fontWeight: 600 }}>Nouveau mot de passe</div>
              <div style={{ color: C.ivorySoft, fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>
                Choisissez un nouveau mot de passe pour sécuriser votre espace.
              </div>
            </div>
            <PwdField value={f.password} onChange={(v) => set("password", v)} show={show} setShow={setShow} showStrength={true} label="Nouveau mot de passe" />
            <div>
              <label style={fieldLbl}>Confirmer le mot de passe</label>
              <div style={{ position: "relative" }}>
                <input type={show2 ? "text" : "password"} value={pwd2} onChange={(e) => { setPwd2(e.target.value); setErr(""); }} placeholder="••••••••••••" style={{ ...input, paddingRight: 42 }} />
                <button type="button" onClick={() => setShow2((s) => !s)} style={{ position: "absolute", right: 10, top: 10, background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                  {show2 ? <EyeOff size={17} color={C.ivorySoft} /> : <Eye size={17} color={C.ivorySoft} />}
                </button>
              </div>
            </div>
            {err && <div style={{ color: C.alert, fontSize: 13, background: "rgba(194,85,63,0.1)", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.alert}40` }}>{err}</div>}
            <button onClick={submitReset} disabled={busy} style={{ background: C.brass, color: C.ink, border: "none", borderRadius: 12, padding: "15px", fontSize: 15, fontWeight: 600, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Lock size={16} /> {busy ? "Enregistrement…" : "Mettre à jour le mot de passe"}
            </button>
          </div>
        ) : view === "reset-done" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, textAlign: "center", marginTop: 8 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(127,166,124,0.14)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
              <Check size={28} color={C.positive} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ color: C.ivory, fontSize: 18, fontWeight: 600 }}>Mot de passe mis à jour</div>
              <div style={{ color: C.ivorySoft, fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>
                Votre mot de passe a été modifié avec succès.
              </div>
            </div>
            <button onClick={() => { if (onResetDone) onResetDone(); else setView("login"); }} style={{ background: C.brass, color: C.ink, border: "none", borderRadius: 12, padding: "15px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Accéder à mon espace
            </button>
          </div>
        ) : (
        <>
        <div style={{ display: "flex", gap: 6, background: C.inkSoft, padding: 4, borderRadius: 12, border: `1px solid ${C.line}`, marginBottom: 22 }}>
          <Tab id="login" label="Connexion" view={view} setView={setView} setErr={setErr} setInfo={setInfo} />
          <Tab id="signup" label="Créer un compte" view={view} setView={setView} setErr={setErr} setInfo={setInfo} />
        </div>

        {info && <div style={{ color: C.positive, fontSize: 13, background: "rgba(127,166,124,0.12)", padding: "10px 12px", borderRadius: 10, marginBottom: 16 }}>{info}</div>}

        {view === "login" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={fieldLbl}>E-mail</label>
              <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="vous@exemple.fr" style={input} />
            </div>
            <PwdField value={f.password} onChange={(v) => set("password", v)} show={show} setShow={setShow} showStrength={false} />
            <button type="button" onClick={() => { setView("forgot"); setErr(""); setInfo(""); }}
              style={{ alignSelf: "flex-end", marginTop: -6, background: "none", border: "none", color: C.brass, fontSize: 12.5, cursor: "pointer", padding: 0 }}>
              Mot de passe oublié ?
            </button>
            {err && <div style={{ color: C.alert, fontSize: 13, background: "rgba(194,85,63,0.1)", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.alert}40` }}>{err}</div>}
            <button onClick={submitLogin} disabled={busy} style={{ background: C.brass, color: C.ink, border: "none", borderRadius: 12, padding: "15px", fontSize: 15, fontWeight: 600, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Lock size={16} /> {busy ? "Connexion…" : "Se connecter"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.ivorySoft, fontSize: 11, justifyContent: "center", marginTop: 4 }}>
              <Shield size={13} color={C.brass} /> Connexion chiffrée · données hébergées en Union européenne
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.brass, fontWeight: 600 }}>Identité</div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ width: 90 }}>
                <label style={fieldLbl}>Civilité</label>
                <select value={f.civilite} onChange={(e) => set("civilite", e.target.value)} style={{ ...input, colorScheme: "dark", cursor: "pointer", padding: "11px 8px" }}>
                  <option>M.</option><option>Mme</option><option>Autre</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={fieldLbl}>Prénom</label>
                <input value={f.prenom} onChange={(e) => set("prenom", e.target.value)} style={input} />
              </div>
            </div>
            <div>
              <label style={fieldLbl}>Nom</label>
              <input value={f.nom} onChange={(e) => set("nom", e.target.value)} style={input} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={fieldLbl}>Date de naissance</label>
                <input type="date" value={f.naissance} onChange={(e) => set("naissance", e.target.value)} style={{ ...input, colorScheme: "dark" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={fieldLbl}>Résidence fiscale</label>
                <input value={f.residenceFiscale} onChange={(e) => set("residenceFiscale", e.target.value)} style={input} />
              </div>
            </div>

            <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.brass, fontWeight: 600, marginTop: 6 }}>Coordonnées & accès</div>
            <div>
              <label style={fieldLbl}>E-mail</label>
              <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="vous@exemple.fr" style={input} />
            </div>
            <div>
              <label style={fieldLbl}>Téléphone</label>
              <input type="tel" value={f.telephone} onChange={(e) => set("telephone", e.target.value)} placeholder="06 12 34 56 78" style={input} />
            </div>
            <PwdField value={f.password} onChange={(v) => set("password", v)} show={show} setShow={setShow} showStrength={true} />

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 6, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
              <Checkbox checked={f.cgu} onToggle={() => set("cgu", !f.cgu)}>J'accepte les conditions générales d'utilisation et la politique de confidentialité.</Checkbox>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 14px", paddingLeft: 30, marginTop: -8 }}>
                <button type="button" onClick={() => setLegal("cgu")} style={{ background: "none", border: "none", color: C.brass, fontSize: 12, cursor: "pointer", padding: 0, textDecoration: "underline" }}>Lire les CGU</button>
                <button type="button" onClick={() => setLegal("confidentialite")} style={{ background: "none", border: "none", color: C.brass, fontSize: 12, cursor: "pointer", padding: 0, textDecoration: "underline" }}>Politique de confidentialité</button>
              </div>
              <Checkbox checked={f.consentData} onToggle={() => set("consentData", !f.consentData)}>Je consens à ce que {CABINET.name} collecte et traite mes données personnelles et patrimoniales aux fins de suivi de mon patrimoine. <span style={{ color: C.ivory }}>(obligatoire)</span></Checkbox>
              <Checkbox checked={f.consentMarketing} onToggle={() => set("consentMarketing", !f.consentMarketing)}>J'accepte d'être recontacté(e) par un conseiller à des fins commerciales. <span style={{ color: C.brass }}>(facultatif)</span></Checkbox>
            </div>

            {err && <div style={{ color: C.alert, fontSize: 13, background: "rgba(194,85,63,0.1)", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.alert}40` }}>{err}</div>}

            <button onClick={submitSignup} disabled={busy} style={{ background: C.brass, color: C.ink, border: "none", borderRadius: 12, padding: "15px", fontSize: 15, fontWeight: 600, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, marginTop: 4 }}>
              {busy ? "Création…" : "Créer mon espace"}
            </button>
            <div style={{ fontSize: 11, color: C.ivorySoft, lineHeight: 1.6 }}>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données, ainsi que du droit de retirer votre consentement à tout moment. Responsable de traitement : {CABINET.name}. Vos données ne sont jamais cédées à des tiers à des fins publicitaires.
            </div>
          </div>
        )}
        </>
        )}

        {/* Pied de page : accès permanent aux documents légaux (y compris avant inscription). */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.line}`, display: "flex", flexWrap: "wrap", gap: "4px 14px", justifyContent: "center" }}>
          {LEGAL_DOCS.map((d) => (
            <button key={d.id} type="button" onClick={() => setLegal(d.id)}
              style={{ background: "none", border: "none", color: C.ivorySoft, fontSize: 11.5, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {legal && <LegalOverlay initialDoc={legal} onClose={() => setLegal(null)} />}
    </div>
  );
}
