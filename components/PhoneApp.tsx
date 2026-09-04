"use client";

import { FormEvent, useEffect, useState } from "react";

type User = { id: string; email: string; username: string; createdAt: string };
type Tab = "home" | "tools" | "profile";
type ToolName = "ip" | "dns" | "speed";
type Theme = "light" | "dark";

const tools = [
  { id: "ip" as const, icon: "⌁", title: "IP adresim", description: "Bağlantının sunucuya ulaşan IP adresini gör." },
  { id: "dns" as const, icon: "◌", title: "DNS testi", description: "Uygulama sunucusunun DNS çözümlemesini kontrol et." },
  { id: "speed" as const, icon: "↯", title: "Hız testi", description: "Sunucu bağlantısının indirme ve yükleme hızını ölç." }
];

async function responseJson(response: Response): Promise<Record<string, unknown>> {
  try { return (await response.json()) as Record<string, unknown>; }
  catch { return {}; }
}

export default function PhoneApp() {
  const [theme, setTheme] = useState<Theme>("light");
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("home");
  const [activeTool, setActiveTool] = useState<ToolName | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("atpaivideo-theme");
    if (savedTheme === "dark" || savedTheme === "light") window.setTimeout(() => setTheme(savedTheme), 0);
    fetch("/api/auth/me", { cache: "no-store" })
      .then(responseJson)
      .then((data) => setUser((data.user as User | null) || null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("atpaivideo-theme", theme);
  }, [theme]);

  if (user === undefined) return <PhoneShell><div className="loading">ATP Privacy Tools yükleniyor…</div></PhoneShell>;
  if (!user) return <PhoneShell><AuthScreen onAuthenticated={setUser} /></PhoneShell>;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setTab("home");
    setActiveTool(null);
  }

  function openTool(tool: ToolName) { setActiveTool(tool); }
  function closeTool() { setActiveTool(null); setTab("tools"); }

  return (
    <PhoneShell>
      <div className="phone-content">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">A</div>
            <div><strong>ATP Privacy</strong><small>Güvenli bağlantı araçları</small></div>
          </div>
          <button className="icon-button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="Temayı değiştir">{theme === "light" ? "☾" : "☀"}</button>
        </header>

        {activeTool ? <ToolView tool={activeTool} onBack={closeTool} /> : (
          <>
            {tab === "home" && <HomeView user={user} onOpenTool={openTool} />}
            {tab === "tools" && <ToolsView onOpenTool={openTool} />}
            {tab === "profile" && <ProfileView user={user} onLogout={logout} />}
          </>
        )}
      </div>
      {!activeTool && <nav className="bottom-nav" aria-label="Ana menü">
        <NavItem active={tab === "home"} icon="⌂" label="Ana sayfa" onClick={() => setTab("home")} />
        <NavItem active={tab === "tools"} icon="◈" label="Araçlar" onClick={() => setTab("tools")} />
        <NavItem active={tab === "profile"} icon="●" label="Profil" onClick={() => setTab("profile")} />
      </nav>}
    </PhoneShell>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return <main className="page-stage"><section className="phone-frame"><div className="phone-screen">{children}</div></section></main>;
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (mode === "register" && password !== confirmPassword) { setError("Şifreler aynı olmalı."); return; }
    setBusy(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, ...(mode === "register" ? { username } : {}) })
      });
      const data = await responseJson(response);
      if (!response.ok || !data.user) { setError(typeof data.error === "string" ? data.error : "İşlem tamamlanamadı."); return; }
      onAuthenticated(data.user as User);
    } catch { setError("Sunucuya ulaşılamadı. Lütfen tekrar deneyin."); }
    finally { setBusy(false); }
  }

  return <div className="auth-wrap">
    <div className="auth-logo">A</div>
    <h1>Bağlantını kontrol altında tut.</h1>
    <p className="muted">Basit araçlar, açık sonuçlar ve güvenli bir kişisel panel.</p>
    <div className="auth-tabs">
      <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>Giriş yap</button>
      <button className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setError(""); }}>Kayıt ol</button>
    </div>
    <form onSubmit={submit}>
      {mode === "register" && <div className="field"><label htmlFor="username">Kullanıcı adı</label><input id="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={2} maxLength={32} /></div>}
      <div className="field"><label htmlFor="email">E-posta</label><input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
      <div className="field"><label htmlFor="password">Şifre</label><input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} /></div>
      {mode === "register" && <div className="field"><label htmlFor="confirmPassword">Şifre tekrar</label><input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} maxLength={128} /></div>}
      {error && <div className="error-box" role="alert">{error}</div>}
      <button className="primary-button" type="submit" disabled={busy}>{busy ? "İşleniyor…" : mode === "login" ? "Giriş yap" : "Güvenli hesap oluştur"}</button>
    </form>
    <p className="muted" style={{ marginTop: 18, fontSize: 11 }}>Şifren tarayıcıda tutulmaz; sunucuda güvenli hash olarak saklanır.</p>
  </div>;
}

