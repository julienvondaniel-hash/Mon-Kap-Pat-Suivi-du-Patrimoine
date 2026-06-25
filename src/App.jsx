import React, { useState, useEffect } from "react";
import { LogOut, Users, User as UserIcon, Sun, Moon } from "lucide-react";
import Auth from "./components/Auth.jsx";
import Logo from "./components/Logo.jsx";
import ClientApp, { CLIENT_TABS } from "./components/ClientApp.jsx";
import BackOffice from "./components/BackOffice.jsx";
import { onAuthChange, getSession, signOut, getProfile, setThemePreference } from "./lib/data";
import { useIsDesktop } from "./lib/useIsDesktop";
import { ThemeProvider, useTheme } from "./lib/theme.jsx";

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("client");
  const [tab, setTab] = useState("patrimoine");
  const [mode, setMode] = useState("dark");
  const isDesktop = useIsDesktop();

  useEffect(() => {
    getSession().then((s) => { setSession(s); setReady(true); });
    const unsub = onAuthChange((s) => setSession(s));
    return unsub;
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      getProfile(session.user.id).then(({ data }) => {
        setProfile(data);
        if (data?.theme) setMode(data.theme);
      });
    } else { setProfile(null); }
  }, [session]);

  const logout = async () => { await signOut(); setSession(null); };
  const toggleTheme = async () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    setThemePreference(next);   // persistance silencieuse
  };

  if (!ready) return <div style={{ minHeight: "100vh", background: "#0A1226" }} />;
  if (!session) return <ThemeProvider mode={mode}><Auth /></ThemeProvider>;

  const isAdvisor = profile?.role === "advisor" || profile?.role === "admin";
  const prenom = profile?.prenom || "—";

  return (
    <ThemeProvider mode={mode}>
      <Shell
        isDesktop={isDesktop} isAdvisor={isAdvisor} prenom={prenom}
        view={view} setView={setView} tab={tab} setTab={setTab}
        mode={mode} toggleTheme={toggleTheme} logout={logout}
      />
    </ThemeProvider>
  );
}

function Shell({ isDesktop, isAdvisor, prenom, view, setView, tab, setTab, mode, toggleTheme, logout }) {
  const C = useTheme();
  const showBackoffice = isAdvisor && view === "backoffice";

  /* ============================ ORDINATEUR ============================ */
  if (isDesktop) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.ivory }}>
        <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <aside style={{ width: 256, flexShrink: 0, background: C.navy, borderRight: `1px solid ${C.navyLine}`, display: "flex", flexDirection: "column", padding: "26px 16px", boxSizing: "border-box", position: "sticky", top: 0, height: "100vh", color: C.onNavy }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px 22px" }}>
            <Logo size={34} radius={9} />
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "0.01em", lineHeight: 1.15 }}>Mon Kap<br />Pat</div>
          </div>

          {isAdvisor && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
              <SideToggle C={C} active={view === "client"} onClick={() => setView("client")} icon={UserIcon} label="Vue client" />
              <SideToggle C={C} active={view === "backoffice"} onClick={() => setView("backoffice")} icon={Users} label="Mes clients" />
            </div>
          )}

          {!showBackoffice && (
            <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: C.onNavy, opacity: .55, padding: "8px 12px 4px" }}>Espace</div>
              {CLIENT_TABS.map((t) => (
                <NavItem key={t.id} C={C} active={tab === t.id} onClick={() => setTab(t.id)} icon={t.icon} label={t.label} />
              ))}
            </nav>
          )}

          <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${C.navyLine}` }}>
            <button onClick={toggleTheme} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "none", border: `1px solid ${C.navyLine}`, borderRadius: 10, padding: "10px", cursor: "pointer", color: C.onNavy, fontSize: 13, marginBottom: 10 }}>
              {mode === "dark" ? <Sun size={15} /> : <Moon size={15} />} {mode === "dark" ? "Thème clair" : "Thème sombre"}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 12px" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.navyLine, display: "flex", alignItems: "center", justifyContent: "center", color: C.brass, fontSize: 13, fontWeight: 600 }}>
                {prenom?.[0] || "?"}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prenom}</div>
                <div style={{ fontSize: 11, color: C.onNavy, opacity: .6 }}>{isAdvisor ? "Conseiller" : "Client"}</div>
              </div>
            </div>
            <button onClick={logout} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "none", border: `1px solid ${C.navyLine}`, borderRadius: 10, padding: "10px", cursor: "pointer", color: C.onNavy, opacity: .8, fontSize: 13 }}>
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
    <div style={{ display: "flex", justifyContent: "center", minHeight: "100vh", background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <div style={{ width: "100%", maxWidth: 430, background: C.ink, display: "flex", flexDirection: "column", position: "relative", minHeight: "100vh" }}>
        <div style={{ padding: "22px 20px 16px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", background: C.navy, color: C.onNavy }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <Logo size={30} radius={8} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "0.02em", lineHeight: 1.1 }}>Mon Kap Pat</div>
              <div style={{ fontSize: 11, marginTop: 1, opacity: .65 }}>
                {isAdvisor ? (view === "backoffice" ? "Back-office cabinet" : "Vue client") : `Bonjour ${prenom}`}
              </div>
            </div>
          </div>
          <button onClick={toggleTheme} title="Changer de thème" style={{ background: "none", border: `1px solid ${C.navyLine}`, borderRadius: 9, padding: 8, cursor: "pointer", display: "flex", marginRight: 8 }}>
            {mode === "dark" ? <Sun size={16} color={C.onNavy} /> : <Moon size={16} color={C.onNavy} />}
          </button>
          <button onClick={logout} title="Se déconnecter" style={{ background: "none", border: `1px solid ${C.navyLine}`, borderRadius: 9, padding: 8, cursor: "pointer", display: "flex" }}>
            <LogOut size={16} color={C.onNavy} />
          </button>
        </div>

        {isAdvisor && (
          <div style={{ display: "flex", gap: 6, padding: "12px 18px 0" }}>
            <Toggle C={C} active={view === "client"} onClick={() => setView("client")} icon={UserIcon} label="Vue client" />
            <Toggle C={C} active={view === "backoffice"} onClick={() => setView("backoffice")} icon={Users} label="Mes clients" />
          </div>
        )}

        {showBackoffice
          ? <div style={{ flex: 1, padding: "18px 18px 40px", overflowY: "auto" }}><BackOffice /></div>
          : <ClientApp tab={tab} setTab={setTab} isDesktop={false} />}
      </div>
    </div>
  );
}

function NavItem({ C, active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", borderRadius: 10, cursor: "pointer", border: "none", textAlign: "left", width: "100%",
      background: active ? "rgba(132,183,190,0.16)" : "transparent", color: active ? C.brass : C.onNavy, opacity: active ? 1 : .75, fontSize: 14, fontWeight: active ? 600 : 400 }}>
      <Icon size={18} strokeWidth={active ? 2.3 : 1.8} /> {label}
    </button>
  );
}
function SideToggle({ C, active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
      border: `1px solid ${active ? C.brass : C.navyLine}`, background: active ? C.brass : "transparent", color: active ? C.navy : C.onNavy }}>
      <Icon size={15} /> {label}
    </button>
  );
}
function Toggle({ C, active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, border: `1px solid ${active ? C.brass : C.line}`, background: active ? C.brass : "transparent", color: active ? (C.mode === "light" ? "#fff" : C.navy) : C.ivorySoft }}>
      <Icon size={15} /> {label}
    </button>
  );
}
