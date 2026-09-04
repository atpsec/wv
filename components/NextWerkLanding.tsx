"use client";

import { FormEvent, useEffect, useState } from "react";

type Role = "worker" | "business";
type Language = "de" | "tr";

const pathways = [
  { number: "01", accent: "yellow" },
  { number: "02", accent: "mint" },
  { number: "03", accent: "coral" },
] as const;

const copy = {
  de: {
    navLabel: "Hauptmenü", model: "So funktioniert's", family: "Familieneinkommen", businesses: "Für Unternehmen", early: "Frühzugang",
    heroKicker: "Die Arbeitnehmerseite des Wandels", heroTitle: <>Dein Können bleibt.<br /><em>Wechsel die</em> Richtung.</>,
    heroLead: "Mach aus deiner Erfahrung eine neue Stelle, bezahlte Projekte oder ein Einkommen, das als Familie wächst.", join: "Am Pilot teilnehmen", how: "So funktioniert's", freeNote: "Für Mitarbeitende und Familien kostenlos · Deutsch + Türkisch",
    visualLabel: "Vorschau des NextWerk-Einkommenspanels", householdPanel: "NEXTWERK / HAUSHALTS-PANEL", incomeRoute: "Deine Einkommensroute", monthlyGoal: "MONATSZIEL", evTeam: "E-Mobilitäts-Service-Team", teamLocation: "Wolfsburg · 3er-Team", newOpportunities: "4 neue Chancen", thisWeek: "Diese Woche", skillPass: "Kompetenzpass", skillStatus: "Bereit · 92 % Match", firstIncome: "Bis zum ersten Einkommen",
    signalLabel: "Produktfunktionen", signals: ["Kompetenzpass", "Bezahlte Projekte", "Team gründen", "Familieneinkommen"],
    modelKicker: "Ein Profil. Drei Wege.", modelTitle: <>Dein Können<br /><em>bleibt.</em></>,
    pathways: [["Jetzt verdienen", "Erreiche mit deinem Kompetenzpass kurze und verlässliche Projekte in deiner Nähe."], ["Morgen wachsen", "Übertrage deine Erfahrung in Automotive auf E-Mobilität, Energie, Logistik und Produktion."], ["Gemeinsam skalieren", "Bilde ein Team aus ähnlichen Fähigkeiten und übernehmt größere Aufträge."]],
    familyKicker: "Als Familie vorankommen", familyTitle: <>Nicht nur der Job einer Person,<br /><em>sondern die Stärke des Haushalts.</em></>, familyBody: "NextWerk lässt Arbeitssuchende nicht allein. Wir verbinden Fähigkeiten, Zeit und Kontakte aus dem ganzen Haushalt in einem gemeinsamen Einkommensplan.", familyBullets: ["Separate Kompetenzprofile für Partner und Familie", "Gemeinsame Bewerbung als Team auf Projekte", "Bildung, Unterstützung und erstes Einkommen im Blick"], familyLink: "Haushaltsprofil entdecken",
    stepsKicker: "Start in vier Schritten", stepsTitle: <>Der Weg zum ersten Einkommen<br /><em>ist nicht kompliziert.</em></>, steps: [["Profil erstellen", "Zeige nicht nur, was du getan hast – sondern, was du gut kannst."], ["Route wählen", "Job, Projekt oder Team: Wähle, was zu dir passt."], ["Match finden", "Verbinde dich mit echten Anfragen in deiner Nähe."], ["Erstes Einkommen", "Verfolge deinen Fortschritt und euer Haushaltsziel."]],
    businessKicker: "Für Unternehmen", businessTitle: <>Das Team, das du brauchst<br /><em>ist hier.</em></>, businessBody: "Lokale Unternehmen erreichen Menschen mit jahrelanger Produktions- und Qualitätserfahrung. Veröffentliche kurze Projekte, Schichten oder deinen Bedarf an einem festen Team.", businessJoin: "Als Unternehmen teilnehmen",
    waitlistKicker: "Wir öffnen die ersten Pilotregionen", waitlistTitle: <>Dein nächstes Kapitel<br /><em>beginnt hier.</em></>, waitlistBody: "Wolfsburg, Zwickau, Hannover, Emden und Neckarsulm: Hier sammeln wir die ersten Teilnehmenden.", earlyLabel: "FRÜHZUGANG", roleQuestion: "Wie kommst du zu uns?", workerRole: "Mitarbeitende / Familie", businessRole: "Unternehmen", emailLabel: "Deine E-Mail-Adresse", emailPlaceholder: "du@beispiel.de", noSpam: "Kein Spam. Wir melden uns, sobald der Pilot startet.", roleGroup: "Teilnahmeart", submitLabel: "Für den Frühzugang anmelden", successLabel: "ANMELDUNG ERHALTEN", successTitle: "Lass uns deine Route planen.", workerSuccess: "Wir haben dich für den Mitarbeitenden- und Familienpilot vorgemerkt.", businessSuccess: "Wir haben dich für den Unternehmenspilot vorgemerkt.", reset: "Weitere Anmeldung",
    footerBody: "Infrastruktur für Einkommen nach dem Job.", footerNote: "Nicht mit Volkswagen AG verbunden · © 2026 NextWerk", languageLabel: "Sprache / Dil",
  },
  tr: {
    navLabel: "Ana menü", model: "Model", family: "Aile geliri", businesses: "İşletmeler", early: "Erken erişim",
    heroKicker: "Dönüşümün çalışan tarafı", heroTitle: <>İşini değil,<br /><em>yönünü</em> değiştir.</>,
    heroLead: "Otomotivde yıllarca biriktirdiğin deneyimi yeni bir işe, ücretli projeye veya ailece büyüyen bir gelire dönüştür.", join: "Pilot programa katıl", how: "Nasıl çalışır?", freeNote: "Çalışanlar ve aileleri için ücretsiz · Almanca + Türkçe",
    visualLabel: "NextWerk gelir paneli önizlemesi", householdPanel: "NEXTWERK / HANE PANELİ", incomeRoute: "Gelir rotan", monthlyGoal: "BU AY HEDEF", evTeam: "EV servis ekibi", teamLocation: "Wolfsburg · 3 kişilik ekip", newOpportunities: "4 yeni fırsat", thisWeek: "Bu hafta", skillPass: "Beceri pasaportu", skillStatus: "Hazır · %92 eşleşme", firstIncome: "İlk gelire kalan",
    signalLabel: "Ürün özellikleri", signals: ["Beceri pasaportu", "Ücretli projeler", "Ekip kur", "Aile geliri"],
    modelKicker: "Tek profil. Üç yol.", modelTitle: <>Deneyimin<br /><em>boşa gitmez.</em></>,
    pathways: [["Bugün gelir", "Beceri pasaportunla çevrendeki kısa ve güvenilir projelere ulaş."], ["Yarın güçlen", "Otomotivdeki deneyimini EV, enerji, lojistik ve üretime taşı."], ["Birlikte büyü", "Benzer uzmanlıkları bir ekipte topla, daha büyük işleri al."]],
    familyKicker: "Ailece ilerleyin", familyTitle: <>Bir kişinin işi değil,<br /><em>hanenin gücü.</em></>, familyBody: "NextWerk, iş arayan kişiyi tek başına bırakmaz. Evdeki becerileri, zamanı ve bağlantıları tek bir gelir planında birleştirir.", familyBullets: ["Eş ve aile üyeleri için ayrı beceri profilleri", "Ortak ekip ve proje başvurusu", "Eğitim, destek ve ilk gelir takibi"], familyLink: "Hane profilini keşfet",
    stepsKicker: "Dört adımda başlangıç", stepsTitle: <>İlk gelire giden yol<br /><em>karmaşık değil.</em></>, steps: [["Profilini aç", "Ne yaptığını değil, neyi iyi yaptığını anlat."], ["Rotanı seç", "İş, proje veya ekip: sana uyan yolu belirle."], ["Eşleş", "Yakınındaki gerçek taleplerle bağlantı kur."], ["İlk geliri al", "İlerlemeyi ve hane hedefini panelinden takip et."]],
    businessKicker: "İşletmeler için", businessTitle: <>İhtiyacın olan<br /><em>ekip burada.</em></>, businessBody: "Yerel işletmeler, yılların üretim ve kalite deneyimine sahip insanlara ulaşır. Kısa proje, vardiya veya kalıcı ekip ihtiyacını tek yerden yayınla.", businessJoin: "İşletme olarak katıl",
    waitlistKicker: "İlk pilot bölgelere açılıyoruz", waitlistTitle: <>Yeni bölümün<br /><em>buradan başlasın.</em></>, waitlistBody: "Wolfsburg, Zwickau, Hannover, Emden ve Neckarsulm çevresinde ilk kullanıcıları topluyoruz.", earlyLabel: "ERKEN ERİŞİM", roleQuestion: "Kim olarak geliyorsun?", workerRole: "Çalışan / aile", businessRole: "İşletme", emailLabel: "E-posta adresin", emailPlaceholder: "sen@ornek.de", noSpam: "Spam yok. Pilot açıldığında ilk sen haberdar ol.", roleGroup: "Katılım türü", submitLabel: "Erken erişime katıl", successLabel: "KAYDIN ALINDI", successTitle: "Rotanı birlikte çizelim.", workerSuccess: "Çalışan ve aile pilotu için seni listeye ekledik.", businessSuccess: "İşletme pilotu için seni listeye ekledik.", reset: "Başka kayıt ekle",
    footerBody: "İşten sonraki hayat için gelir altyapısı.", footerNote: "Volkswagen AG ile bağlantılı değildir · © 2026 NextWerk", languageLabel: "Sprache / Dil",
  },
} as const;

