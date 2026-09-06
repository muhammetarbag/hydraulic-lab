'use client';
import { useState } from 'react';
import { ArrowUpRight, ExternalLink, Layers, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import { components, componentMap, sources } from '@/lib/content';
import { ComponentDetail, Cutaway } from './ComponentDetail';
import type { ComponentId, SimState } from '@/lib/simulation';
export function Explorer({
  state,
  onChange,
}: {
  state: SimState;
  onChange: (p: Partial<SimState>) => void;
}) {
  const [opened, setOpened] = useState<ComponentId | null>(null);
  return (
    <section className="explorer">
      <div className="section-eyebrow">COMPONENT EXPLORER</div>
      <h2>Parçayı tanı. Sistemi anla.</h2>
      <p className="section-subtitle">
        Bir bileşen seç; kesitini, giriş–çıkış ilişkisini ve arıza etkisini
        keşfet.
      </p>
      <div className="explorer-grid">
        {components.map((c) => (
          <button
            className="explorer-card"
            key={c.id}
            onClick={() => setOpened(c.id)}
          >
            <div className="explorer-card-top">
              <Layers size={15} />
              <ArrowUpRight size={18} />
            </div>
            <Cutaway id={c.id} state={state} />
            <h3>{c.name}</h3>
            <span>{c.english}</span>
            <p>{c.duty}</p>
          </button>
        ))}
      </div>
      <Sheet
        open={opened !== null}
        onOpenChange={(open) => {
          if (!open) setOpened(null);
        }}
      >
        <SheetContent className="component-sheet" showCloseButton={false}>
          <SheetTitle className="sr-only">
            {opened ? componentMap[opened].name : 'Parça ayrıntıları'}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Kesit, çalışma ilkesi ve arıza etkileri
          </SheetDescription>
          <SheetClose
            aria-label="Parça panelini kapat"
            className="sheet-close-button"
          >
            <X size={20} />
          </SheetClose>
          {opened && (
            <ComponentDetail id={opened} state={state} onChange={onChange} />
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
}
export function Sources() {
  return (
    <section className="sources-page">
      <div className="section-eyebrow">KAYNAKLAR & MODEL SINIRLARI</div>
      <h2>Ne öğreniyorsun, neyi modelliyoruz?</h2>
      <p className="section-subtitle">
        Generic transport-category aircraft hydraulic system training simulator
      </p>
      <div className="sources-layout">
        <div>
          <h3>Prensip kaynakları</h3>
          {sources.map((s) => (
            <a
              className="source-card panel"
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer"
            >
              <div>
                <h4>{s.name}</h4>
                <p>{s.detail}</p>
              </div>
              <ExternalLink size={18} />
            </a>
          ))}
          <p className="source-note">
            Kaynak kontrolü: 6 Eylül 2026. Sorular ve Türkçe anlatımlar bu
            uygulama için hazırlanmıştır. HEE 305 kapsam başlıkları kullanıcı
            talebinden alınmıştır; dersin resmî materyali veya sınavı olarak
            sunulmaz.
          </p>
        </div>
        <div className="model-notes panel">
          <h3>Modelin açık varsayımları</h3>
          <ul>
            <li>
              Tek ortak depo ve manifold; ana pompa, elektrik pompası ve
              hidrolik RAT. Gerçek çoklu ve ayrılmış uçak sistemlerinin tam
              yedekliliğini temsil etmez.
            </li>
            <li>
              Kapalı merkezli selector, basınç kompansatörlü pompa, paralel
              akümülatör ve bağımsız relief kolu.
            </li>
            <li>
              Nominal: 3000 psi. Relief: 3450 psi. Gaz ön dolumu: 1000 psi. RAT
              hedefi: 2700 psi; çalışma eşiği: 90 kt. Tamamı öğretim
              parametresidir.
            </li>
            <li>
              Basınç, gelen/giden debi ve eşdeğer hat esnekliğiyle hesaplanır.
              Akümülatör için mutlak basınçla pV¹·⁴ ilişkisi ve sonlu gaz hacmi
              kullanılır.
            </li>
            <li>
              Hareket, seçilen tek tüketici üzerinde hesaplanır; diğer
              tüketicilerin konumu tutulur. Tüm tüketiciler aynı anda yük
              oluşturmaz.
            </li>
            <li>
              RAT tek kaynakken uçuş kumandaları ve frenler kullanılabilir. İniş
              takımı ve nose wheel steering izole edilir. Bu bir senaryo
              seçimidir.
            </li>
            <li>
              Aktüatör için eşdeğer alan ve basitleştirilmiş yük eşiği
              kullanılır. Rod hacminin küçük depo etkisi yaklaşık olarak hesaba
              katılır.
            </li>
            <li>
              Sıcaklık, su darbesi, gerçek kavitasyon, gaz çözünmesi, pnömatik
              termodinamik, uçak aerodinamiği ve kontrol yüzeyi yükleri sayısal
              olarak çözülmez.
            </li>
            <li>
              Hat renkleri işlev belirtir; gerçek bir uçağın “red/blue/green
              system” adları değildir. Çizimler ölçeksizdir.
            </li>
          </ul>
          <h3>Servicing ve pnömatik bağlam</h3>
          <p>
            Serviste doğru sıvı, kontaminasyon kontrolü, malzeme uyumluluğu ve
            depolanmış enerjinin değerlendirilmesi esastır. Gerçek işlemler için
            güncel AMM ve yetkili bakım prosedürleri gerekir.
          </p>
          <p>
            Pnömatik basınç; kompresör, bleed kaynağı veya depolanmış gazla
            sağlanabilir. Depoyu düşük basınçla beslemek, hidrolik pompanın
            yüksek basınç üretiminin yerini almaz. Uygulama pnömatik ağı ayrı
            bir sayısal simülasyon olarak içermez.
          </p>
        </div>
      </div>
    </section>
  );
}
