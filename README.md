# ATP Privacy Tools

`atpaivideo.com` için sıfırdan oluşturulmuş, Next.js App Router tabanlı telefon görünümlü web uygulaması.

## Yerel çalıştırma

```bash
npm ci
npm run dev
```

Üretim kontrolü:

```bash
npm run typecheck
npm run lint
npm run build
npm run start:hostinger
```

## Veri ve güvenlik

- Kullanıcı ve session kayıtları, varsayılan olarak Hostinger’ın kalıcı dosya sistemindeki `DATA_DIR` altında tutulur.
- `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` verilirse aynı store Upstash Redis REST API’yi kullanır.
- Parolalar düz metin olarak tutulmaz; Node.js `scrypt` ile hashlenir.
- Session token’ının yalnızca hash’i store’a yazılır; tarayıcı cookie’si `HttpOnly`, `SameSite=Lax` ve üretimde `Secure` olarak ayarlanır.
- `localStorage` sadece tema tercihine ayrılmıştır; parola, session veya kullanıcı verisi oraya yazılmaz.

## Araçların kapsamı

- IP aracı, reverse proxy tarafından uygulamaya iletilen istemci IP’sini gösterir.
- DNS aracı, uygulama sunucusunun varsayılan resolver’ını Cloudflare ve Google resolver’larıyla karşılaştırır. Tarayıcıdan yerel DNS resolver’ını doğrudan görmek mümkün olmadığı için bu sonuç kesin bir VPN DNS leak kanıtı değildir; arayüzde bu sınır açıkça gösterilir.
- Hız aracı, tarayıcı ile uygulama sunucusu arasında gerçek indirme/yükleme aktarımı ölçer.

## Hostinger Node.js App

- Build command: `npm ci && npm run build`
- Start command: `npm run start:hostinger`
- Node.js: 20.9+ (öneri: güncel LTS)
- Production env: `.env.hostinger.example` dosyasındaki değişkenleri Hostinger paneline ekleyin.
- `NEXT_PUBLIC_SITE_URL=https://atpaivideo.com` olarak ayarlanmalıdır.
- `atpaivideo.com` ana domain olarak tanımlanmalı. Uygulama `www.atpaivideo.com` isteklerini `https://atpaivideo.com` adresine 308 canonical redirect ile yönlendirir; Hostinger panelindeki domain redirect seçeneği de ek güvenlik katmanı olarak kullanılabilir.
- Gmail/Google ile giriş için Google Cloud Console’da bir OAuth Client ID (Web application) oluşturun. Authorized redirect URI olarak tam olarak `https://atpaivideo.com/api/auth/google/callback` adresini ekleyin; ardından `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` ve `GOOGLE_REDIRECT_URI` değişkenlerini Hostinger’a ekleyin. Yerelde callback adresi `http://localhost:3000/api/auth/google/callback` olmalıdır.
- Google akışı `state` ve PKCE ile korunur; doğrulanmış Google e-postasıyla mevcut aynı e-posta hesabı güvenli biçimde ilişkilendirilebilir. Google bilgileri veya access token kalıcı olarak saklanmaz.

`DATA_DIR` dosya sistemi kalıcılığı garanti edilmiyorsa Upstash değişkenlerini ekleyin. Üretimde güçlü, benzersiz ve en az 32 karakterlik bir `SESSION_SECRET` kullanın.
