// Snapshot the official pricing pages of the services in data/services-plans.json.
//
// Opens each service's pricing page in headless Chromium, waits for prices that are
// drawn by JavaScript, and saves the visible text to <out-dir>/<service-id>.txt.
// Used by the monthly price check to compare current prices with the data file.
//
// Usage: node scripts/snapshot-pricing-pages.cjs <out-dir> [service-id,...]
// Needs Playwright with Chromium (pre-installed in Claude Code cloud sessions).
// Outbound traffic goes through HTTPS_PROXY when it is set.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Extra pages per service, checked in addition to the service's own `url`.
const EXTRA_PAGES = {
  gemini: ['https://one.google.com/about/google-ai-plans/'],
};

// Billing toggles to click so that monthly prices are shown as well.
const MONTHLY_TOGGLES = ['Pay monthly', 'Monthly', 'Monthly billing', 'Billed monthly'];

async function snapshot(ctx, url) {
  const page = await ctx.newPage();
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(6000);
    const yearlyText = await page.evaluate(() => document.body ? document.body.innerText : '');
    let monthlyText = '';
    for (const label of MONTHLY_TOGGLES) {
      const loc = page.getByText(label, { exact: true }).first();
      if (await loc.count()) {
        const ok = await loc.click({ timeout: 4000 }).then(() => true).catch(() => false);
        if (ok) {
          await page.waitForTimeout(2000);
          monthlyText = await page.evaluate(() => document.body.innerText);
          break;
        }
      }
    }
    return { status: resp ? resp.status() : null, finalUrl: page.url(), yearlyText, monthlyText };
  } catch (e) {
    return { status: 'ERROR', finalUrl: url, error: e.message.split('\n')[0] };
  } finally {
    await page.close();
  }
}

(async () => {
  const outDir = process.argv[2];
  if (!outDir) {
    console.error('Usage: node scripts/snapshot-pricing-pages.cjs <out-dir> [service-id,...]');
    process.exit(1);
  }
  const only = process.argv[3] ? process.argv[3].split(',') : null;
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'services-plans.json'), 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });

  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch({ proxy });
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true, locale: 'en-US', timezoneId: 'America/New_York',
    viewport: { width: 1400, height: 1000 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  });

  for (const svc of data.services) {
    if (only && !only.includes(svc.id)) continue;
    const urls = [svc.url, ...(EXTRA_PAGES[svc.id] || [])];
    let out = '';
    for (const url of urls) {
      const r = await snapshot(ctx, url);
      out += `===== ${url}\nstatus: ${r.status}  final: ${r.finalUrl}\n`;
      if (r.error) out += `error: ${r.error}\n`;
      if (r.yearlyText) out += `--- default view\n${r.yearlyText}\n`;
      if (r.monthlyText) out += `--- after clicking a monthly-billing toggle\n${r.monthlyText}\n`;
      const chars = (r.yearlyText || '').length;
      console.log(`${svc.id.padEnd(12)} ${String(r.status).padEnd(6)} ${String(chars).padStart(6)} chars  ${url}`);
    }
    fs.writeFileSync(path.join(outDir, `${svc.id}.txt`), out);
  }
  await browser.close();
})();