function ArrowUpRight() { return <span aria-hidden="true" className="nw-arrow">↗</span>; }
function CheckIcon() { return <span aria-hidden="true" className="nw-check">✓</span>; }

export default function NextWerkLanding() {
  const [language, setLanguage] = useState<Language>("de");
  const [role, setRole] = useState<Role>("worker");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const c = copy[language];

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  function submitWaitlist(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (email.trim()) setSubmitted(true); }

  return (
    <main className="nextwerk-site">
      <div className="nw-noise" aria-hidden="true" />
      <nav className="nw-nav" aria-label={c.navLabel}>
        <a className="nw-wordmark" href="#top" aria-label="NextWerk"><span className="nw-wordmark-mark">N</span><span>next<span>werk</span></span></a>
        <div className="nw-nav-links"><a href="#model">{c.model}</a><a href="#aile">{c.family}</a><a href="#isletmeler">{c.businesses}</a></div>
        <div className="nw-nav-actions"><div className="nw-language-toggle" role="group" aria-label={c.languageLabel}><button type="button" className={language === "de" ? "active" : ""} onClick={() => setLanguage("de")}>DE</button><button type="button" className={language === "tr" ? "active" : ""} onClick={() => setLanguage("tr")}>TR</button></div><a className="nw-nav-cta" href="#erken-erisim">{c.early} <ArrowUpRight /></a></div>
      </nav>

      <section className="nw-hero" id="top"><div className="nw-hero-copy"><p className="nw-kicker"><span className="nw-live-dot" /> {c.heroKicker}</p><h1>{c.heroTitle}</h1><p className="nw-lead">{c.heroLead}</p><div className="nw-hero-actions"><a className="nw-button nw-button-primary" href="#erken-erisim">{c.join} <ArrowUpRight /></a><a className="nw-button nw-button-ghost" href="#model"><span className="nw-play">▶</span> {c.how}</a></div><p className="nw-note">{c.freeNote}</p></div>
        <div className="nw-hero-visual" aria-label={c.visualLabel}><div className="nw-orbit nw-orbit-one" /><div className="nw-orbit nw-orbit-two" /><div className="nw-spark nw-spark-one">✦</div><div className="nw-spark nw-spark-two">✦</div><div className="nw-dashboard-card"><div className="nw-dashboard-top"><div><span className="nw-card-label">{c.householdPanel}</span><h2>{c.incomeRoute}</h2></div><span className="nw-avatar">MK</span></div><div className="nw-income-row"><div><span className="nw-card-label">{c.monthlyGoal}</span><strong>€ 2.480</strong></div><span className="nw-growth">+24,8%</span></div><div className="nw-chart" aria-hidden="true"><span style={{ height: "34%" }} /><span style={{ height: "49%" }} /><span style={{ height: "42%" }} /><span style={{ height: "63%" }} /><span style={{ height: "56%" }} /><span style={{ height: "82%" }} /><span style={{ height: "100%" }} /><div className="nw-chart-line" /></div><div className="nw-project-card"><span className="nw-project-icon">⌁</span><div><strong>{c.evTeam}</strong><small>{c.teamLocation}</small></div><span className="nw-project-price">€ 780</span></div><div className="nw-dashboard-footer"><span><span className="nw-mini-dot" /> {c.newOpportunities}</span><span>{c.thisWeek}</span></div></div><div className="nw-float-card nw-float-top"><span className="nw-float-icon mint">✓</span><div><strong>{c.skillPass}</strong><small>{c.skillStatus}</small></div></div><div className="nw-float-card nw-float-bottom"><span className="nw-float-icon yellow">↗</span><div><strong>{c.firstIncome}</strong><small><b>3 {language === "de" ? "Tage" : "gün"}</b></small></div></div></div>
      </section>

      <div className="nw-signal-bar" aria-label={c.signalLabel}>{c.signals.map((signal, index) => <span key={signal}><b>0{index + 1}</b> {signal}</span>)}<i /><i /><i /></div>
      <section className="nw-section nw-model" id="model"><div className="nw-section-intro"><p className="nw-kicker">{c.modelKicker}</p><h2>{c.modelTitle}</h2></div><div className="nw-pathways">{pathways.map((pathway, index) => <article className={`nw-pathway nw-pathway-${pathway.accent}`} key={pathway.number}><div className="nw-pathway-number">{pathway.number}</div><h3>{c.pathways[index][0]}</h3><p>{c.pathways[index][1]}</p><span className="nw-card-arrow"><ArrowUpRight /></span></article>)}</div></section>
      <section className="nw-family-section" id="aile"><div className="nw-family-visual"><div className="nw-family-circle nw-family-circle-back" /><div className="nw-family-circle nw-family-circle-front"><span className="nw-family-symbol">⌂</span><span>{language === "de" ? <>HAUSHALTS<br />EINKOMMEN</> : <>HANE<br />GELİRİ</>}</span></div><div className="nw-family-tag nw-family-tag-one"><span className="nw-tag-bullet yellow" /> {language === "de" ? "Technischer Service" : "Teknik servis"}</div><div className="nw-family-tag nw-family-tag-two"><span className="nw-tag-bullet mint" /> {language === "de" ? "Nachhilfe" : "Özel ders"}</div><div className="nw-family-tag nw-family-tag-three"><span className="nw-tag-bullet coral" /> {language === "de" ? "Lokale Dienste" : "Yerel hizmet"}</div></div><div className="nw-family-copy"><p className="nw-kicker">{c.familyKicker}</p><h2>{c.familyTitle}</h2><p>{c.familyBody}</p><ul className="nw-check-list">{c.familyBullets.map((bullet) => <li key={bullet}><CheckIcon /> {bullet}</li>)}</ul><a className="nw-inline-link" href="#erken-erisim">{c.familyLink} <ArrowUpRight /></a></div></section>
      <section className="nw-section nw-how"><div className="nw-how-heading"><p className="nw-kicker">{c.stepsKicker}</p><h2>{c.stepsTitle}</h2></div><div className="nw-steps">{c.steps.map((step, index) => <div className="nw-step" key={step[0]}><span>0{index + 1}</span><strong>{step[0]}</strong><p>{step[1]}</p></div>)}</div></section>
      <section className="nw-business-section" id="isletmeler"><div><p className="nw-kicker">{c.businessKicker}</p><h2>{c.businessTitle}</h2></div><div className="nw-business-copy"><p>{c.businessBody}</p><a className="nw-button nw-button-light" href="#erken-erisim">{c.businessJoin} <ArrowUpRight /></a></div></section>
      <section className="nw-waitlist-section" id="erken-erisim"><div className="nw-waitlist-copy"><p className="nw-kicker">{c.waitlistKicker}</p><h2>{c.waitlistTitle}</h2><p>{c.waitlistBody}</p></div><div className="nw-waitlist-card">{!submitted ? <form onSubmit={submitWaitlist}><span className="nw-card-label">{c.earlyLabel}</span><h3>{c.roleQuestion}</h3><div className="nw-role-toggle" role="group" aria-label={c.roleGroup}><button type="button" className={role === "worker" ? "active" : ""} onClick={() => setRole("worker")}>{c.workerRole}</button><button type="button" className={role === "business" ? "active" : ""} onClick={() => setRole("business")}>{c.businessRole}</button></div><label className="nw-email-label" htmlFor="waitlist-email">{c.emailLabel}</label><div className="nw-email-row"><input id="waitlist-email" type="email" placeholder={c.emailPlaceholder} value={email} onChange={(event) => setEmail(event.target.value)} required /><button className="nw-submit" type="submit" aria-label={c.submitLabel}><ArrowUpRight /></button></div><p className="nw-form-note">{c.noSpam}</p></form> : <div className="nw-success-state"><span className="nw-success-icon">✓</span><span className="nw-card-label">{c.successLabel}</span><h3>{c.successTitle}</h3><p>{role === "worker" ? c.workerSuccess : c.businessSuccess}</p><button type="button" className="nw-reset" onClick={() => { setSubmitted(false); setEmail(""); }}>{c.reset}</button></div>}</div></section>
      <footer className="nw-footer"><a className="nw-wordmark" href="#top"><span className="nw-wordmark-mark">N</span><span>next<span>werk</span></span></a><p>{c.footerBody}</p><span className="nw-footer-note">{c.footerNote}</span></footer>
    </main>
  );
}
