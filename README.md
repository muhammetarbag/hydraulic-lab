# Hydraulic Lab — ATA 29

HEE 305 Hava Aracı Sistemleri-II için Türkçe, React + TypeScript tabanlı etkileşimli eğitim uygulaması. Genel transport-category aircraft prensiplerini öğretir; belirli bir uçağın hidrolik mimarisini veya gerçek bakım prosedürlerini temsil etmez.

## Çalıştırma

Node.js 22.13+ ve npm gerekir. Node 26 ile doğrulanmıştır.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 3029
```

Uygulama: http://localhost:3029

```sh
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Tarayıcı testleri mevcut yerel sunucuyu kullanır; yoksa başlatır. Linux'ta varsa `/usr/bin/chromium`, diğer ortamlarda Playwright Chromium kullanılır (`npx playwright install chromium`).

## Çalışan ekranlar

- **Simülasyon:** SVG akış şeması, analog/dijital basınç, gaz ve sıvı kesitleri, pompa ON/OFF, üç konumlu selector, dört seçilebilir tüketici, basınç geçmişi ve yedi aşamalı Normal Operation.
- **Arıza laboratuvarı:** Dokuz ayrı senaryo, tahmin alanı, açıklama, arıza vurgusu ve örnek ikazlar. Her senaryo temiz, şarjlı başlangıç durumundan başlar.
- **Öğrenme:** Sekiz bölüm; her bölümde anlatım, canlı görsel, sistemde deney bağlantısı ve üç açıklamalı soru.
- **Parça kütüphanesi:** On altı bileşen; görev, yer, giriş/çıkış, arıza etkisi ve sınav notu. Akümülatör ve aktüatörde canlı kesit.
- **Sınav provası:** 24 özgün, üç seçenekli soru; her seçeneğin gerekçesi, skor ve yanlış konu listesi. Resmî EASA soru bankası değildir.
- **Model ve kaynaklar:** FAA, Parker, Collins Aerospace ve Safran referansları; sayısal varsayımlar ve kapsam sınırları.

Öğrenme ve sınav ilerlemesi modlar arasında korunur; sayfa yenilendiğinde sıfırlanır. Haricî hesap, API anahtarı, öğrenci verisi gönderimi veya sunucu veritabanı gerekmez. Fontlar yerel paketlerden servis edilir.

## Simülasyon modeli

`lib/simulation.ts` kullanıcı arayüzünden bağımsız, deterministik fizik/olay modelidir. `lib/useSimulation.ts` tüm arayüzün kullandığı tek durumu yönetir. `lib/content.ts` bileşen, senaryo, ders ve soru verilerini tutar. Ekran bileşenleri `components/lab/` içindedir. Vinext/Vite, React uygulamasını derler; başlangıç yapısı Sites scaffold'undan gelir.

Basınç, kaynak debileri ile aktüatör, kaçak ve relief çıkışları arasındaki farktan hesaplanır. Hat esnekliği ve sonlu gaz akümülatörü hesaba katılır. Gazda mutlak basınçla `p × V^1.4 = sabit` yaklaşımı kullanılır. Basınç, debi, sıvı miktarı ve aktüatör konumu birbirinden ayrı büyüklüklerdir.

| Parametre | Bu modeldeki değer |
|---|---|
| Nominal sistem basıncı | 3000 psi |
| Relief açılma eşiği | 3450 psi |
| Akümülatör gaz ön dolumu | 1000 psi |
| Gaz hacmi (sıvı tarafı boşken) | 1 L |
| RAT basınç hedefi | 2700 psi |
| RAT çalışma eşiği | 90 kt |
| Regülasyon arızası deney hedefi | 3900 psi |
| Depo kapasitesi | 9 L |

Bunlar öğretim parametreleridir, uçak verisi değildir. Gerçek kaynakların sistem dağılımı, debileri ve yedekliliği uçak tipine göre değişir.

- Akümülatör ve relief, basınç manifolduna **paralel** bağlıdır.
- Ana, elektrik ve RAT pompalarının ayrı check valve'ları vardır. Yüksek manifold basıncına karşı RAT kolundan sahte ileri akış gösterilmez.
- Regülatör, değişken deplasmanlı pompanın kompansatörünü temsil eder. Kesikli bağlantı bir basınç algılama bağlantısıdır.
- RAT tek kaynakken uçuş kumandaları ve frenler beslenir; iniş takımı ve nose wheel steering izole edilir.
- Kaynaklar aynı depoyu paylaşır. Yedek pompa büyük dış kaçakla kaybolan sıvıyı geri üretemez.
- Akümülatör arızası kullanılabilir gaz desteği kaybını, selector arızası nötrde sıkışmayı temsil eder. Bunlar bütün olası arıza türleri değildir.
- Relief kapalı sıkışması tek başına aşırı basınç oluşturmaz. Sonucu görmek için ek regülasyon arızası gerekir.
- Eşdeğer aktüatör alanı, basitleştirilmiş yük ve yaklaşık rod hacmi etkisi kullanılır. Sıcaklık, dinamik kavitasyon, su darbesi ve gerçek uçuş yüzeyi yükleri çözülmez.
- Normal Operation, eşzamanlı gerçekleşebilen süreçleri öğretim için sırayla vurgular.
- Pnömatik basınç ve servicing kavramsal düzeyde anlatılır; pnömatik ağ ve bakım işlemleri simüle edilmez.

## Test kapsamı

19 model/içerik testi; kapalı merkez, şarj/deşarj, ileri/geri hareket, tüm arızalar, RAT hız ve öncelik sınırları, kaçakta ortak kaynak tükenmesi ve beş dakikalık sayısal sınır kontrollerini kapsar.

Dokuz Playwright senaryosu; tarayıcıdaki kumandaları, yedi aşamalı çevrimi, dokuz arızayı, dersleri, 24 soruyu, kesit panelini, mobil taşmayı ve isteğe bağlı WebMCP sözleşmesini sınar. WebMCP testi bir test kayıt ortamı kullanır; yerel tarayıcıda bu deneysel standardın bulunması zorunlu değildir.

`npm run lint`, uygulama kaynaklarını ve testleri kapsar. Değiştirilmemiş scaffold UI katalog dosyaları kapsam dışıdır.

## GitHub Pages

Yayın adresi: https://muhammetarbag.github.io/hydraulic-lab/

```sh
npm run build:pages
npm run test:pages
```

`build:pages`, aynı React uygulamasını `/hydraulic-lab` taban yoluyla statik olarak derler. GitHub'a yalnız `dist/client/hydraulic-lab/` altındaki HTML, JavaScript, CSS, fontlar ve ikon gönderilir; Worker, Node.js sunucusu veya haricî hesap gerekmez. Kaynak depo `https://github.com/muhammetarbag/hydraulic-lab`.

`.github/workflows/pages.yml` her `main` güncellemesinde temiz bağımlılık kurulumu, tip kontrolü, uygulama lint kontrolü, 19 model/içerik testi, bağımlılık denetimi, statik derleme ve 9 tarayıcı testini çalıştırır. Kontroller geçerse GitHub Pages yayını güncellenir. Pull request'lerde kontroller çalışır, yayın yapılmaz.
