import type { ComponentId, Consumer, Failure } from './simulation';
export interface ComponentInfo {
  id: ComponentId;
  name: string;
  english: string;
  duty: string;
  location: string;
  input: string;
  output: string;
  failure: string;
  critical: string;
}
function component(
  id: ComponentId,
  name: string,
  english: string,
  duty: string,
  location: string,
  input: string,
  output: string,
  failure: string,
  critical: string,
): ComponentInfo {
  return {
    id,
    name,
    english,
    duty,
    location,
    input,
    output,
    failure,
    critical,
  };
}
export const components: ComponentInfo[] = [
  component(
    'reservoir',
    'Hidrolik deposu',
    'Hydraulic reservoir',
    'Sıvı rezervi sağlar; genleşmeye, hava ayrışmasına ve dönüş sıvısının dinlenmesine hacim ayırır.',
    'Pompa emişinden önce ve dönüş hattının sonunda.',
    'Tüketicilerden gelen düşük basınçlı sıvı depoya döner.',
    'Pompalara kesintisiz sıvı beslemesi sağlanır.',
    'Düşük seviye hava emişine, kavitasyona ve basınç kaybına neden olabilir.',
    'Depo, sistemin yüksek basıncını depolayan akümülatör ile aynı parça değildir.',
  ),
  component(
    'fluid',
    'Hidrolik sıvı',
    'Hydraulic fluid',
    'Gücü iletir; uygun özellikleriyle yağlamaya, sızdırmazlığa ve ısı taşımaya katkıda bulunur.',
    'Depo, pompalar, hatlar ve tüketicilerin içindedir.',
    'Pompadan mekanik enerji alır.',
    'Enerjiyi aktüatörde kuvvet ve harekete dönüştürür.',
    'Kirlenme valfleri sıkıştırabilir; yanlış sıvı contalara zarar verebilir. Hava, sistemin etkin sıkışabilirliğini artırır.',
    'Sıvı tipi ve conta uyumluluğu üretici verisine göre seçilir; renk tek başına yeterli değildir.',
  ),
  component(
    'filter',
    'Emiş filtresi / süzgeci',
    'Suction filter / strainer',
    'Pompa girişinde kaba kirleticileri tutar. İnce filtreler gerçek mimariye göre basınç ve dönüş hatlarında da bulunur.',
    'Bu şemada ana pompanın emişinde. Elektrik ve RAT kolları ayrı emiş bağlantılarıyla sadeleştirilmiştir.',
    'Depodan gelen sıvı filtre elemanına ulaşır.',
    'Daha temiz sıvı, küçük bir basınç kaybıyla pompaya gider.',
    'Tıkanma emiş direncini artırır, pompa beslemesini ve debiyi düşürür; kavitasyon riski doğar.',
    'Bu modelde emiş süzgeci bypass içermez. Her filtrede bypass bulunduğunu varsayma.',
  ),
  component(
    'pump',
    'Motor tahrikli pompa',
    'Engine-driven / mechanically driven pump',
    'Motor milinden aldığı mekanik enerjiyle hidrolik akış oluşturur.',
    'Depo beslemesi ile check valve ve basınç manifoldu arasında.',
    'Düşük basınçlı sıvı ve mekanik mil gücü gelir.',
    'Yükün gerektirdiği basınca karşı sıvı akışı üretilir.',
    'Ana akış kaybolur; mevcut basınç bir anda sıfır olmaz. Akümülatör ve diğer kaynakların durumu belirleyicidir.',
    'Pompa basıncı tek başına dayatmaz; akış, yük direnci ve basınç kontrolü birlikte sistem basıncını belirler.',
  ),
  component(
    'electric',
    'Elektrikli hidrolik pompa',
    'Electric hydraulic pump',
    'Elektrik motorunun mekanik gücünü hidrolik akışa dönüştürür.',
    'Depodan ayrı bir emiş kolu, check valve üzerinden ortak basınç hattı.',
    'Elektrik beslemesi ve hidrolik sıvı gerekir.',
    'Bu eğitim modelinde tüm tüketicilere yardımcı hidrolik güç sağlar.',
    'Elektrik pompası arızasında ana pompa sağlamsa sistem çalışabilir; tek kaynaksa basınç azalır.',
    'Elektrik pompası sınırsız bağımsızlık sağlamaz: elektrik beslemesi ve sıvı kaynağı da gerekir.',
  ),
  component(
    'accumulator',
    'Akümülatör',
    'Hydraulic accumulator',
    'Ani debi talebini destekler, basınç dalgalanmalarını sönümler ve sınırlı enerji rezervi sağlar.',
    'Basınç manifolduna paralel bir kol ile bağlıdır.',
    'Hidrolik basınç gaz ön dolumunu aştığında sıvı içeri girer.',
    'Basınç düştüğünde azot genleşir ve depolanmış sıvıyı sisteme iter.',
    'Gaz ön dolumu kaybında tampon ve yedek enerji azalır. Sağlam pompa ile kararlı basınç yine normal görünebilir.',
    'Enerji sıkıştırılan gazda depolanır. Hidrolik sıvı büyük ölçüde sıkıştırılamaz; akümülatör bir sürekli güç kaynağı değildir.',
  ),
  component(
    'regulator',
    'Basınç regülatörü',
    'Pressure regulator / pump compensator',
    'Normal çalışma basıncını düzenler. Bu model, basınca duyarlı değişken deplasmanlı pompa telafisini temsil eder.',
    'Pompa basıncını algılayan kontrol bağlantısı; kesikli hat algılama bağlantısıdır.',
    'Sistem basıncı geri besleme olarak algılanır.',
    'Hedefe yaklaşınca pompa deplasmanı ve debisi azalır.',
    'Yüksek basınç yönündeki kontrol arızasında bağımsız relief valve korumasına ihtiyaç doğar.',
    'Regülatör normal kontrol elemanıdır; relief valve son basınç sınırlama korumasıdır. Aynı görev değillerdir.',
  ),
  component(
    'relief',
    'Basınç tahliye valfi',
    'Pressure relief valve',
    'Aşırı basınçta açılarak sıvıyı düşük basınçlı dönüş hattına yönlendirir.',
    'Basınç ve dönüş manifoldu arasında paralel kol.',
    'Yay kuvvetine karşı basınç kuvveti etki eder.',
    'Eşik aşıldığında dönüşe akış başlar; normalde kapalıdır.',
    'Açık kalırsa basınç tutmak zorlaşır ve ısı oluşabilir. Kapalı kalırsa aşırı basınç koruması kaybolur.',
    'Kapalı sıkışması tek başına basıncı yükseltmez. Regülasyon arızası veya başka aşırı basınç kaynağı da gerekir.',
  ),
  component(
    'check',
    'Çek valf',
    'Check valve / non-return valve',
    'Akışa tek yönde izin verir; ters akışı engeller.',
    'Üç pompa çıkışında, basınç manifolduna katılmadan önce.',
    'Pompa tarafındaki basınç ileri yönde yeterliyse valf açılır.',
    'Akış manifolda geçer; pompa durduğunda geri akış engellenir.',
    'Ters sızdırırsa basınç durmuş pompa koluna kaçabilir; kapalı sıkışırsa ilgili pompa beslemesi kesilir.',
    'Check valve basıncı üretmez ve aktif yön seçimi yapmaz.',
  ),
  component(
    'selector',
    'Yön kontrol valfi',
    'Selector / directional control valve',
    'P, T, A ve B portlarını komuta göre bağlayarak aktüatör yönünü belirler.',
    'Basınç ve dönüş hatları ile çift etkili aktüatör arasında.',
    'P portuna basınçlı sıvı, kumanda mekanizmasına hareket komutu gelir.',
    'Uzatmada P→A, B→T; geri çekmede P→B, A→T. Nötrde iş portları kapalıdır.',
    'Bu senaryoda nötrde sıkışır: hat basıncı normal kalabilir ancak aktüatör hareket etmez.',
    'Yönü bağlantılar, hızı debi belirler. Basınç göstergesinin normal olması hareket garantisi değildir.',
  ),
  component(
    'actuator',
    'Çift etkili aktüatör',
    'Double-acting actuator',
    'Hidrolik enerjiyi mekanik kuvvet ve doğrusal harekete dönüştürür.',
    'Selector valve iş portları ile tüketici mekanizması arasında.',
    'Bir odasına basınçlı akış girerken diğer odası dönüşe bağlanır.',
    'Piston ve kol hareket eder; karşı odanın sıvısı dönüşe çıkar.',
    'İç kaçak yük altında sürüklenmeye, dış kaçak sıvı kaybına, mekanik sıkışma hareketsizliğe yol açabilir.',
    'Temel bağıntı F≈Δp×A. Tek kollu pistonda iki etkin alan farklıdır; burada hareket hesabı eşdeğer alanla sadeleştirilir.',
  ),
  component(
    'pressure',
    'Basınç hattı',
    'Pressure line',
    'Hidrolik gücü kaynaklardan tüketicilere taşır.',
    'Pompa check valve çıkışları, akümülatör ve selector valve P portu arasında.',
    'Pompalar veya akümülatör basınçlı akış sağlar.',
    'Kumanda valflerine ve paralel kollara güç iletilir.',
    'Dış kaçak rezervuar miktarını azaltır; pompa kapasitesi kaçağı karşılayamazsa basınç düşer.',
    'Basınç ile debi aynı şey değildir. Kapalı hat yüksek basınç taşıyabilir, fakat büyük sürekli akış olmayabilir.',
  ),
  component(
    'return',
    'Dönüş hattı',
    'Return line',
    'Tüketicilerden ve tahliye kolundan çıkan sıvıyı depoya geri taşır.',
    'Selector valve T portu ve relief çıkışı ile depo arasında.',
    'Düşük basınçlı kullanılmış akış gelir.',
    'Depoya dönen sıvı yeniden kullanılabilir.',
    'Kısıtlama geri basıncı artırabilir ve aktüatörün kullanılabilir basınç farkını azaltabilir.',
    'Dönüş hattı da basınç taşır; basıncı ideal olarak mutlak sıfır değildir. Bu model dönüşü referans basınç kabul eder.',
  ),
  component(
    'rat',
    'Ram hava türbini',
    'Ram air turbine / emergency pump',
    'Hava akımından mekanik güç alır. Bu modelde türbin doğrudan bir hidrolik pompayı sürer.',
    'Ayrı emiş ve check valve kolu üzerinden ortak manifolda bağlıdır.',
    'Yeterli hava hızı ve kullanılabilir hidrolik sıvı gerekir.',
    'Sınırlı debiyle öncelikli tüketicileri besler.',
    'Düşük hava hızı veya ortak depodaki ciddi sıvı kaybı desteği azaltır ya da durdurur.',
    'RAT tasarımları hidrolik, elektrik veya hibrit olabilir. Buradaki 90 kt eşiği ve tüketici listesi yalnızca eğitim varsayımıdır.',
  ),
  component(
    'priority',
    'Öncelik valfi',
    'Priority valve',
    'Kısıtlı güçte kritik tüketicileri korumak için düşük öncelikli kolları ayırır.',
    'Manifold ile tüketici dağıtımı arasında; dağıtım kolları tek seçiciyle sadeleştirilmiştir.',
    'Sınırlı emergency beslemesi gelir.',
    'Bu modelde RAT tek kaynak olduğunda uçuş kumandaları ve frenler beslenir.',
    'Arızası öncelik sırasını bozabilir; burada ayrı bir arıza senaryosu olarak modellenmemiştir.',
    'Bu eğitimde iniş takımı ve nose wheel steering RAT ile izole edilir. Gerçek acil dağıtım uçak tipine göre değişir.',
  ),
  component(
    'indication',
    'Gösterge ve ikazlar',
    'Indication & warning systems',
    'Basınç, sıvı miktarı ve kaynak durumunu izleyerek anormal durumları fark ettirir.',
    'Manifold basınç algılayıcısı, depo seviye algılayıcısı ve pompa izleme noktaları.',
    'Sensör verileri ve sistem durumları gelir.',
    'Basınç/miktar göstergeleri ve örnek kokpit mesajları oluşur.',
    'Sensör arızası gerçek sistem durumundan farklı bir gösterge oluşturabilir; tanı tek veriye dayanmaz.',
    'LOW PRESS bir belirti, PUMP FAULT olası kaynağa ilişkin bilgidir. Aynı şey değildir; her mekanik arızanın özel kokpit mesajı yoktur.',
  ),
];
export const componentMap = Object.fromEntries(
  components.map((c) => [c.id, c]),
) as Record<ComponentId, ComponentInfo>;
export const consumers: {
  id: Consumer;
  name: string;
  english: string;
  ata: string;
}[] = [
  {
    id: 'flight',
    name: 'Uçuş kumandaları',
    english: 'Flight controls',
    ata: 'ATA 27',
  },
  { id: 'gear', name: 'İniş takımı', english: 'Landing gear', ata: 'ATA 32' },
  { id: 'brakes', name: 'Frenler', english: 'Brakes', ata: 'ATA 32' },
  {
    id: 'steering',
    name: 'Burun tekeri yönlendirme',
    english: 'Nose wheel steering',
    ata: 'ATA 32',
  },
];
export const failures: {
  id: Failure;
  name: string;
  english: string;
  component: ComponentId;
  prediction: string;
  explanation: string;
  hint: string;
}[] = [
  {
    id: 'main',
    name: 'Ana pompa arızası',
    english: 'Engine-driven pump failure',
    component: 'pump',
    prediction: 'Pompa durduğu anda aktüatör de mutlaka durur mu?',
    explanation:
      'Hayır. Şarjlı akümülatör kısa süre sıvı sağlar. Basınç ve kullanılabilir enerji azaldıkça hareket yavaşlar; elektrik pompası veya uygun hava hızında RAT yeniden güç sağlayabilir.',
    hint: 'Basıncı, akümülatör sıvısını ve aktüatör hızını birlikte izle.',
  },
  {
    id: 'electric',
    name: 'Elektrik pompası arızası',
    english: 'Electric pump failure',
    component: 'electric',
    prediction:
      'Elektrik pompası arızası her zaman tüm hidrolik sistemi devre dışı bırakır mı?',
    explanation:
      'Hayır. Sağlam ana pompa besleyebilir. Etkiyi göstermek için bu senaryo ana pompa kapalı ve elektrik pompası tek kaynak olarak başlar; ana pompayı açarak farkı gör.',
    hint: 'Ana pompayı ON yap ve basıncın toparlanmasını izle.',
  },
  {
    id: 'leak',
    name: 'Hidrolik kaçak',
    english: 'Hydraulic leak',
    component: 'pressure',
    prediction: 'Basınç bir süre normale yakınken sıvı seviyesi düşebilir mi?',
    explanation:
      'Evet. Pompa ilk anda kaçağı karşılayabilir. Depo miktarı yine azalır; besleme yetersizleşince basınç da düşer. Ortak depoya bağlı yedek pompa kaybolan sıvıyı geri getirmez.',
    hint: 'Miktar ve basınç göstergelerini 30–60 saniye karşılaştır.',
  },
  {
    id: 'lowLevel',
    name: 'Düşük depo seviyesi',
    english: 'Low reservoir level',
    component: 'reservoir',
    prediction: 'Pompa ON göstergesi yeterli sıvı beslemesini kanıtlar mı?',
    explanation:
      'Hayır. Yetersiz depo seviyesi emişi bozar, hava girişine ve kavitasyon riskine yol açar. Motor dönse bile gereken debi sağlanamayabilir.',
    hint: 'Valfi aç ve düşük seviyenin yük altındaki etkisini gözle.',
  },
  {
    id: 'filter',
    name: 'Tıkalı emiş filtresi',
    english: 'Clogged filter',
    component: 'filter',
    prediction:
      'Emiş filtresi tıkanınca pompa çıkış basıncı zorunlu olarak artar mı?',
    explanation:
      'Hayır. Emişteki kısıtlama pompayı sıvısız bırakabilir; bu modelde ana pompa debisi düşer. Filtrenin türü ve bypass tasarımı gerçek sistemde sonucu değiştirir.',
    hint: 'Aktüatörü hareket ettir; ardından ayrı emiş kolundaki elektrik pompasını dene.',
  },
  {
    id: 'accumulator',
    name: 'Akümülatör arızası',
    english: 'Accumulator failure',
    component: 'accumulator',
    prediction: 'Arızalı akümülatör varken sabit basınç normal görünebilir mi?',
    explanation:
      'Evet. Sağlam pompa normal basıncı sağlayabilir. Ana pompayı kapattığında tampon enerji olmadığından basıncın daha hızlı düştüğünü görürsün. Bu senaryo kullanılabilir gaz desteği kaybını temsil eder.',
    hint: 'Pompa ON/OFF geçişini sağlam akümülatörlü durumla kıyasla.',
  },
  {
    id: 'reliefOpen',
    name: 'Tahliye valfi açık sıkıştı',
    english: 'Relief valve stuck open',
    component: 'relief',
    prediction: 'Sürekli dönüşe açık bir yol basınç oluşmasını nasıl etkiler?',
    explanation:
      'Akışın önemli bölümü dönüşe kaçar. Pompa debisi bypass akışını karşılamakta zorlandığından basınç düşer. Sürekli dolaşım gerçekte ısınmaya da neden olabilir; sıcaklık bu modelde hesaplanmaz.',
    hint: 'Mavi tahliye akışını ve düşük basıncı birlikte izle.',
  },
  {
    id: 'reliefClosed',
    name: 'Tahliye valfi kapalı sıkıştı',
    english: 'Relief valve stuck closed',
    component: 'relief',
    prediction: 'Kapalı sıkışma tek başına aşırı basınç oluşturur mu?',
    explanation:
      'Hayır. Sağlam regülasyon basıncı normal tutar. “Regülasyon arızası” deneyini açarsan basınç yükselir; kapalı sıkışan relief, artık dönüşe tahliye edemez.',
    hint: 'Önce normal basıncı izle, sonra regülasyon arızasını aç.',
  },
  {
    id: 'selector',
    name: 'Yön kontrol valfi arızası',
    english: 'Selector valve failure',
    component: 'selector',
    prediction: 'Basınç normal, komut var, hareket yok: bu mümkün mü?',
    explanation:
      'Evet. Bu senaryoda selector nötrde sıkışır, P→A/B bağlantısı kurulmaz. Ana basınç normal olsa da aktüatör hareket etmez. Bütün selector arızaları bu şekilde gerçekleşmez.',
    hint: 'Uzat ve geri çek komutlarını ver; basınç ile hareketin farkına bak.',
  },
];
export interface Question {
  id: string;
  topic: string;
  prompt: string;
  options: [string, string, string];
  correct: 0 | 1 | 2;
  reasons: [string, string, string];
}
const q = (
  id: string,
  topic: string,
  prompt: string,
  options: Question['options'],
  correct: Question['correct'],
  reasons: Question['reasons'],
): Question => ({ id, topic, prompt, options, correct, reasons });
export const questions: Question[] = [
  q(
    'q01',
    'Sıvı ve depo',
    'Hidrolik deposunun temel görevi hangisidir?',
    [
      'Yüksek basınç enerjisini gazda depolamak',
      'Pompa için sıvı rezervi ve genleşme hacmi sağlamak',
      'Elektrik enerjisi üretmek',
    ],
    1,
    [
      'Bu, gazlı akümülatörün işlevini tarif eder.',
      'Depo pompa beslemesini ve hacim değişimlerini karşılar.',
      'Depo bir elektrik üreteci değildir.',
    ],
  ),
  q(
    'q02',
    'Sıvı ve depo',
    'Serviste uygun hidrolik sıvı nasıl seçilir?',
    [
      'Yalnızca rengine bakılarak',
      'Eldeki en düşük viskoziteli sıvı seçilerek',
      'Üretici spesifikasyonu ve malzeme uyumluluğu doğrulanarak',
    ],
    2,
    [
      'Renk tek başına türü ve uygunluğu kanıtlamaz.',
      'Viskozite tek seçim ölçütü değildir.',
      'Onaylı sıvı ve conta uyumluluğu birlikte gereklidir.',
    ],
  ),
  q(
    'q03',
    'Sıvı ve depo',
    'Hidrolik sıvıya hava karışması hangi etkiyi oluşturabilir?',
    [
      'Sistemin etkin sıkışabilirliğini artırır',
      'Basıncı her koşulda sabit tutar',
      'Sıvı ihtiyacını ortadan kaldırır',
    ],
    0,
    [
      'Gazın sıkışması gecikmeli ve süngerimsi tepkiye yol açabilir.',
      'Hava bir basınç regülatörü değildir.',
      'Hava hidrolik sıvının yerini uygun biçimde alamaz.',
    ],
  ),
  q(
    'q04',
    'Basınç üretimi',
    'Bir hidrolik pompa hakkında hangi ifade doğrudur?',
    [
      'Sıvı üretir',
      'Akış oluşturur; basınç yük direnciyle birlikte oluşur',
      'Yük olmasa da daima 3000 psi üretir',
    ],
    1,
    [
      'Pompa mevcut sıvıya enerji aktarır.',
      'Akışa karşı direnç ve regülasyon basıncı belirler.',
      '3000 psi bu modelin nominal değeridir; her koşul için zorunlu değildir.',
    ],
  ),
  q(
    'q05',
    'Basınç üretimi',
    'Kapalı merkezli sistemde nötr valf ve normal basınç varken ne beklenir?',
    [
      'Tüm debi sürekli aktüatörden geçer',
      'Sistem basıncı mutlaka sıfır olur',
      'Değişken deplasmanlı pompa debisini azaltır',
    ],
    2,
    [
      'Nötr valf iş portlarını kapatır.',
      'Hareketsiz bir sıvı da basınç taşıyabilir.',
      'Kompansatör basıncı algılar, debiyi kaçakları karşılayacak düzeye azaltır.',
    ],
  ),
  q(
    'q06',
    'Basınç üretimi',
    'Check valve hangi işi yapar?',
    [
      'Ters akışı önler',
      'Basıncı sıfırdan üretir',
      'Aktüatör yönünü pilot komutuyla seçer',
    ],
    0,
    [
      'İleri akışa izin verip ters basınçta kapanır.',
      'Enerji ekleyen bir pompa değildir.',
      'Komutla yön seçimi selector valve işidir.',
    ],
  ),
  q(
    'q07',
    'Akümülatör',
    'Gazlı akümülatörde enerji esas olarak nerede depolanır?',
    [
      'Sıvının sıcaklık renginde',
      'Sıkıştırılmış gazda',
      'Filtre gözeneklerinde',
    ],
    1,
    [
      'Renk enerji depolama mekanizması değildir.',
      'Sıvı girerken gaz sıkışır; genleşirken sıvıyı geri iter.',
      'Filtre kir tutar, kullanılabilir hidrolik enerji depolamaz.',
    ],
  ),
  q(
    'q08',
    'Akümülatör',
    'Ana pompa durduğunda şarjlı akümülatör ne sağlar?',
    [
      'Sınırsız süre nominal debi',
      'Yeni hidrolik sıvı üretimi',
      'Sınırlı hacim ve süreyle destek',
    ],
    2,
    [
      'Depolanmış enerji sonludur.',
      'Akümülatör sıvı üretmez.',
      'Gaz genleşip mevcut sıvıyı dışarı verir; rezerv azalır.',
    ],
  ),
  q(
    'q09',
    'Akümülatör',
    'Gaz ön dolumu olan, sıvı tarafı boş bir akümülatör için hangisi doğrudur?',
    [
      'Gaz basıncı bulunabilir; kullanılabilir hidrolik sıvı rezervi yoktur',
      'Ana sistem mutlaka ön dolum basıncındadır',
      'Aktüatör süresiz çalışır',
    ],
    0,
    [
      'Gaz ön dolumu ile sıvı tarafındaki sistem basıncı ayrı kavramlardır.',
      'Ayırıcı strok sonundayken ön dolum, boş hidrolik hattın basıncı demek değildir.',
      'Hidrolik sıvı rezervi olmadan sürekli hareket sağlayamaz.',
    ],
  ),
  q(
    'q10',
    'Basınç kontrolü',
    'Regülatör ve relief valve arasındaki temel fark nedir?',
    [
      'İkisi de yalnız yön seçer',
      'Regülatör normal kontrolü, relief aşırı basınç korumasını sağlar',
      'Relief valve normalde basınç üretir',
    ],
    1,
    [
      'Yön seçimi directional valve işlevidir.',
      'Görevleri ayrı ve birbirini tamamlayıcıdır.',
      'Relief bir kaynak değildir; gerektiğinde akışı dönüşe açar.',
    ],
  ),
  q(
    'q11',
    'Basınç kontrolü',
    'Relief valve kapalı sıkıştı; regülasyon sağlam. Ne beklenir?',
    [
      'Basınç mutlaka sürekli yükselir',
      'Depo anında boşalır',
      'Normal basınç sürebilir fakat aşırı basınç koruması kaybolur',
    ],
    2,
    [
      'Ek bir aşırı basınç nedeni olmadan yükselme zorunlu değildir.',
      'Kapalı relief bir dış kaçak değildir.',
      'Arıza gizli kalabilir; aşırı basınç olayında koruma yapamaz.',
    ],
  ),
  q(
    'q12',
    'Basınç kontrolü',
    'Relief valve açık sıkışırsa hangi belirti olasıdır?',
    [
      'Dönüşe bypass ve düşük sistem basıncı',
      'Tüm aktüatörlerin daha güçlü çalışması',
      'Hidrolik enerji üretiminin artması',
    ],
    0,
    [
      'Akışın dönüşe kaçması basınç tutmayı zorlaştırır.',
      'Bypass kullanılabilir gücü azaltır.',
      'Valf dışarıdan enerji eklemez.',
    ],
  ),
  q(
    'q13',
    'Valf ve aktüatör',
    'Çift etkili aktüatörü geri çekmek için ne yapılır?',
    [
      'Her iki oda sürekli depoya bağlanır',
      'Basınç ve dönüş bağlantıları odalar arasında değiştirilir',
      'Hidrolik sıvı türü değiştirilir',
    ],
    1,
    [
      'Bu bağlantı kontrollü basınç farkı sağlamaz.',
      'P→B ve A→T, uzatmanın bağlantılarını tersine çevirir.',
      'Yön değişimi bir sıvı seçimi konusu değildir.',
    ],
  ),
  q(
    'q14',
    'Valf ve aktüatör',
    'Etkin alan sabitken aktüatör hızı en doğrudan neye bağlıdır?',
    ['Sıvının rengine', 'ATA bölüm numarasına', 'Aktüatöre giren debiye'],
    2,
    [
      'Renk hareket hızını belirlemez.',
      'ATA numarası bir sınıflandırmadır.',
      'Yaklaşık v=Q/A; basınç farkı ise yükü yenebilmek için gerekir.',
    ],
  ),
  q(
    'q15',
    'Valf ve aktüatör',
    'Ana basınç normal fakat aktüatör hareket etmiyor. Hangisi mümkün?',
    [
      'Selector valve nötrde sıkışmıştır',
      'Bu durum fiziksel olarak imkânsızdır',
      'Depo mutlaka tamamen boştur',
    ],
    0,
    [
      'Basınç iş odasına yönlendirilemiyorsa hareket oluşmaz.',
      'Basınç göstergesi tek başına iş portlarındaki akışı kanıtlamaz.',
      'Depo boşluğu tek olası neden değildir.',
    ],
  ),
  q(
    'q16',
    'Dönüş sistemi',
    'Dönüş hattının amacı nedir?',
    [
      'Azotu aktüatöre göndermek',
      'Kullanılan hidrolik sıvıyı depoya geri taşımak',
      'Pompa tahrik milini döndürmek',
    ],
    1,
    [
      'Azot akümülatörde ayrı bölmede kalır.',
      'Kapalı sıvı çevriminin dönüş yolunu tamamlar.',
      'Pompa mili mekanik ya da elektrik motoruyla sürülür.',
    ],
  ),
  q(
    'q17',
    'Dönüş sistemi',
    'Dönüşte artan geri basınç ne yapabilir?',
    [
      'Aktüatördeki net basınç farkını her zaman artırır',
      'Hidrolik sıvı üretir',
      'Aktüatördeki kullanılabilir basınç farkını azaltır',
    ],
    2,
    [
      'Dönüş tarafındaki karşı basınç net farkı azaltır.',
      'Basınç, madde üretimi değildir.',
      'Kuvveti oluşturan iki oda arasındaki farktır.',
    ],
  ),
  q(
    'q18',
    'Dönüş sistemi',
    'Bir filtre için hangi genelleme yanlıştır?',
    [
      'Her filtre her koşulda bypass açar',
      'Tıkanma filtre üzerinde basınç kaybını artırabilir',
      'Filtre kirleticileri tutar',
    ],
    0,
    [
      'Bypass bulunması ve eşikleri tasarıma bağlıdır. Bu ifade yanlış genellemedir.',
      'Bu, filtrenin davranışı hakkında doğru bir ifadedir.',
      'Bu, filtrenin temel işlevi hakkında doğru bir ifadedir.',
    ],
  ),
  q(
    'q19',
    'Acil güç',
    'RAT gücünün kaynağı nedir?',
    [
      'Hidrolik sıvının kendi kendine çoğalması',
      'Uçağa göre hareket eden hava akımının enerjisi',
      'Yalnız akümülatördeki azot',
    ],
    1,
    [
      'Sıvı kendi kendine enerji üretmez.',
      'Türbin hava akımından mil gücü elde eder.',
      'RAT türbini akümülatör gazıyla dönmez.',
    ],
  ),
  q(
    'q20',
    'Acil güç',
    'Ortak depo ciddi kaçakla boşalırsa yedek pompa ne yapabilir?',
    [
      'Her durumda tam güç sağlar',
      'Kaybolan sıvıyı geri üretir',
      'Sıvı beslemesi olmadığı için destek veremeyebilir',
    ],
    2,
    [
      'Yedek pompa da sıvı kaynağına ihtiyaç duyar.',
      'Pompa enerji aktarır; sıvı üretmez.',
      'Ortak kaynak kaybı birden fazla pompayı etkileyebilir.',
    ],
  ),
  q(
    'q21',
    'Acil güç',
    'Pnömatik basınç üretimini hidrolikten ayıran özellik hangisidir?',
    [
      'Kompresör sıkıştırılabilir gaz üzerinde çalışır',
      'Pnömatik sistemde gaz sıkıştırılamaz',
      'Pnömatik depo her zaman 3000 psi hidrolik üretir',
    ],
    0,
    [
      'Gaz sıkışabilir; enerji ve basınç değişimi hidrolik sıvıdan farklıdır.',
      'Gazlar belirgin biçimde sıkıştırılabilirdir.',
      'Depo basınçlandırması ana hidrolik güç üretimiyle aynı şey değildir.',
    ],
  ),
  q(
    'q22',
    'Arayüzler ve ikazlar',
    'Bu eğitimde RAT tek kaynaksa hangi tüketiciler beslenir?',
    [
      'İniş takımı ve burun yönlendirme',
      'Uçuş kumandaları ve frenler',
      'Bütün tüketiciler sınırsız debiyle',
    ],
    1,
    [
      'Bu modelde bunlar düşük öncelikli olarak izole edilir.',
      'Bu uygulamanın açıkça tanımlanmış öncelik varsayımıdır; bütün uçaklara genellenmez.',
      'RAT gücü ve debisi sınırlıdır.',
    ],
  ),
  q(
    'q23',
    'Arayüzler ve ikazlar',
    'LOW PRESS ikazı neyi doğrudan bildirir?',
    [
      'Pompa milinin kesin kırıldığını',
      'Sıvının yanlış renkte olduğunu',
      'İzlenen basıncın eşiğin altında olduğunu',
    ],
    2,
    [
      'Mil kırılması nedenlerden biri olabilir; mesaj bunu tek başına kanıtlamaz.',
      'Basınç sensörü sıvı rengini ölçmez.',
      'Bu bir durum belirtisidir; nedeni başka göstergelerle araştırılır.',
    ],
  ),
  q(
    'q24',
    'Arayüzler ve ikazlar',
    'Basınç normal görünürken depo miktarı sürekli azalıyor. Ne düşünülmelidir?',
    [
      'Pompanın bir süre karşılayabildiği dış kaçak olabilir',
      'Normal basınç, kaçağı kesin dışlar',
      'Akümülatör sınırsız sıvı üretiyordur',
    ],
    0,
    [
      'Basınç ve miktar birlikte değerlendirilmelidir.',
      'Pompa bir süre kaybı karşılayabilir.',
      'Akümülatör sınırlı sıvı rezervine sahiptir.',
    ],
  ),
];
export interface Lesson {
  title: string;
  english: string;
  component: ComponentId;
  body: string;
  experiment: string;
  questions: string[];
  takeaway: string;
}
export const lessons: Lesson[] = [
  {
    title: 'Sıvı ve depo',
    english: 'Hydraulic fluid & reservoir',
    component: 'reservoir',
    body: 'Hidrolik sıvı gücü taşır; depo bu sıvı için besleme ve genleşme hacmi sağlar. Sıvının az sıkışabilir olması, uzaktaki aktüatöre kuvvetin etkili iletilmesini sağlar. Depo basınçlandırılması pompa emişini destekleyebilir; ana sistemin yüksek çalışma basıncını oluşturmaz.',
    experiment:
      'Pompayı kapatıp basıncı izle. Ardından “Düşük depo seviyesi” senaryosunda valfi aç; pompanın dönmesiyle yeterli beslemenin aynı şey olmadığını gözle.',
    questions: ['q01', 'q02', 'q03'],
    takeaway:
      'Servicing ilkesi: güncel AMM ile sıvı spesifikasyonu ve sistem konfigürasyonu doğrulanır; temizlik, uyumluluk ve depolanmış enerji dikkate alınır. Bu uygulama dolum, hava alma veya ön dolum prosedürü vermez.',
  },
  {
    title: 'Pompa ve basınç üretimi',
    english: 'Pump & pressure generation',
    component: 'pump',
    body: 'Pompa bir enerji dönüştürücüdür. Mil gücü sıvıda akış oluşturur; yük ve kısıtlamalar bu akışa karşı koyar. Kapalı merkezli sistemde valf nötrken basınç korunabilir, fakat pompa kompansatörü büyük debiyi azaltır. Çek valfler durmuş pompa koluna ters akışı engeller.',
    experiment:
      'Pompa ON iken valfi önce nötrde tut, sonra uzat. Basınç ve tüketici debisini karşılaştır.',
    questions: ['q04', 'q05', 'q06'],
    takeaway:
      'Basınç ≠ debi. Yük için kuvveti basınç farkı; eşdeğer alan sabitken hareket hızını debi belirler.',
  },
  {
    title: 'Akümülatör',
    english: 'Stored hydraulic energy',
    component: 'accumulator',
    body: 'Ayırıcı, azot ile sıvıyı ayrı tutar. Sistem basıncı ön dolumu aşınca sıvı girer, gazın hacmi küçülür. Pompa desteği azaldığında gaz genleşir ve sıvıyı manifold yönüne iter. Kullanılabilir rezerv tükendiğinde gazda ön dolum basıncı kalsa da sıvı tarafı sisteme daha fazla sıvı veremez.',
    experiment:
      'Kesitte sıvı ve azot bölmelerini izle. Ana pompayı kapat, uzat/geri çek komutları ver. Rezervin tükenmesini gör.',
    questions: ['q07', 'q08', 'q09'],
    takeaway:
      'Buradaki 1000 psi gaz ön dolumu bir eğitim parametresidir. Gerçek ön dolum değeri sıcaklık ve üretici verisine bağlıdır.',
  },
  {
    title: 'Basıncı kontrol etmek',
    english: 'Regulator & pressure relief',
    component: 'relief',
    body: 'Basınç kompansatörü normalde pompa debisini ayarlar. Ayrı relief valve, bir aşırı basınç olayında basınç hattını dönüşe açar. Bu sayede kontrol ve koruma farklı elemanlarda bulunur. Relief kapalı sıkıştığında regülasyon sağlamsa arıza basınç göstergesinden hemen anlaşılmayabilir.',
    experiment:
      '“Regülasyon arızası” deneyini aç. 3450 psi üzerindeki tahliye akışını gör; sonra “kapalı sıkıştı” senaryosuyla kıyasla.',
    questions: ['q10', 'q11', 'q12'],
    takeaway:
      'Normal basınç kontrolü için relief üzerinden sürekli büyük debi boşaltmak, bu değişken deplasmanlı pompa modelinin normal davranışı değildir.',
  },
  {
    title: 'Yön, kuvvet ve hareket',
    english: 'Selector valve & actuator',
    component: 'actuator',
    body: 'Uzatmada P→A ve B→T bağlantıları kurulur. Ters komutta P→B ve A→T olur. İki oda arasındaki net basınç kuvveti, yükü aştığında piston hareket eder. Nötrde iş portları kapanır. Gerçek tek kollu silindirde rod tarafının etkin alanı daha küçüktür.',
    experiment:
      'Uzat, nötr ve geri çek komutlarını sırayla ver. Kesitte odaların basınç/dönüş renkleriyle piston yönünün birlikte değişimini izle.',
    questions: ['q13', 'q14', 'q15'],
    takeaway:
      'F≈Δp×A ve v≈Q/A temel sezgiyi verir. Burada sürtünme, mekanik yük eğrileri ve iki odanın farklı etkin alanları çözülmez.',
  },
  {
    title: 'Dönüş sistemi',
    english: 'Return & filtration',
    component: 'return',
    body: 'Aktüatöre bir taraftan giren sıvı, diğer taraftan dönüşe çıkar. Dönüş yolu depoda çevrimi tamamlar. Gerçek sistemlerde dönüş filtresi, soğutucu ve diğer elemanlar bulunabilir. Bunlar bu sade şemada ayrı çizilmemiştir. Geri basınç ve tıkanmalar, aktüatör performansını etkiler.',
    experiment:
      'Aktüatörü uç konuma getir. Hareket durduğunda tüketici dönüş akışının da durduğunu gözle; küçük iç sızıntı dönüşü devam edebilir.',
    questions: ['q16', 'q17', 'q18'],
    takeaway:
      'Basınç kırmızı, dönüş mavi gösterilir. Bu renkler akışkan türü veya gerçek uçak hidrolik sistem adı değildir.',
  },
  {
    title: 'Acil ve pnömatik kaynaklar',
    english: 'Emergency hydraulics & pneumatic generation',
    component: 'rat',
    body: 'Elektrik pompası elektrik motoruyla, RAT ise hava akımından elde ettiği mil gücüyle hidrolik pompayı sürer. Pnömatik sistemde kompresör sıkıştırılabilir gazı basınçlandırır; motor bleed havası başka bir kaynak olabilir. Bazı mimarilerde gaz basıncı acil mekanizmaları çalıştırabilir; bu, gazın hidrolik sıvıya doğrudan karışması anlamına gelmez.',
    experiment:
      'Ana pompa arızasını başlat; RAT aç. Hava hızını 90 kt altına ve üstüne getir. Aynı depoya bağlı kaynakların sıvı kaybına karşı tamamen bağımsız olmadığını unutma.',
    questions: ['q19', 'q20', 'q21'],
    takeaway:
      'Modelde pnömatik basınç üretimi kavramsal olarak anlatılır; kompresörün termodinamiği ve pnömatik ağ sayısal olarak çözülmez.',
  },
  {
    title: 'Tüketiciler ve ikazlar',
    english: 'System interfaces & indications',
    component: 'indication',
    body: 'Uçuş kumandaları, iniş takımı, frenler ve burun tekeri yönlendirme hidrolik gücü farklı mekanik işlere dönüştürür. Bu gösterimde seçtiğin tüketici, ortak aktüatör modeline bağlanır; diğerlerinin son konumu korunur. Arıza tanısında basınç, miktar, kaynak durumu ve harekete birlikte bakılır.',
    experiment:
      'RAT tek kaynakken dört tüketiciyi sırayla seç. Bu senaryoda yalnız uçuş kumandaları ve frenlerin hareket edebildiğini gör.',
    questions: ['q22', 'q23', 'q24'],
    takeaway:
      'Kokpit mesajları öğretim için örnektir. Akümülatör, selector veya relief arızalarının her uçakta ayrı bir özel ikazı olduğunu varsayma.',
  },
];
export const sources = [
  {
    name: 'FAA · Aviation Maintenance Technician Handbook — Airframe, Vol. 2',
    detail:
      'Bölüm 12: Hydraulic and Pneumatic Power Systems. Prensipler, bileşenler ve sistem bağlamı.',
    url: 'https://www.faa.gov/sites/faa.gov/files/2022-06/amt_airframe_hb_vol_2.pdf',
  },
  {
    name: 'Parker · Accumulator Technology',
    detail:
      'Gaz ön dolumu, enerji depolama ve gaz/sıvı ayrımı. Buradaki sayısal değerler bu katalogdan alınmamıştır.',
    url: 'https://www.parker.com/content/dam/Parker-com/Literature/Accumulator---Cooler-Division---Europe/service-manuals/accumulator/CADE_technologybrochure_accumulators.pdf',
  },
  {
    name: 'Collins Aerospace · Ram Air Turbine',
    detail: 'Hidrolik, elektrik ve hibrit RAT türleri.',
    url: 'https://www.rtx.com/collinsaerospace/what-we-do/industries/commercial-aviation/power-and-controls/turbine-systems/ram-air-turbine',
  },
  {
    name: 'Safran · Ram Air Turbine',
    detail: 'Ana üretim kaybında kritik sistemlere acil güç sağlama ilkesi.',
    url: 'https://www.safran-group.com/products-services/ram-air-turbine',
  },
];