function HomeView({ user, onOpenTool }: { user: User; onOpenTool: (tool: ToolName) => void }) {
  return <>
    <p className="eyebrow">Kişisel panel</p>
    <h1>Merhaba, {user.username}.</h1>
    <p className="muted">Bağlantı durumunu birkaç saniyede kontrol et.</p>
    <div className="hero-card"><p className="eyebrow">Bugünün özeti</p><h2>Gizlilik, anlaşılır olduğunda işe yarar.</h2><p>IP, DNS ve hız ölçümlerini aynı telefon arayüzünde tut.</p></div>
    <div className="status-pill"><span className="status-dot" />Oturumun güvende</div>
    <div className="section-row"><h3>Hızlı araçlar</h3><span>3 araç</span></div>
    <div className="tool-grid">{tools.map((tool) => <ToolCard key={tool.id} tool={tool} onClick={() => onOpenTool(tool.id)} />)}</div>
  </>;
}

function ToolsView({ onOpenTool }: { onOpenTool: (tool: ToolName) => void }) {
  return <><p className="eyebrow">Araçlar</p><h1>Bağlantını incele.</h1><p className="muted">Her araç gerçek bir istek veya ölçüm yapar; sonuç yoksa bunu açıkça gösterir.</p><div className="tool-grid" style={{ marginTop: 22 }}>{tools.map((tool) => <ToolCard key={tool.id} tool={tool} onClick={() => onOpenTool(tool.id)} />)}</div></>;
}

function ToolCard({ tool, onClick }: { tool: (typeof tools)[number]; onClick: () => void }) {
  return <button className="tool-card" onClick={onClick}><div className="tool-icon">{tool.icon}</div><h3>{tool.title}</h3><p>{tool.description}</p></button>;
}

function ProfileView({ user, onLogout }: { user: User; onLogout: () => void }) {
  const initial = user.username.trim().charAt(0).toUpperCase() || "A";
  return <><p className="eyebrow">Profil</p><h1>Hesap bilgilerin.</h1><div className="profile-card"><div className="avatar">{initial}</div><div><strong>{user.username}</strong><span>{user.email}</span></div></div><div className="profile-section"><h3>Oturum güvenliği</h3><p className="muted">Oturumun HttpOnly cookie ile korunur. Şifren API yanıtlarına dahil edilmez.</p></div><button className="danger-button" onClick={onLogout}>Çıkış yap</button></>;
}

function ToolView({ tool, onBack }: { tool: ToolName; onBack: () => void }) {
  const config = tools.find((item) => item.id === tool)!;
  return <><div className="tool-view-header"><button className="back-button" onClick={onBack} aria-label="Araçlara dön">←</button><div><p className="eyebrow" style={{ marginBottom: 3 }}>Araç</p><h2 style={{ margin: 0 }}>{config.title}</h2></div></div>{tool === "ip" && <IpTool />}{tool === "dns" && <DnsTool />}{tool === "speed" && <SpeedTool />}</>;
}

function IpTool() {
  const [ip, setIp] = useState<string | null>(null);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true); setError("");
    try { const response = await fetch("/api/tools/ip", { cache: "no-store" }); const data = await responseJson(response); if (!response.ok || typeof data.ip !== "string" || data.ip === "unknown") throw new Error("Sunucu istemci IP’sini iletmedi."); setIp(data.ip); setSource(String(data.source || "")); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "IP adresi alınamadı."); }
    finally { setBusy(false); }
  }
  return <><p className="muted">Bu sonuç, isteğinin uygulama sunucusuna ulaşırken görülen IP adresidir.</p><button className="primary-button" onClick={run} disabled={busy}>{busy ? "Kontrol ediliyor…" : "IP adresimi göster"}</button>{error && <div className="error-box" style={{ marginTop: 16 }}>{error}</div>}{ip && <div className="tool-result"><p className="eyebrow">Görünen IP</p><div className="result-value">{ip}</div><p className="result-meta">Kaynak: {source}</p></div>}</>;
}

