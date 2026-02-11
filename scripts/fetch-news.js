import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser({
  customFields: {
    item: ['pubDate', 'description']
  }
});

// User-Agent to avoid blocking
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// News sources configuration
const newsSources = [
  {
    name: 'Google News - AI',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5+AI+when:7d&hl=ko&gl=KR&ceid=KR:ko',
    maxItems: 10
  },
  {
    name: 'Google News - ChatGPT',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=ChatGPT+%EC%98%A4%ED%94%88AI+when:7d&hl=ko&gl=KR&ceid=KR:ko',
    maxItems: 5
  },
  {
    name: 'Google News - 생성AI',
    type: 'rss',
    url: 'https://news.google.com/rss/search?q=%EC%83%9D%EC%84%B1AI+%EC%83%9D%EC%84%B1%ED%98%95AI+when:7d&hl=ko&gl=KR&ceid=KR:ko',
    maxItems: 5
  }
];

// Fetch from RSS feed with retry logic
async function fetchFromRSS(source, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Fetching from ${source.name}... (attempt ${attempt}/${retries})`);
      const feed = await parser.parseURL(source.url);

      const items = feed.items.slice(0, source.maxItems).map(item => {
        // Extract source from title (Google News format: "Title - Source")
        const titleMatch = item.title.match(/^(.*?)\s*-\s*([^-]+)$/);
        const title = titleMatch ? titleMatch[1].trim() : item.title;
        const sourceName = titleMatch ? titleMatch[2].trim() : source.name;

        return {
          title: title,
          url: item.link,
          source: sourceName,
          date: item.pubDate || item.isoDate || new Date().toISOString()
        };
      });

      console.log(`✓ Fetched ${items.length} items from ${source.name}`);
      return items;
    } catch (error) {
      console.error(`✗ Error fetching from ${source.name} (attempt ${attempt}/${retries}):`, error.message);

      if (attempt < retries) {
        const delay = attempt * 2000; // 2s, 4s exponential backoff
        console.log(`  Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`✗ Failed to fetch from ${source.name} after ${retries} attempts`);
  return [];
}

// Fetch from web scraping (for sites without RSS)
async function fetchFromWeb(source) {
  try {
    console.log(`Scraping from ${source.name}...`);
    const response = await axios.get(source.url, { headers, timeout: 10000 });
    const $ = cheerio.load(response.data);

    const items = [];
    $(source.selector).each((i, elem) => {
      if (i >= source.maxItems) return false;

      const title = $(elem).find(source.titleSelector).text().trim();
      const relativeUrl = $(elem).find(source.linkSelector).attr('href');
      const url = relativeUrl?.startsWith('http')
        ? relativeUrl
        : new URL(relativeUrl, source.url).href;

      if (title && url) {
        items.push({
          title,
          url,
          source: source.name,
          date: new Date().toISOString()
        });
      }
    });

    console.log(`✓ Scraped ${items.length} items from ${source.name}`);
    return items;
  } catch (error) {
    console.error(`✗ Error scraping from ${source.name}:`, error.message);
    return [];
  }
}

// Main function
async function fetchAllNews() {
  console.log('🤖 Starting AI news fetch...\n');

  let allNews = [];

  for (const source of newsSources) {
    try {
      const items = source.type === 'rss'
        ? await fetchFromRSS(source)
        : await fetchFromWeb(source);

      allNews = allNews.concat(items);

      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error processing ${source.name}:`, error.message);
    }
  }

  // Remove duplicates based on title similarity
  const uniqueNews = [];
  const seenTitles = new Set();

  for (const news of allNews) {
    const normalizedTitle = news.title.toLowerCase().replace(/\s+/g, '');
    if (!seenTitles.has(normalizedTitle)) {
      seenTitles.add(normalizedTitle);
      uniqueNews.push(news);
    }
  }

  // Sort by date (newest first) and limit to 12 items
  const sortedNews = uniqueNews
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 12);

  console.log(`\n📰 Total unique news items: ${sortedNews.length}`);

  // Only update file if we have news items
  if (sortedNews.length === 0) {
    console.log('\n⚠️  No news items fetched. Keeping existing file.');
    return;
  }

  // Prepare output
  const output = {
    last_updated: new Date().toISOString(),
    news: sortedNews
  };

  // Write to file
  const outputPath = path.join(__dirname, '..', 'data', 'ai-news.json');
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n✅ News saved to ${outputPath}`);
  console.log('\nLatest news:');
  sortedNews.slice(0, 5).forEach((news, i) => {
    console.log(`${i + 1}. [${news.source}] ${news.title}`);
  });
}

// Run
fetchAllNews().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
