// Fetch model data from the Artificial Analysis V2 API (free tier) and save it
// in the legacy /api/v2/data/* shape that app.js already reads.
//
// The legacy endpoints were retired on 2026-11-04 (they return 410 Gone).
// Docs: https://artificialanalysis.ai/data-api/docs/reference
//
// Usage: AI_MODELS_KEY=xxxx node fetch-ai-data.js
// Writes data/llms.json, text-to-image.json, text-to-speech.json,
// text-to-video.json, image-to-video.json. Nothing is written unless every
// request succeeds, so a failed run never leaves half-updated files.

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const BASE = 'https://artificialanalysis.ai/api/v2';
const API_KEY = process.env.AI_MODELS_KEY;

if (!API_KEY) {
    console.error('AI_MODELS_KEY environment variable is not set.');
    process.exit(1);
}

async function getJson(path, attempt = 1) {
    const url = `${BASE}${path}`;
    const res = await fetch(url, { headers: { 'x-api-key': API_KEY } });
    if (res.ok) return res.json();

    const body = await res.text();
    // Retry transient errors (rate limit / server errors) up to 3 times
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
        const wait = Number(res.headers.get('retry-after')) || 5 * attempt;
        console.warn(`${url} -> ${res.status}, retrying in ${wait}s`);
        await new Promise(r => setTimeout(r, wait * 1000));
        return getJson(path, attempt + 1);
    }
    throw new Error(`${url} -> HTTP ${res.status}: ${body.slice(0, 300)}`);
}

// ---------- LLMs ----------

async function fetchAllLlms() {
    const items = [];
    for (let page = 1; page <= 50; page++) {
        const json = await getJson(`/language/models/free?page=${page}`);
        items.push(...(json.data || []));
        if (!json.pagination?.has_more) break;
    }
    return items;
}

const num = v => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function toLegacyLlm(m) {
    const input = num(m.pricing?.price_1m_input_tokens);
    const output = num(m.pricing?.price_1m_output_tokens);
    // Free tier has no blended price; compute it the same way (input:output = 3:1)
    const blended = input !== null && output !== null
        ? Math.round(((3 * input + output) / 4) * 1000) / 1000
        : null;

    // Prefer performance_v3 (the legacy "performance" block returns null from 2026-12-10)
    const v3 = m.performance_v3 || {};
    const old = m.performance || {};

    return {
        id: m.id,
        name: m.name,
        slug: m.slug,
        release_date: m.release_date ?? null,
        model_creator: m.model_creator,
        evaluations: m.evaluations || {},
        pricing: {
            price_1m_blended_3_to_1: blended,
            price_1m_input_tokens: input,
            price_1m_output_tokens: output,
        },
        median_output_tokens_per_second:
            num(v3.mean_output_tokens_per_second) ?? num(old.median_output_tokens_per_second),
        median_time_to_first_token_seconds:
            num(v3.mean_time_to_first_token_seconds) ?? num(old.median_time_to_first_token_seconds),
        median_time_to_first_answer_token:
            num(v3.mean_time_to_first_answer_token_seconds) ?? num(old.median_time_to_first_answer_token_seconds),
    };
}

// ---------- Media arenas ----------

function toLegacyMedia(items) {
    // Free tier has no rank field: rank by Elo (highest = 1)
    return [...items]
        .sort((a, b) => (b.elo ?? -Infinity) - (a.elo ?? -Infinity))
        .map((m, i) => ({
            id: m.id,
            name: m.name,
            slug: m.slug,
            model_creator: m.model_creator,
            elo: m.elo ?? null,
            ci95: m.ci_95 ?? null,
            rank: i + 1,
            release_date: null,   // not available on the free tier
            appearances: null,    // not available on the free tier
        }));
}

const MEDIA = {
    'text-to-image': '/media/text-to-image/models/free',
    'text-to-speech': '/media/text-to-speech/models/free',
    'text-to-video': '/media/text-to-video/models/free',
    'image-to-video': '/media/image-to-video/models/free',
};

// ---------- Main ----------

async function main() {
    const outputs = {};

    const llms = await fetchAllLlms();
    if (llms.length === 0) throw new Error('LLM list came back empty');
    outputs['llms'] = { status: 200, data: llms.map(toLegacyLlm) };
    console.log(`llms: ${llms.length} models`);

    for (const [name, path] of Object.entries(MEDIA)) {
        const json = await getJson(path);
        const items = json.data || [];
        if (items.length === 0) throw new Error(`${name} list came back empty`);
        outputs[name] = { status: 200, data: toLegacyMedia(items) };
        console.log(`${name}: ${items.length} models`);
    }

    // All requests succeeded: write files
    for (const [name, body] of Object.entries(outputs)) {
        writeFileSync(join(DATA_DIR, `${name}.json`), JSON.stringify(body));
    }
    console.log('Saved all data files.');
}

main().catch(err => {
    console.error(err.message || err);
    process.exit(1);
});
