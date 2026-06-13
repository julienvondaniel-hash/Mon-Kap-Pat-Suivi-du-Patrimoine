import React, { useState, useEffect } from "react";
import { LogOut, Users, User as UserIcon } from "lucide-react";
import Auth from "./components/Auth.jsx";
import ClientApp, { CLIENT_TABS } from "./components/ClientApp.jsx";
import BackOffice from "./components/BackOffice.jsx";
import { onAuthChange, getSession, signOut, getProfile } from "./lib/data";
import { useIsDesktop } from "./lib/useIsDesktop";

const C = {
  ink: "#16201C", inkSoft: "#1F2C27", ivory: "#F3EFE6", ivorySoft: "#A9B0A6",
  brass: "#C9A24B", line: "#2C3A33",
};

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("client");
  const [tab, setTab] = useState("patrimoine");
  const isDesktop = useIsDesktop();

  useEffect(() => {
    getSession().then((s) => { setSession(s); setReady(true); });
    const unsub = onAuthChange((s) => setSession(s));
    return unsub;
  }, []);

  useEffect(() => {
    if (session?.user?.id) getProfile(session.user.id).then(({ data }) => setProfile(data));
    else setProfile(null);
  }, [session]);

  const logout = async () => { await signOut(); setSession(null); };

  if (!ready) return <div style={{ minHeight: "100vh", background: "#0C120F" }} />;
  if (!session) return <Auth />;

  const isAdvisor = profile?.role === "advisor" || profile?.role === "admin";
  const prenom = profile?.prenom || "—";
  const showBackoffice = isAdvisor && view === "backoffice";

  /* ============================ ORDINATEUR ============================ */
  if (isDesktop) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "#0C120F", fontFamily: "'Inter', system-ui, sans-serif", color: C.ivory }}>
        <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        <aside style={{ width: 256, flexShrink: 0, background: C.ink, borderRight: `1px solid ${C.line}`, display: "flex", flexDirection: "column", padding: "26px 16px", boxSizing: "border-box", position: "sticky", top: 0, height: "100vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px 22px" }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${C.brass}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 11, height: 11, background: C.brass, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "0.01em", lineHeight: 1.15 }}>Seine<br />Gestion Privée</div>
          </div>

          {isAdvisor && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
              <SideToggle active={view === "client"} onClick={() => setView("client")} icon={UserIcon} label="Vue client" />
              <SideToggle active={view === "backoffice"} onClick={() => setView("backoffice")} icon={Users} label="Mes clients" />
            </div>
          )}

          {!showBackoffice && (
            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.ivorySoft, padding: "8px 12px 4px" }}>Espace</div>
              {CLIENT_TABS.map((t) => (
                <NavItem key={t.id} active={tab === t.id} onClick={() => setTab(t.id)} icon={t.icon} label={t.label} />
              ))}
            </nav>
          )}

          <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 12px" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.line, display: "flex", alignItems: "center", justifyContent: "center", color: C.brass, fontSize: 13, fontWeight: 600 }}>
                {prenom?.[0] || "?"}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prenom}</div>
                <div style={{ fontSize: 11, color: C.ivorySoft }}>{isAdvisor ? "Conseiller" : "Client"}</div>
              </div>
            </div>
            <button onClick={logout} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "none", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px", cursor: "pointer", color: C.ivorySoft, fontSize: 13 }}>
              <LogOut size={15} /> Se déconnecter
            </button>
          </div>
        </aside>

        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {showBackoffice
            ? <div style={{ padding: "32px 40px 48px", overflowY: "auto" }}><div style={{ maxWidth: 1100, margin: "0 auto" }}><BackOffice wide /></div></div>
            : <ClientApp tab={tab} setTab={setTab} isDesktop />}
        </main>
      </div>
    );
  }

  /* ============================== MOBILE ============================== */
  return (
    <div style={{ display: "flex", justifyContent: "center", minHeight: "100vh", background: "#0C120F", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div style={{ width: "100%", maxWidth: 430, background: C.ink, display: "flex", flexDirection: "column", position: "relative", minHeight: "100vh" }}>
        <div style={{ padding: "26px 22px 18px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, border: `1.5px solid ${C.brass}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 9, height: 9, background: C.brass, borderRadius: 2 }} />
            </div>
            <div>
              <div style={{ color: C.ivory, fontSize: 15, fontWeight: 600, letterSpacing: "0.02em", lineHeight: 1.1 }}>Seine Gestion Privée</div>
              <div style={{ color: C.ivorySoft, fontSize: 11, marginTop: 1 }}>
                {isAdvisor ? (view === "backoffice" ? "Back-office cabinet" : "Vue client") : `Bonjour ${prenom}`}
              </div>
            </div>
          </div>
          <button onClick={logout} title="Se déconnecter" style={{ background: "none", border: `1px solid ${C.line}`, borderRadius: 9, padding: 8, cursor: "pointer", display: "flex" }}>
            <LogOut size={16} color={C.ivorySoft} />
          </button>
        </div>

        {isAdvisor && (
          <div style={{ display: "flex", gap: 6, padding: "12px 18px 0" }}>
            <Toggle active={view === "client"} onClick={() => setView("client")} icon={UserIcon} label="Vue client" />
            <Toggle active={view === "backoffice"} onClick={() => setView("backoffice")} icon={Users} label="Mes clients" />
          </div>
        )}

        {showBackoffice
          ? <div style={{ flex: 1, padding: "18px 18px 40px", overflowY: "auto" }}><BackOffice /></div>
          : <ClientApp tab={tab} setTab={setTab} isDesktop={false} />}
      </div>
    </div>
  );
}

function NavItem({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", borderRadius: 10, cursor: "pointer", border: "none", textAlign: "left", width: "100%",
      background: active ? "rgba(201,162,75,0.12)" : "transparent", color: active ? "#C9A24B" : "#A9B0A6", fontSize: 14, fontWeight: active ? 600 : 400 }}>
      <Icon size={18} strokeWidth={active ? 2.3 : 1.8} /> {label}
    </button>
  );
}

function SideToggle({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
      border: `1px solid ${active ? "#C9A24B" : "#2C3A33"}`, background: active ? "#C9A24B" : "transparent", color: active ? "#16201C" : "#A9B0A6" }}>
      <Icon size={15} /> {label}
    </button>
  );
}

function Toggle({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, border: `1px solid ${active ? "#C9A24B" : "#2C3A33"}`, background: active ? "#C9A24B" : "transparent", color: active ? "#16201C" : "#A9B0A6" }}>
      <Icon size={15} /> {label}
    </button>
  );
}
