import React, { useState } from "react";
import { Download, Trash2, Shield, AlertTriangle, Check } from "lucide-react";
import { exportMyData, eraseMyData, signOut } from "../lib/data";
import Hex from "./Hex.jsx";
import { useTheme } from "../lib/theme.jsx";

const CABINET = { name: "Mon Kap Pat", dpoEmail: "j.daniel@hexa-patrimoine.com" };

function Card({ children, style }) {
  const C = useTheme();
  const shadow = C.mode === "light" ? "0 1px 3px rgba(27,43,75,.06)" : "none";
  return <div style={{ background: C.inkSoft, border: `1px solid ${C.line}`, borderRadius: 18, padding: 22, boxShadow: shadow, ...style }}>{children}</div>;
}
function Eyebrow({ children }) {
  const C = useTheme();
  return (
    <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.brass, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 7 }}>
      <Hex size={11} color={C.brass} />{children}
    </div>
  );
}

export default function MesDonnees() {
  const C = useTheme();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [confirmErase, setConfirmErase] = useState(false);

  async function handleExport() {
    setBusy(true); setMsg("");
    const { data, error } = await exportMyData();
    setBusy(false);
    if (error) return setMsg("Erreur : " + error);
    // Génère un fichier JSON téléchargeable, côté navigateur.
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mes-donnees-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Export téléchargé.");
  }

  async function handleErase() {
    setBusy(true); setMsg("");
    const { data, error } = await eraseMyData();
    setBusy(false);
    if (error) return setMsg("Erreur : " + error);
    if (data?.erased) {
      setMsg("Vos données patrimoniales ont été supprimées. Vous allez être déconnecté(e).");
      setTimeout(async () => { await signOut(); }, 2500);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card>
        <Eyebrow>Vos données personnelles</Eyebrow>
        <div style={{ fontSize: 13, color: C.ivorySoft, lineHeight: 1.6 }}>
          Conformément au RGPD, vous pouvez à tout moment récupérer une copie de
          vos données ou en demander la suppression. Responsable de traitement :
          {" "}{CABINET.name}.
        </div>
      </Card>

      {/* Export — portabilité */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Download size={18} color={C.brass} />
          <span style={{ color: C.ivory, fontWeight: 600, fontSize: 15 }}>Exporter mes données</span>
        </div>
        <div style={{ fontSize: 13, color: C.ivorySoft, lineHeight: 1.6, marginBottom: 14 }}>
          Téléchargez l'ensemble de vos données (profil, actifs, simulations,
          historique de consentement) dans un fichier lisible.
        </div>
        <button onClick={handleExport} disabled={busy}
          style={{ width: "100%", background: C.brass, color: C.ink, border: "none", borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 600, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Download size={16} /> Télécharger (JSON)
        </button>
      </Card>

      {/* Effacement */}
      <Card style={{ borderLeft: `3px solid ${C.alert}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Trash2 size={18} color={C.alert} />
          <span style={{ color: C.ivory, fontWeight: 600, fontSize: 15 }}>Supprimer mes données</span>
        </div>
        <div style={{ fontSize: 13, color: C.ivorySoft, lineHeight: 1.6, marginBottom: 14 }}>
          Supprime définitivement vos actifs et simulations. Cette action est
          irréversible.
        </div>
        {!confirmErase ? (
          <button onClick={() => setConfirmErase(true)} disabled={busy}
            style={{ width: "100%", background: "transparent", color: C.alert, border: `1px solid ${C.alert}`, borderRadius: 12, padding: "13px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Trash2 size={16} /> Demander la suppression
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: C.ivory, background: "rgba(194,85,63,0.1)", padding: "10px 12px", borderRadius: 10 }}>
              <AlertTriangle size={15} color={C.alert} style={{ flexShrink: 0, marginTop: 1 }} />
              Confirmez-vous la suppression définitive de vos données patrimoniales ?
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmErase(false)} disabled={busy}
                style={{ flex: 1, background: "transparent", color: C.ivorySoft, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px", fontSize: 14, cursor: "pointer" }}>Annuler</button>
              <button onClick={handleErase} disabled={busy}
                style={{ flex: 1, background: C.alert, color: C.ivory, border: "none", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 600, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
                {busy ? "Suppression…" : "Confirmer"}
              </button>
            </div>
          </div>
        )}
      </Card>

      {msg && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: msg.startsWith("Erreur") ? C.alert : C.positive, background: msg.startsWith("Erreur") ? "rgba(194,85,63,0.1)" : "rgba(127,166,124,0.12)", padding: "11px 13px", borderRadius: 12 }}>
          {!msg.startsWith("Erreur") && <Check size={15} />}{msg}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11, color: C.ivorySoft, lineHeight: 1.6, padding: "0 4px" }}>
        <Shield size={14} color={C.brass} style={{ flexShrink: 0, marginTop: 2 }} />
        Pour toute question sur le traitement de vos données ou pour exercer vos
        autres droits (rectification, opposition), contactez {CABINET.dpoEmail}.
        La suppression complète du compte d'accès est traitée par nos services
        sous 30 jours.
      </div>
    </div>
  );
}