type DnsData = { system: { resolver: string; latencyMs: number; answers: Record<string, string[]>; error?: string }; publicResolvers: Array<{ resolver: string; latencyMs: number; answers: Record<string, string[]>; error?: string }>; limitation: string };

function DnsTool() {
  const [data, setData] = useState<DnsData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true); setError("");
    try { const response = await fetch("/api/tools/dns", { cache: "no-store" }); const payload = await responseJson(response); if (!response.ok || !payload.system) throw new Error(typeof payload.error === "string" ? payload.error : "DNS testi tamamlanamadı."); setData(payload as unknown as DnsData); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "DNS testi tamamlanamadı."); }
    finally { setBusy(false); }
  }
  return <><p className="muted">Üç alan adını sunucunun varsayılan resolver’ı ve iki herkese açık resolver ile karşılaştırır.</p><div className="info-box">Önemli: Tarayıcı üzerinden yerel DNS resolver’ını kesin olarak görmek mümkün değildir. Bu test, sunucu tarafındaki DNS davranışını raporlar.</div><button className="primary-button" onClick={run} disabled={busy}>{busy ? "DNS sorgulanıyor…" : "DNS testini başlat"}</button>{error && <div className="error-box" style={{ marginTop: 16 }}>{error}</div>}{data && <div className="tool-result"><p className="eyebrow">Gerçek ölçüm</p><div className="metric"><span>{data.system.resolver}</span><strong>{data.system.error || `${data.system.latencyMs} ms`}</strong></div>{data.publicResolvers.map((item) => <div className="metric" key={item.resolver}><span>{item.resolver}</span><strong>{item.error || `${item.latencyMs} ms`}</strong></div>)}<p className="result-meta" style={{ margin: "12px 0 0" }}>{data.limitation}</p></div>}</>;
}

function SpeedTool() {
  const [result, setResult] = useState<{ download: number; upload: number } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true); setError(""); setResult(null);
    try {
      const downloadStarted = performance.now();
      const downloadResponse = await fetch("/api/tools/speed?bytes=2097152", { cache: "no-store" });
      if (!downloadResponse.ok) throw new Error("İndirme testi başarısız oldu.");
      const downloadData = await downloadResponse.arrayBuffer();
      const downloadMs = performance.now() - downloadStarted;
      const uploadData = new Uint8Array(1024 * 1024);
      const uploadStarted = performance.now();
      const uploadResponse = await fetch("/api/tools/speed", { method: "POST", body: uploadData, cache: "no-store" });
      if (!uploadResponse.ok) throw new Error("Yükleme testi başarısız oldu.");
      const uploadJson = await responseJson(uploadResponse);
      const uploadMs = performance.now() - uploadStarted;
      const uploadedBytes = Number(uploadJson.bytes) || uploadData.byteLength;
      setResult({ download: (downloadData.byteLength * 8) / downloadMs / 1000, upload: (uploadedBytes * 8) / uploadMs / 1000 });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Hız testi tamamlanamadı."); }
    finally { setBusy(false); }
  }
  return <><p className="muted">ATP Privacy sunucusu ile tarayıcın arasındaki gerçek indirme ve yükleme aktarımını ölçer.</p><div className="info-box">Sonuç; cihazını, mevcut Wi‑Fi/operatörünü ve bu sunucuya olan yolu ölçer. Genel internet hızının kesin karşılığı değildir.</div><button className="primary-button" onClick={run} disabled={busy}>{busy ? "Ölçülüyor…" : "Hız testini başlat"}</button>{error && <div className="error-box" style={{ marginTop: 16 }}>{error}</div>}{result && <div className="tool-result"><p className="eyebrow">Gerçek ölçüm</p><div className="metric"><span>İndirme</span><strong>{result.download.toFixed(2)} Mbps</strong></div><div className="metric"><span>Yükleme</span><strong>{result.upload.toFixed(2)} Mbps</strong></div></div>}</>;
}

function NavItem({ active, icon, label, onClick }: { active: boolean; icon: string; label: string; onClick: () => void }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}><span className="nav-emoji">{icon}</span><span>{label}</span></button>;
}
