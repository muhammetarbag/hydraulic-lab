import { test, expect, type Page } from '@playwright/test';
import { questions, failures } from '../lib/content';
interface Snapshot {
  pressurePsi: number;
  mainOn: boolean;
  electricOn: boolean;
  ratOn: boolean;
  failure: string;
  positions: Record<string, number>;
}
async function read(page: Page): Promise<Snapshot> {
  return page.evaluate(() => {
    const tools = (
      window as unknown as {
        trainingTools: Map<string, { execute: (v: unknown) => unknown }>;
      }
    ).trainingTools;
    return tools.get('read_hydraulic_state')!.execute({}) as Snapshot;
  });
}
const runtimeErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    type T = { name: string; execute: (v: unknown) => unknown };
    const registry = new Map<string, T>();
    (window as unknown as { trainingTools: Map<string, T> }).trainingTools =
      registry;
    Object.defineProperty(document, 'modelContext', {
      value: {
        registerTool(tool: T, options: { signal: AbortSignal }) {
          registry.set(tool.name, tool);
          options.signal.addEventListener('abort', () =>
            registry.delete(tool.name),
          );
        },
      },
      configurable: true,
    });
  });
  await page.goto('./');
  await expect(
    page.getByRole('heading', { name: 'Hidrolik güç.' }),
  ).toBeVisible();
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          (window as unknown as { trainingTools: Map<string, unknown> })
            .trainingTools?.size,
      ),
    )
    .toBe(2);
});
test('live controls, selector hold and reverse, component detail, no runtime errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  expect((await read(page)).pressurePsi).toBeGreaterThan(2900);
  await page
    .getByRole('group', { name: 'Valf yönü' })
    .getByRole('button', { name: 'Uzat', exact: true })
    .click();
  await expect
    .poll(async () => (await read(page)).positions.flight)
    .toBeGreaterThan(0.45);
  await page
    .getByRole('group', { name: 'Valf yönü' })
    .getByRole('button', { name: 'Nötr', exact: true })
    .click();
  const held = (await read(page)).positions.flight;
  await page.waitForTimeout(500);
  expect((await read(page)).positions.flight).toBeCloseTo(held, 2);
  await page
    .getByRole('group', { name: 'Valf yönü' })
    .getByRole('button', { name: 'Geri çek', exact: true })
    .click();
  await expect
    .poll(async () => (await read(page)).positions.flight)
    .toBeLessThan(held - 0.15);
  await page
    .getByRole('button', { name: 'Depo (Reservoir)', exact: true })
    .click();
  await expect(page.locator('.inspector-panel h3')).toHaveText(
    'Hidrolik deposu',
  );
  await page
    .getByRole('switch', { name: 'Ana pompa ENGINE-DRIVEN', exact: true })
    .click();
  expect((await read(page)).mainOn).toBe(false);
  await expect(
    page.getByRole('switch', { name: 'Ana pompa ENGINE-DRIVEN', exact: true }),
  ).not.toBeChecked();
  expect(errors).toEqual([]);
});
test('normal operation completes seven highlights and moves the actuator', async ({
  page,
}) => {
  await page
    .getByRole('button', { name: 'Normal Operation', exact: true })
    .click();
  await expect(page.locator('.guide-caption strong')).toHaveText(
    'Sıvı kaynağı',
  );
  await expect(page.locator('.guide-caption strong')).toHaveText(
    'Çevrim tamamlanıyor',
    { timeout: 16000 },
  );
  await expect(
    page.getByRole('button', { name: 'Çevrimi başlat', exact: true }),
  ).toBeVisible({ timeout: 7000 });
  expect((await read(page)).positions.flight).toBeGreaterThan(0.7);
  expect((await read(page)).pressurePsi).toBeGreaterThan(2400);
});
test('nine failure selectors, prediction, explanation and healthy reset', async ({
  page,
}) => {
  await page
    .getByRole('tab', { name: 'Arıza laboratuvarı', exact: true })
    .click();
  for (const f of failures) {
    await page
      .getByRole('button', { name: f.name + ' ' + f.english, exact: true })
      .click();
    expect((await read(page)).failure).toBe(f.id);
    await expect(page.locator('.prediction-panel h3')).toHaveText(f.prediction);
    await expect(page.locator('.schematic-node.fault-node')).toHaveCount(
      f.id === 'leak' ? 0 : 1,
    );
  }
  await page
    .getByRole('textbox', { name: 'Bu durumda sistemde ne olur?' })
    .fill('Basınç kalabilir ama aktüatör hareket etmez.');
  await page
    .getByRole('button', { name: 'Doğru açıklamayı göster', exact: true })
    .click();
  await expect(page.locator('.prediction-explanation')).toContainText(
    'nötrde sıkışır',
  );
  await page
    .getByRole('button', { name: 'Arızayı temizle ve sıfırla' })
    .click();
  expect((await read(page)).failure).toBe('none');
});
test('emergency main failure, RAT priority and actual consumer isolation', async ({
  page,
}) => {
  await page
    .getByRole('button', { name: 'Main Pump Failure', exact: true })
    .click();
  expect((await read(page)).failure).toBe('main');
  await expect(page.locator('.warning-screen')).toContainText(
    'ENG HYD PUMP FAULT',
  );
  await page
    .getByRole('switch', { name: 'Acil kaynak RAT', exact: true })
    .click();
  await expect(page.locator('.emergency-active')).toBeVisible();
  await expect(page.locator('.isolated-consumer')).toHaveCount(2);
  await page
    .locator('.consumer-grid button')
    .filter({ hasText: 'İniş takımı' })
    .click();
  await page
    .getByRole('group', { name: 'Valf yönü' })
    .getByRole('button', { name: 'Uzat', exact: true })
    .click();
  await page.waitForTimeout(1000);
  expect((await read(page)).positions.gear).toBe(0);
  await page
    .getByRole('switch', {
      name: 'Elektrik pompası ELECTRIC PUMP',
      exact: true,
    })
    .click();
  await expect(page.locator('.isolated-consumer')).toHaveCount(0);
  await expect
    .poll(async () => (await read(page)).positions.gear)
    .toBeGreaterThan(0.1);
});
test('all 8 lessons, live experiment, explanations and preserved progress', async ({
  page,
}) => {
  await page.getByRole('tab', { name: 'Öğrenme modu', exact: true }).click();
  await expect(page.locator('.lesson-sidebar nav button')).toHaveCount(8);
  for (let i = 0; i < 8; i++) {
    await page.locator('.lesson-sidebar nav button').nth(i).click();
    await expect(page.locator('.lesson-content .question-card')).toHaveCount(3);
    for (const card of await page
      .locator('.lesson-content .question-card')
      .all())
      await card.locator('.answer-options button').first().click();
    await expect(page.locator('.lesson-bottom')).toContainText(
      'Bölüm tamamlandı',
    );
  }
  await expect(page.locator('.lesson-progress')).toContainText('8 / 8 bölüm');
  await page
    .getByRole('button', { name: 'Sistemde dene', exact: true })
    .click();
  await expect(
    page.getByRole('tab', { name: 'Simülasyon', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Öğrenme modu', exact: true }).click();
  await expect(page.locator('.lesson-progress')).toContainText('8 / 8 bölüm');
});
test('24-question exam scores correctly and explains all distractors', async ({
  page,
}) => {
  await page.getByRole('tab', { name: 'Sınav provası', exact: true }).click();
  for (let i = 0; i < questions.length; i++) {
    const answer =
      i === 0 ? (questions[i].correct + 1) % 3 : questions[i].correct;
    await page.locator('.exam-main .answer-options button').nth(answer).click();
    await expect(page.locator('.exam-main .answer-feedback li')).toHaveCount(3);
    if (i < questions.length - 1)
      await page
        .getByRole('button', { name: 'Sonraki soru', exact: true })
        .click();
  }
  await page
    .getByRole('button', { name: 'Sonucu göster', exact: true })
    .click();
  await expect(page.locator('.exam-result')).toContainText('23 doğru');
  await expect(page.locator('.exam-result')).toContainText('1 yanlış');
  await expect(page.locator('.exam-result h3')).toHaveText('%96');
  await expect(page.locator('.topic-tags')).toContainText('Sıvı ve depo');
  await page
    .getByRole('button', { name: 'Yeniden başla', exact: true })
    .click();
  await expect(page.locator('.score-total')).toContainText('0 / 24 cevaplandı');
});
test('component explorer sheet opens, has cutaway, and closes with Escape', async ({
  page,
}) => {
  await page
    .getByRole('tab', { name: 'Parça kütüphanesi', exact: true })
    .click();
  await expect(page.locator('.explorer-card')).toHaveCount(16);
  await page
    .locator('.explorer-card')
    .filter({
      has: page.getByRole('heading', { name: 'Akümülatör', exact: true }),
    })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(
    page.getByRole('dialog').locator('.critical-note'),
  ).toContainText('Enerji sıkıştırılan gazda');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
test('WebMCP contract: valid mutation readback and rejected invalid input', async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const registry = (
      window as unknown as {
        trainingTools: Map<string, { execute: (v: unknown) => unknown }>;
      }
    ).trainingTools;
    const setter = registry.get('set_hydraulic_training_scenario')!;
    let invalid = false;
    try {
      setter.execute({ failure: 'unknown' });
    } catch {
      invalid = true;
    }
    const before = registry.get('read_hydraulic_state')!.execute({});
    const after = setter.execute({ failure: 'main' });
    return { invalid, before, after };
  });
  expect(result.invalid).toBe(true);
  expect((result.before as Snapshot).failure).toBe('none');
  expect((result.after as Snapshot).failure).toBe('main');
  await expect(page.locator('.warning-screen')).toContainText(
    'ENG HYD PUMP FAULT',
  );
});
test('desktop and mobile rendering, no document overflow and reduced-motion support', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Duraklat', exact: true }).click();
  await page.screenshot({
    path: 'test-results/hydraulic-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(
    page.getByRole('tab', { name: 'Simülasyon', exact: true }),
  ).toBeVisible();
  const measure = await page.evaluate(() => ({
    width: window.innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(measure.scroll).toBeLessThanOrEqual(measure.width + 1);
  await page.screenshot({
    path: 'test-results/hydraulic-mobile.png',
    fullPage: true,
  });
  await page.getByRole('tab', { name: 'Sınav provası', exact: true }).click();
  await expect(page.locator('.exam-main .question-card')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
});

test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page) ?? []).toEqual([]);
});
