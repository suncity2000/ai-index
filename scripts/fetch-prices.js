import axios from 'axios';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', 'data', 'prices.json');

// Models to include (filter by id prefix)
const PROVIDERS_OF_INTEREST = [
    'openai', 'anthropic', 'google', 'meta-llama', 'mistralai',
    'deepseek', 'qwen', 'microsoft', 'cohere', 'x-ai'
];

async function fetchPrices() {
    console.log('Fetching model prices from OpenRouter...');

    const response = await axios.get('https://openrouter.ai/api/v1/models', {
        headers: {
            'HTTP-Referer': 'https://ainet.io.kr/',
            'User-Agent': 'ainet-price-tracker/1.0'
        },
        timeout: 30000
    });

    const models = response.data?.data || [];

    // Filter and transform
    const filtered = models
        .filter(m => {
            const id = (m.id || '').toLowerCase();
            return PROVIDERS_OF_INTEREST.some(p => id.startsWith(p + '/') || id.startsWith(p + '-'));
        })
        .map(m => {
            const promptPrice = parseFloat(m.pricing?.prompt || 0);
            const completionPrice = parseFloat(m.pricing?.completion || 0);
            return {
                id: m.id,
                name: m.name,
                // OpenRouter pricing is per token; multiply by 1,000,000 to get $/1M tokens
                price_1m_input: promptPrice > 0 ? Math.round(promptPrice * 1_000_000 * 100) / 100 : null,
                price_1m_output: completionPrice > 0 ? Math.round(completionPrice * 1_000_000 * 100) / 100 : null,
                context_length: m.context_length || null,
                top_provider: m.top_provider?.context_length ? true : false
            };
        })
        .filter(m => m.price_1m_input !== null || m.price_1m_output !== null)
        .sort((a, b) => {
            // Sort by provider then by price
            const aProvider = a.id.split('/')[0];
            const bProvider = b.id.split('/')[0];
            if (aProvider !== bProvider) return aProvider.localeCompare(bProvider);
            return (a.price_1m_input || 0) - (b.price_1m_input || 0);
        });

    const output = {
        last_updated: new Date().toISOString(),
        source: 'OpenRouter API',
        models: filtered
    };

    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`Saved ${filtered.length} models to ${OUTPUT_PATH}`);
}

fetchPrices().catch(err => {
    console.error('Failed to fetch prices:', err.message);
    process.exit(1);
});
