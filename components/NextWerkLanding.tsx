"use client";

import { FormEvent, useState } from "react";

type Role = "worker" | "business";

const pathways = [
  {
    number: "01",
    title: "Bugün gelir",
    text: "Beceri pasaportunla çevrendeki kısa ve güvenilir projelere ulaş.",
    accent: "yellow",
  },
  {
    number: "02",
    title: "Yarın güçlen",
    text: "Otomotivdeki deneyimini EV, enerji, lojistik ve üretime taşı.",
    accent: "mint",
  },
  {
    number: "03",
    title: "Birlikte büyü",
    text: "Benzer uzmanlıkları bir ekipte topla, daha büyük işleri al.",
    accent: "coral",
  },
];

function ArrowUpRight() {
  return <span aria-hidden="true" className="nw-arrow">↗</span>;
}

function CheckIcon() {
  return <span aria-hidden="true" className="nw-check">✓</span>;
}

export default function NextWerkLanding() {
  const [role, setRole] = useState<Role>("worker");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submitWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <main className="nextwerk-site">
      <div className="nw-noise" aria-hidden="true" />
      <nav className="nw-nav" aria-label="Ana menü">
        <a className="nw-wordmark" href="#top" aria-label="NextWerk ana sayfa">
          <span className="nw-wordmark-mark">N</span>
          <span>next<span>werk</span></span>
        </a>
        <div className="nw-nav-links">
          <a href="#model">Model</a>
          <a href="#aile">Aile geliri</a>
          <a href="#isletmeler">İşletmeler</a>
        </div>
        <a className="nw-nav-cta" href="#erken-erisim">Erken erişim <ArrowUpRight /></a>
      </nav>

      <section className="nw-hero" id="top">
        <div className="nw-hero-copy">
          <p className="nw-kicker"><span className="nw-live-dot" /> Dönüşümün çalışan tarafı</p>
          <h1>İşini değil,<br /><em>yönünü</em> değiştir.</h1>
          <p className="nw-lead">Otomotivde yıllarca biriktirdiğin deneyimi yeni bir işe, ücretli projeye veya ailece büyüyen bir gelire dönüştür.</p>
          <div className="nw-hero-actions">
            <a className="nw-button nw-button-primary" href="#erken-erisim">Pilot programa katıl <ArrowUpRight /></a>
            <a className="nw-button nw-button-ghost" href="#model"><span className="nw-play">▶</span> Nasıl çalışır?</a>
          </div>
          <p className="nw-note">Çalışanlar ve aileleri için ücretsiz · Almanca + Türkçe</p>
        </div>

        <div className="nw-hero-visual" aria-label="NextWerk gelir paneli önizlemesi">
          <div className="nw-orbit nw-orbit-one" />
          <div className="nw-orbit nw-orbit-two" />
          <div className="nw-spark nw-spark-one">✦</div>
          <div className="nw-spark nw-spark-two">✦</div>
          <div className="nw-dashboard-card">
            <div className="nw-dashboard-top">
              <div>
                <span className="nw-card-label">NEXTWERK / HANE PANELİ</span>
                <h2>Gelir rotan</h2>
              </div>
              <span className="nw-avatar">MK</span>
            </div>
            <div className="nw-income-row">
              <div>
                <span className="nw-card-label">Bu ay hedef</span>
                <strong>€ 2.480</strong>
              </div>
              <span className="nw-growth">+24,8%</span>
            </div>
            <div className="nw-chart" aria-hidden="true">
              <span style={{ height: "34%" }} /><span style={{ height: "49%" }} /><span style={{ height: "42%" }} /><span style={{ height: "63%" }} /><span style={{ height: "56%" }} /><span style={{ height: "82%" }} /><span style={{ height: "100%" }} />
              <div className="nw-chart-line" />
            </div>
            <div className="nw-project-card">
              <span className="nw-project-icon">⌁</span>
              <div><strong>EV servis ekibi</strong><small>Wolfsburg · 3 kişilik ekip</small></div>
              <span className="nw-project-price">€ 780</span>
            </div>
            <div className="nw-dashboard-footer"><span><span className="nw-mini-dot" /> 4 yeni fırsat</span><span>Bu hafta</span></div>
          </div>
          <div className="nw-float-card nw-float-top"><span className="nw-float-icon mint">✓</span><div><strong>Beceri pasaportu</strong><small>Hazır · %92 eşleşme</small></div></div>
          <div className="nw-float-card nw-float-bottom"><span className="nw-float-icon yellow">↗</span><div><strong>İlk gelire kalan</strong><small><b>3 gün</b></small></div></div>
        </div>
      </section>

      <div className="nw-signal-bar" aria-label="Ürün özellikleri">
        <span><b>01</b> Beceri pasaportu</span><i />
        <span><b>02</b> Ücretli projeler</span><i />
        <span><b>03</b> Ekip kur</span><i />
        <span><b>04</b> Aile geliri</span>
      </div>

      <section className="nw-section nw-model" id="model">
        <div className="nw-section-intro">
          <p className="nw-kicker">Tek profil. Üç yol.</p>
          <h2>Deneyimin<br /><em>boşa gitmez.</em></h2>
        </div>
        <div className="nw-pathways">
          {pathways.map((pathway) => (
            <article className={`nw-pathway nw-pathway-${pathway.accent}`} key={pathway.number}>
              <div className="nw-pathway-number">{pathway.number}</div>
              <h3>{pathway.title}</h3>
              <p>{pathway.text}</p>
              <span className="nw-card-arrow"><ArrowUpRight /></span>
            </article>
          ))}
        </div>
      </section>

      <section className="nw-family-section" id="aile">
        <div className="nw-family-visual">
          <div className="nw-family-circle nw-family-circle-back" />
          <div className="nw-family-circle nw-family-circle-front">
            <span className="nw-family-symbol">⌂</span>
            <span>HANE<br />GELİRİ</span>
          </div>
          <div className="nw-family-tag nw-family-tag-one"><span className="nw-tag-bullet yellow" /> Teknik servis</div>
          <div className="nw-family-tag nw-family-tag-two"><span className="nw-tag-bullet mint" /> Özel ders</div>
          <div className="nw-family-tag nw-family-tag-three"><span className="nw-tag-bullet coral" /> Yerel hizmet</div>
        </div>
        <div className="nw-family-copy">
          <p className="nw-kicker">Ailece ilerleyin</p>
          <h2>Bir kişinin işi değil,<br /><em>hanenin gücü.</em></h2>
          <p>NextWerk, iş arayan kişiyi tek başına bırakmaz. Evdeki becerileri, zamanı ve bağlantıları tek bir gelir planında birleştirir.</p>
          <ul className="nw-check-list">
            <li><CheckIcon /> Eş ve aile üyeleri için ayrı beceri profilleri</li>
            <li><CheckIcon /> Ortak ekip ve proje başvurusu</li>
            <li><CheckIcon /> Eğitim, destek ve ilk gelir takibi</li>
          </ul>
          <a className="nw-inline-link" href="#erken-erisim">Hane profilini keşfet <ArrowUpRight /></a>
        </div>
      </section>

      <section className="nw-section nw-how">
        <div className="nw-how-heading"><p className="nw-kicker">Dört adımda başlangıç</p><h2>İlk gelire giden yol<br /><em>karmaşık değil.</em></h2></div>
        <div className="nw-steps">
          <div className="nw-step"><span>01</span><strong>Profilini aç</strong><p>Ne yaptığını değil, neyi iyi yaptığını anlat.</p></div>
          <div className="nw-step"><span>02</span><strong>Rotanı seç</strong><p>İş, proje veya ekip: sana uyan yolu belirle.</p></div>
          <div className="nw-step"><span>03</span><strong>Eşleş</strong><p>Yakınındaki gerçek taleplerle bağlantı kur.</p></div>
          <div className="nw-step"><span>04</span><strong>İlk geliri al</strong><p>İlerlemeyi ve hane hedefini panelinden takip et.</p></div>
        </div>
      </section>

      <section className="nw-business-section" id="isletmeler">
        <div><p className="nw-kicker">İşletmeler için</p><h2>İhtiyacın olan<br /><em>ekip burada.</em></h2></div>
        <div className="nw-business-copy"><p>Yerel işletmeler, yılların üretim ve kalite deneyimine sahip insanlara ulaşır. Kısa proje, vardiya veya kalıcı ekip ihtiyacını tek yerden yayınla.</p><a className="nw-button nw-button-light" href="#erken-erisim">İşletme olarak katıl <ArrowUpRight /></a></div>
      </section>

      <section className="nw-waitlist-section" id="erken-erisim">
        <div className="nw-waitlist-copy"><p className="nw-kicker">İlk pilot bölgelere açılıyoruz</p><h2>Yeni bölümün<br /><em>buradan başlasın.</em></h2><p>Wolfsburg, Zwickau, Hannover, Emden ve Neckarsulm çevresinde ilk kullanıcıları topluyoruz.</p></div>
        <div className="nw-waitlist-card">
          {!submitted ? (
            <form onSubmit={submitWaitlist}>
              <span className="nw-card-label">ERKEN ERİŞİM</span>
              <h3>Kim olarak geliyorsun?</h3>
              <div className="nw-role-toggle" role="group" aria-label="Katılım türü">
                <button type="button" className={role === "worker" ? "active" : ""} onClick={() => setRole("worker")}>Çalışan / aile</button>
                <button type="button" className={role === "business" ? "active" : ""} onClick={() => setRole("business")}>İşletme</button>
              </div>
              <label className="nw-email-label" htmlFor="waitlist-email">E-posta adresin</label>
              <div className="nw-email-row"><input id="waitlist-email" type="email" placeholder="sen@ornek.de" value={email} onChange={(event) => setEmail(event.target.value)} required /><button className="nw-submit" type="submit" aria-label="Erken erişime katıl"><ArrowUpRight /></button></div>
              <p className="nw-form-note">Spam yok. Pilot açıldığında ilk sen haberdar ol.</p>
            </form>
          ) : (
            <div className="nw-success-state"><span className="nw-success-icon">✓</span><span className="nw-card-label">KAYDIN ALINDI</span><h3>Rotanı birlikte çizelim.</h3><p>{role === "worker" ? "Çalışan ve aile pilotu" : "İşletme pilotu"} için seni listeye ekledik.</p><button type="button" className="nw-reset" onClick={() => { setSubmitted(false); setEmail(""); }}>Başka kayıt ekle</button></div>
          )}
        </div>
      </section>

      <footer className="nw-footer"><a className="nw-wordmark" href="#top"><span className="nw-wordmark-mark">N</span><span>next<span>werk</span></span></a><p>İşten sonraki hayat için gelir altyapısı.</p><span className="nw-footer-note">Volkswagen AG ile bağlantılı değildir · © 2026 NextWerk</span></footer>
    </main>
  );
}
