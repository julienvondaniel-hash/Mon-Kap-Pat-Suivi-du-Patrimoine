import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronRight, ChevronLeft, Users, AlertTriangle, Search } from "lucide-react";
import { listClientsNetWorth, getClientAssets } from "../lib/data";
import Hex from "./Hex.jsx";
import { useTheme } from "../lib/theme.jsx";

const fmt = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);

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

export default function BackOffice({ wide = false }) {
  const C = useTheme();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    listClientsNetWorth().then(({ data, error }) => {
      if (!alive) return;
      if (!error && data) setClients(data);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return clients;
    return clients.filter((c) => `${c.prenom} ${c.nom}`.toLowerCase().includes(t));
  }, [clients, q]);

  const totals = useMemo(() => ({
    aum: clients.reduce((s, c) => s + Number(c.net_worth), 0),
    count: clients.length,
  }), [clients]);

  if (selected) return <ClientDetail client={selected} onBack={() => setSelected(null)} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Card>
        <Eyebrow>Encours sous suivi</Eyebrow>
        <div style={{ fontSize: 34, fontWeight: 600, color: C.ivory, letterSpacing: "-0.02em", lineHeight: 1 }}>{fmt(totals.aum)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, color: C.ivorySoft, fontSize: 13 }}>
          <Users size={15} color={C.brass} /> {totals.count} client{totals.count > 1 ? "s" : ""} suivi{totals.count > 1 ? "s" : ""}
        </div>
      </Card>

      <div style={{ position: "relative" }}>
        <Search size={16} color={C.ivorySoft} style={{ position: "absolute", left: 14, top: 14 }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un client"
          style={{ background: C.inkSoft, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 12px 12px 40px", color: C.ivory, fontSize: 14, width: "100%", boxSizing: "border-box" }} />
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {loading && <div style={{ padding: 22, color: C.ivorySoft, fontSize: 13 }}>Chargement…</div>}
        {!loading && filtered.length === 0 && <div style={{ padding: 22, color: C.ivorySoft, fontSize: 13 }}>Aucun client. Les comptes rattachés à votre profil de conseiller apparaîtront ici.</div>}
        {filtered.map((c, i) => (
          <button key={c.client_id} onClick={() => setSelected(c)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "none", border: "none", borderTop: i > 0 ? `1px solid ${C.line}` : "none", cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.line, display: "flex", alignItems: "center", justifyContent: "center", color: C.brass, fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
              {(c.prenom?.[0] || "") + (c.nom?.[0] || "")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: C.ivory, fontSize: 15, fontWeight: 500 }}>{c.prenom} {c.nom}</div>
              <div style={{ color: C.ivorySoft, fontSize: 12, marginTop: 2 }}>{c.asset_count} ligne{c.asset_count > 1 ? "s" : ""} d'actif</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: C.ivory, fontSize: 15, fontWeight: 600 }}>{fmt(c.net_worth)}</div>
              {Number(c.total_debt) > 0 && <div style={{ color: C.ivorySoft, fontSize: 11, marginTop: 2 }}>dette {fmt(c.total_debt)}</div>}
            </div>
            <ChevronRight size={18} color={C.ivorySoft} />
          </button>
        ))}
      </Card>
    </div>
  );
}

function ClientDetail({ client, onBack }) {
  const C = useTheme();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getClientAssets(client.client_id).then(({ data, error }) => {
      if (!alive) return;
      if (!error && data) setAssets(data);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [client.client_id]);

  const byCat = useMemo(() => {
    const m = {};
    assets.forEach((a) => { m[a.category] = (m[a.category] || 0) + Number(a.value); });
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [assets]);

  const gross = assets.reduce((s, a) => s + Number(a.value), 0);
  const topShare = gross > 0 ? Math.max(0, ...assets.map((a) => Number(a.value))) / gross : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.brass, fontSize: 14, cursor: "pointer", padding: 0 }}>
        <ChevronLeft size={18} /> Tous les clients
      </button>

      <Card>
        <Eyebrow>{client.prenom} {client.nom}</Eyebrow>
        <div style={{ fontSize: 30, fontWeight: 600, color: C.ivory, letterSpacing: "-0.02em", lineHeight: 1 }}>{fmt(client.net_worth)}</div>
        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: C.ivorySoft }}>
          <span>Brut {fmt(client.gross)}</span><span>Dette {fmt(client.total_debt)}</span>
        </div>
      </Card>

      {topShare > 0.4 && (
        <Card style={{ borderLeft: `3px solid ${C.alert}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertTriangle size={18} color={C.alert} />
            <div style={{ fontSize: 13, color: C.ivorySoft, lineHeight: 1.5 }}>
              Concentration : un actif pèse {(topShare * 100).toFixed(0)} % du patrimoine brut. À évoquer en revue.
            </div>
          </div>
        </Card>
      )}

      <Card>
        <Eyebrow>Répartition</Eyebrow>
        {loading ? <div style={{ color: C.ivorySoft, fontSize: 13 }}>Chargement…</div> : byCat.length === 0 ? (
          <div style={{ color: C.ivorySoft, fontSize: 13 }}>Aucun actif renseigné par ce client.</div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 120, height: 120, flexShrink: 0 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byCat} dataKey="value" innerRadius={38} outerRadius={58} paddingAngle={2} stroke="none">
                    {byCat.map((_, i) => <Cell key={i} fill={C.pie[i % C.pie.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {byCat.map((a, i) => (
                <div key={a.name} style={{ display: "flex", alignItems: "center", fontSize: 13 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: C.pie[i % C.pie.length], marginRight: 9 }} />
                  <span style={{ color: C.ivory, flex: 1 }}>{a.name}</span>
                  <span style={{ color: C.ivorySoft }}>{((a.value / gross) * 100).toFixed(0)} %</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.line}` }}>
          <Eyebrow>Détail des actifs</Eyebrow>
        </div>
        {assets.map((a, i) => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderTop: i > 0 ? `1px solid ${C.line}` : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: C.ivory, fontSize: 14 }}>{a.label || a.category}</div>
              <div style={{ color: C.ivorySoft, fontSize: 12, marginTop: 2 }}>{a.category}</div>
            </div>
            <div style={{ color: C.ivory, fontSize: 14, fontWeight: 600 }}>{fmt(a.value)}</div>
          </div>
        ))}
      </Card>

      <div style={{ fontSize: 11, color: C.ivorySoft, lineHeight: 1.6, padding: "0 4px" }}>
        Accès tracé dans le journal RGPD. Vue réservée au conseiller référent ; le client conserve la maîtrise et le droit de retrait de ses données.
      </div>
    </div>
  );
}
