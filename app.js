// Global state
let currentCategory = 'llm';
let currentFilter = 'overall';
let allData = {};
let yesterdayData = {};
let historyAvailable = false;
let rankingChanges = {};
let modelCountChanges = {};
let koreanCompanies = [];
let modelLinks = [];
let selectedForComparison = [];
let comparisonChart = null;

// Pricing data
let pricingData = null;
let manualPricingData = null;
let pricingSortField = 'input'; // default: sort by input price
let pricingSortDir = 'asc';     // 'asc' | 'desc'

// Language state
let currentLang = localStorage.getItem('lang') || 'ko';
let lastUpdatedDateObj = null;
let newsLastUpdatedDateObj = null;

// ─────────────────────────────────────────────
// Translations
// ─────────────────────────────────────────────
const translations = {
    ko: {
        // Header
        lastUpdated: '마지막 업데이트',
        // Hero
        heroHeadline1: '최고의 AI 모델을',
        heroHeadline2: '한눈에 비교하세요',
        heroSubtitle: '실시간으로 업데이트되는 AI 모델 순위와 최신 뉴스를 통해<br class="hidden md:block"> AI 기술의 발전을 확인하세요',
        viewRankings: '순위 보기',
        readNews: '뉴스 읽기',
        heroStatModels: 'AI 모델',
        heroStatCompanies: 'AI 기업',
        heroStatFreq: '매일',
        heroStatUpdate: '업데이트',
        heroBadge: (m, y) => `${y}년 ${m}월 업데이트`,
        // News
        newsTitle: '📰 AI 최신 뉴스',
        newsViewAll: '전체보기',
        newsError: '뉴스를 불러올 수 없습니다',
        newsUpdated: (d) => `업데이트: ${d}`,
        // Stats bar
        totalModels: '전체 추적 모델',
        koreanServices: '🇰🇷 한국 서비스',
        countUnit: '개',
        // Category / filter tabs
        catKorean: '🇰🇷 한국 서비스',
        catPricing: '💰 AI 가격',
        filterOverall: '🏆 종합순위',
        filterCoding: '💻 코딩',
        filterMath: '🔢 수학',
        filterValue: '💰 가성비',
        filterSpeed: '⚡ 속도',
        // Loading / error
        loading: '데이터를 불러오는 중...',
        loadError: '❌ 데이터를 불러올 수 없습니다',
        loadErrorSub: '잠시 후 다시 시도해주세요.',
        // Footer area
        lastUpdatedLabel: '마지막 업데이트',
        dataSource: '데이터 출처',
        // Comparison bar
        reset: '초기화',
        compBtnText: '비교하기',
        compModalTitle: '⚖️ 모델 비교',
        // Dynamic content
        noData: '데이터가 없습니다.',
        noKoreanData: '한국 서비스 데이터가 없습니다.',
        // Table headers
        thRank: '순위', thModel: '모델명', thCompany: '회사',
        thElo: 'ELO 점수', thEval: '평가 횟수', thRelease: '출시일', thCompare: '비교',
        thField: '분야', thScore: '점수',
        // Ranking
        rankingTitle: (label) => `🏆 ${label} 순위`,
        mediaRankTitle: (emoji, name) => `${emoji} ${name} 순위`,
        sortLabel: { overall: '지능 지수', coding: '코딩 점수', math: '수학 점수', value: '가성비 점수', speed: '속도' },
        unitScore: '점', unitValueScore: '점/$', unitSpeed: 'tok/s',
        // Ranking change
        rankUp: (n) => `어제보다 ${n}계단 상승`,
        rankDown: (n) => `어제보다 ${n}계단 하락`,
        rankSame: '순위 변동 없음',
        // Compare buttons
        btnSelected: '✓ 선택됨', btnCompare: '+ 비교',
        // Korean services
        koreanAiServices: '🇰🇷 한국 AI 서비스',
        koreanTotal: (n) => `(전체 ${n}개)`,
        rankNote: '💡 순위 표시:',
        rank1to3: '1-3위', rank4to10: '4-10위', rank11plus: '11위 이하',
        // Toast / misc
        maxCompare: '최대 4개까지 선택할 수 있습니다.',
        remove: '제거',
        // Comparison modal content
        comparingModels: (n) => `선택한 ${n}개 모델을 비교합니다. 레이더 차트 수치는 전체 모델 대비 상대 점수(%)입니다.`,
        compareChartTitle: '📡 종합 성능 비교 (상대 점수 %)',
        compareDetailTitle: '📊 상세 지표 비교',
        compareIndicator: '지표',
        mediaComparing: (cat, n) => `${cat} 모델 ${n}개를 비교합니다.`,
        eloCompareTitle: '📊 ELO 점수 비교',
        detailCompareTitle: '📋 상세 지표 비교',
        // Comparison metrics
        metricIntelligence: '🧠 지능 지수', metricCoding: '💻 코딩 지수',
        metricMath: '🔢 수학 지수', metricSpeed: '⚡ 속도',
        metricInputPrice: '💵 입력 가격', metricOutputPrice: '💵 출력 가격',
        metricValue: '🌟 가성비', metricRank: '🏆 전체 순위',
        metricElo: '📊 ELO 점수', metricEvalCount: '🔢 평가 횟수',
        metricReleaseDate: '📅 출시일',
        rankSuffix: '위',
        // Stats bar - new boxes
        newModelsTitle: '🆕 신규 진입 모델',
        risingRankTitle: '📈 순위 상승 모델',
        noNewModels: '신규 진입 모델 없음',
        noRankChanges: '오늘은 변동 없음',
        andMore: (n) => `외 ${n}개`,
        // Chart labels
        chartIntelligence: '지능 지수', chartCoding: '코딩',
        chartMath: '수학', chartSpeed: '속도', chartValue: '가성비',
        // HuggingFace section
        hfTitle: '🔥 HuggingFace 인기 모델 TOP 5',
        hfViewAll: '전체 트렌드 보기 →',
        hfDownloads: '좋아요',
        hfError: 'HuggingFace 데이터를 불러올 수 없습니다',
        hfRankSuffix: '위',
        // Score info modal titles
        scoreInfoTitle: {
            overall: '🧠 인공 분석 지능 지수란?',
            coding: '💻 코딩 점수란?',
            math: '🔢 수학 점수란?',
            value: '💰 가성비란?',
            speed: '⚡ 속도란?',
            'text-to-image': '🎨 Text-to-Image ELO 점수란?',
            'text-to-speech': '🎙️ Text-to-Speech ELO 점수란?',
            'text-to-video': '🎬 Text-to-Video ELO 점수란?',
            'image-to-video': '🎞️ Image-to-Video ELO 점수란?'
        },
        // Cookie consent
        cookieText: '이 사이트는 서비스 개선 및 맞춤형 광고(Google AdSense)를 위해 쿠키를 사용합니다. 계속 이용하시면 쿠키 사용에 동의하신 것으로 간주됩니다.',
        cookieLearnMore: '개인정보처리방침',
        cookieAccept: '동의',
        cookieDecline: '거부',
        dateLocale: 'ko-KR',
    },
    en: {
        // Header
        lastUpdated: 'Last Updated',
        // Hero
        heroHeadline1: 'Compare the Best',
        heroHeadline2: 'AI Models at a Glance',
        heroSubtitle: 'Stay updated with real-time AI model rankings and latest news<br class="hidden md:block"> to track the evolution of AI technology',
        viewRankings: 'View Rankings',
        readNews: 'Read News',
        heroStatModels: 'AI Models',
        heroStatCompanies: 'AI Companies',
        heroStatFreq: 'Daily',
        heroStatUpdate: 'Updates',
        heroBadge: (m, y) => {
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return `${months[m-1]} ${y} Update`;
        },
        // News
        newsTitle: '📰 Latest AI News',
        newsViewAll: 'View All',
        newsError: 'Failed to load news',
        newsUpdated: (d) => `Updated: ${d}`,
        // Stats bar
        totalModels: 'Total Tracked Models',
        koreanServices: '🇰🇷 Korean Services',
        countUnit: '',
        // Category / filter tabs
        catKorean: '🇰🇷 Korean Services',
        catPricing: '💰 AI Pricing',
        filterOverall: '🏆 Overall',
        filterCoding: '💻 Coding',
        filterMath: '🔢 Math',
        filterValue: '💰 Value',
        filterSpeed: '⚡ Speed',
        // Loading / error
        loading: 'Loading data...',
        loadError: '❌ Failed to load data',
        loadErrorSub: 'Please try again later.',
        // Footer area
        lastUpdatedLabel: 'Last Updated',
        dataSource: 'Data Source',
        // Comparison bar
        reset: 'Reset',
        compBtnText: 'Compare',
        compModalTitle: '⚖️ Model Comparison',
        // Dynamic content
        noData: 'No data available.',
        noKoreanData: 'No Korean services data.',
        // Table headers
        thRank: 'Rank', thModel: 'Model', thCompany: 'Company',
        thElo: 'ELO Score', thEval: 'Evaluations', thRelease: 'Release Date', thCompare: 'Compare',
        thField: 'Field', thScore: 'Score',
        // Ranking
        rankingTitle: (label) => `🏆 ${label} Rankings`,
        mediaRankTitle: (emoji, name) => `${emoji} ${name} Rankings`,
        sortLabel: { overall: 'Intelligence', coding: 'Coding', math: 'Math', value: 'Value', speed: 'Speed' },
        unitScore: 'pts', unitValueScore: 'pts/$', unitSpeed: 'tok/s',
        // Ranking change
        rankUp: (n) => `Up ${n} from yesterday`,
        rankDown: (n) => `Down ${n} from yesterday`,
        rankSame: 'No change',
        // Compare buttons
        btnSelected: '✓ Selected', btnCompare: '+ Compare',
        // Korean services
        koreanAiServices: '🇰🇷 Korean AI Services',
        koreanTotal: (n) => `(Total: ${n})`,
        rankNote: '💡 Rank Display:',
        rank1to3: 'Top 3', rank4to10: 'Top 4-10', rank11plus: '11th or lower',
        // Toast / misc
        maxCompare: 'You can select up to 4 models.',
        remove: 'Remove',
        // Comparison modal content
        comparingModels: (n) => `Comparing ${n} selected models. Radar chart values are relative scores (%) vs all models.`,
        compareChartTitle: '📡 Overall Performance (Relative %)',
        compareDetailTitle: '📊 Detailed Metrics',
        compareIndicator: 'Metric',
        mediaComparing: (cat, n) => `Comparing ${n} ${cat} models.`,
        eloCompareTitle: '📊 ELO Score Comparison',
        detailCompareTitle: '📋 Detailed Metrics',
        // Comparison metrics
        metricIntelligence: '🧠 Intelligence', metricCoding: '💻 Coding',
        metricMath: '🔢 Math', metricSpeed: '⚡ Speed',
        metricInputPrice: '💵 Input Price', metricOutputPrice: '💵 Output Price',
        metricValue: '🌟 Value', metricRank: '🏆 Overall Rank',
        metricElo: '📊 ELO Score', metricEvalCount: '🔢 Evaluations',
        metricReleaseDate: '📅 Release Date',
        rankSuffix: '',
        // Stats bar - new boxes
        newModelsTitle: '🆕 New Models',
        risingRankTitle: '📈 Rising Ranks',
        noNewModels: 'No new models',
        noRankChanges: 'No changes today',
        andMore: (n) => `+${n} more`,
        // Chart labels
        chartIntelligence: 'Intelligence', chartCoding: 'Coding',
        chartMath: 'Math', chartSpeed: 'Speed', chartValue: 'Value',
        // HuggingFace section
        hfTitle: '🔥 HuggingFace Top 5 Models',
        hfViewAll: 'View All Trends →',
        hfDownloads: 'likes',
        hfError: 'Failed to load HuggingFace data',
        hfRankSuffix: '',
        // Score info modal titles
        scoreInfoTitle: {
            overall: '🧠 What is the AI Intelligence Index?',
            coding: '💻 What is the Coding Score?',
            math: '🔢 What is the Math Score?',
            value: '💰 What is Value for Money?',
            speed: '⚡ What is Speed?',
            'text-to-image': '🎨 What is the Text-to-Image ELO Score?',
            'text-to-speech': '🎙️ What is the Text-to-Speech ELO Score?',
            'text-to-video': '🎬 What is the Text-to-Video ELO Score?',
            'image-to-video': '🎞️ What is the Image-to-Video ELO Score?'
        },
        // Cookie consent
        cookieText: 'This site uses cookies to improve our services and for personalized advertising (Google AdSense). By continuing to use this site, you agree to our use of cookies.',
        cookieLearnMore: 'Privacy Policy',
        cookieAccept: 'Accept',
        cookieDecline: 'Decline',
        dateLocale: 'en-US',
    }
};

// Translation helper
function t(key, ...args) {
    const trans = translations[currentLang] || translations.ko;
    const val = trans[key];
    if (typeof val === 'function') return val(...args);
    if (typeof val === 'object' && !Array.isArray(val) && args.length > 0) return val[args[0]] || key;
    return val !== undefined ? val : (translations.ko[key] || key);
}

// Apply translations to all [data-i18n] elements
function applyTranslations() {
    document.documentElement.lang = currentLang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const val = t(key);
        if (typeof val === 'string') el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.dataset.i18nHtml;
        const val = t(key);
        if (typeof val === 'string') el.innerHTML = val;
    });

    // Hero badge (dynamic date)
    const now = new Date();
    const badgeEl = document.getElementById('hero-badge-date');
    if (badgeEl) badgeEl.textContent = t('heroBadge', now.getMonth() + 1, now.getFullYear());

    // Re-format stored dates
    updateLastUpdatedDisplay();

    if (newsLastUpdatedDateObj) {
        const formattedNewsDate = newsLastUpdatedDateObj.toLocaleDateString(t('dateLocale'), {
            month: 'numeric', day: 'numeric'
        });
        const newsUpdatedEl = document.getElementById('news-last-updated');
        if (newsUpdatedEl) newsUpdatedEl.textContent = t('newsUpdated', formattedNewsDate);
    }

    // Re-render HuggingFace cards (rank label changes with language)
    try {
        const cached = localStorage.getItem(HF_CACHE_KEY);
        if (cached) {
            const { data } = JSON.parse(cached);
            if (Array.isArray(data) && data.length > 0) renderHuggingFaceCards(data);
        }
    } catch (e) {}

    // Re-render dynamic content
    if (Object.keys(allData).length > 0) {
        renderContent();
        renderNewEntryModels();
        renderRisingRankModels();
    }
}

function updateLastUpdatedDisplay() {
    if (!lastUpdatedDateObj) return;
    const locale = t('dateLocale');
    const formattedDate = lastUpdatedDateObj.toLocaleString(locale, {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const shortDate = lastUpdatedDateObj.toLocaleString(locale, {
        month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const lastUpdatedEl = document.getElementById('last-updated');
    if (lastUpdatedEl) lastUpdatedEl.textContent = formattedDate;
    const headerEl = document.getElementById('header-last-updated');
    if (headerEl) headerEl.textContent = shortDate;
}

function initLang() {
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) langBtn.textContent = currentLang === 'ko' ? 'EN' : '한';
    if (currentLang === 'en') {
        // Apply English translations to static HTML (default is Korean)
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const val = t(key);
            if (typeof val === 'string') el.textContent = val;
        });
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.dataset.i18nHtml;
            const val = t(key);
            if (typeof val === 'string') el.innerHTML = val;
        });
        const now = new Date();
        const badgeEl = document.getElementById('hero-badge-date');
        if (badgeEl) badgeEl.textContent = t('heroBadge', now.getMonth() + 1, now.getFullYear());
        document.documentElement.lang = 'en';
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'ko' ? 'en' : 'ko';
    localStorage.setItem('lang', currentLang);
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) langBtn.textContent = currentLang === 'ko' ? 'EN' : '한';
    applyTranslations();
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initLang();
    initEventListeners();
    initCookieConsent();
    await loadData();
});

// Theme handling
function initTheme() {
    const theme = localStorage.getItem('theme') || 'dark'; // Default to dark mode
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    }

    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
    });
}

// Cookie consent
function initCookieConsent() {
    const consent = localStorage.getItem('cookieConsent');
    if (consent) return;

    const banner = document.getElementById('cookie-consent');
    if (!banner) return;

    // Slide up after a short delay
    setTimeout(() => {
        banner.classList.remove('translate-y-full');
    }, 800);

    document.getElementById('cookie-accept').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.classList.add('translate-y-full');
    });

    document.getElementById('cookie-decline').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        banner.classList.add('translate-y-full');
    });
}

// Event listeners
function initEventListeners() {
    // Category tabs — use currentTarget so clicks on inner <span> still work
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            currentCategory = e.currentTarget.dataset.category;
            switchCategory(currentCategory);
        });
    });

    // LLM filter tabs — use currentTarget so clicks on inner <span> still work
    document.querySelectorAll('.llm-filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            currentFilter = e.currentTarget.dataset.filter;
            switchLLMFilter(currentFilter);
        });
    });
}

// News ticker variables
let newsTickerInterval = null;
let currentTickerIndex = 0;
let allNewsItems = [];
let isNewsExpanded = false;

// Load and render AI news
async function loadNews() {
    try {
        const cacheBust = Math.floor(Date.now() / 3600000); // hourly cache bust
        const response = await fetch(`data/ai-news.json?v=${cacheBust}`);
        const data = await response.json();

        // Hide loading
        document.getElementById('news-loading').classList.add('hidden');

        // Update last updated time
        if (data.last_updated) {
            newsLastUpdatedDateObj = new Date(data.last_updated);
            const formattedDate = newsLastUpdatedDateObj.toLocaleDateString(t('dateLocale'), {
                month: 'numeric',
                day: 'numeric'
            });
            document.getElementById('news-last-updated').textContent = t('newsUpdated', formattedDate);
        }

        // Store news items and render
        allNewsItems = data.news || [];
        if (allNewsItems.length > 0) {
            renderNewsTicker(allNewsItems);
            renderNewsCards(allNewsItems);
            startNewsTicker();
        } else {
            document.getElementById('news-error').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading news:', error);
        document.getElementById('news-loading').classList.add('hidden');
        document.getElementById('news-error').classList.remove('hidden');
    }
}

// Render news ticker
function renderNewsTicker(newsItems) {
    const tickerContent = document.getElementById('news-ticker-content');
    const ticker = document.getElementById('news-ticker');
    const expandBtn = document.getElementById('news-expand-btn');

    if (!tickerContent || !ticker || !expandBtn) return;

    // Create ticker items with fixed height
    const tickerHTML = newsItems.map((news, index) => `
        <div class="ticker-item h-8 flex items-center text-sm text-gray-700 dark:text-gray-300 font-medium truncate" data-index="${index}">
            <span class="inline-flex items-center gap-2 truncate">
                <span class="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white flex-shrink-0">${news.source}</span>
                <span class="truncate">${news.title}</span>
            </span>
        </div>
    `).join('');

    tickerContent.innerHTML = tickerHTML;
    ticker.classList.remove('hidden');
    expandBtn.classList.remove('hidden');
}

// Start automatic ticker animation
function startNewsTicker() {
    if (newsTickerInterval) clearInterval(newsTickerInterval);

    const tickerContent = document.getElementById('news-ticker-content');
    if (!tickerContent) return;

    const items = tickerContent.querySelectorAll('.ticker-item');
    if (items.length === 0) return;

    newsTickerInterval = setInterval(() => {
        if (isNewsExpanded) return; // Pause when expanded

        currentTickerIndex = (currentTickerIndex + 1) % items.length;
        const offset = -currentTickerIndex * 32; // 32px = h-8 height
        tickerContent.style.transform = `translateY(${offset}px)`;
    }, 3000); // Change every 3 seconds
}

// Render news cards for expanded view
function renderNewsCards(newsItems) {
    const container = document.getElementById('news-expanded');
    if (!container) return;

    container.innerHTML = newsItems.map(news => {
        const date = new Date(news.date);
        const formattedDate = date.toLocaleDateString('ko-KR', {
            month: 'numeric',
            day: 'numeric'
        });

        return `
            <a href="${news.url}" target="_blank" rel="noopener noreferrer"
               class="block bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 hover:shadow-lg transition-all border border-blue-100 dark:border-gray-600 group h-full">
                <div class="flex items-start gap-2 mb-2">
                    <span class="text-xs px-2 py-1 rounded-full bg-blue-500 text-white font-medium">${news.source}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">${formattedDate}</span>
                </div>
                <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    ${news.title}
                </h3>
            </a>
        `;
    }).join('');
}

// Toggle news expansion
function toggleNewsExpand() {
    const expanded = document.getElementById('news-expanded');
    const expandIcon = document.getElementById('expand-icon');
    const expandText = document.getElementById('expand-text');

    if (!expanded || !expandIcon || !expandText) return;

    isNewsExpanded = !isNewsExpanded;

    if (isNewsExpanded) {
        expanded.classList.remove('hidden');
        expanded.style.maxHeight = '1000px';
        expandIcon.style.transform = 'rotate(180deg)';
        expandText.textContent = '접기';
    } else {
        expanded.style.maxHeight = '0';
        expandText.textContent = '전체보기';
        expandIcon.style.transform = 'rotate(0deg)';
        setTimeout(() => {
            if (!isNewsExpanded) {
                expanded.classList.add('hidden');
            }
        }, 500);
    }
}

// ─────────────────────────────────────────────
// HuggingFace Popular Models
// ─────────────────────────────────────────────
const HF_CACHE_KEY = 'hf_models_cache_likes';
const HF_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function loadHuggingFaceModels() {
    // Try loading from localStorage cache first
    try {
        const cached = localStorage.getItem(HF_CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < HF_CACHE_TTL && Array.isArray(data) && data.length > 0) {
                renderHuggingFaceCards(data);
                return;
            }
        }
    } catch (e) {
        // Cache read failed, proceed with fetch
    }

    // Fetch from HuggingFace API
    try {
        const response = await fetch('https://huggingface.co/api/models?sort=likes&limit=5');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const models = await response.json();

        // Save to localStorage cache
        try {
            localStorage.setItem(HF_CACHE_KEY, JSON.stringify({ data: models, timestamp: Date.now() }));
        } catch (e) { /* localStorage full, ignore */ }

        renderHuggingFaceCards(models);
    } catch (error) {
        console.error('Error loading HuggingFace models:', error);
        const skeleton = document.getElementById('hf-skeleton');
        const errorEl = document.getElementById('hf-error');
        if (skeleton) skeleton.classList.add('hidden');
        if (errorEl) errorEl.classList.remove('hidden');
    }
}

function renderHuggingFaceCards(models) {
    const cardsContainer = document.getElementById('hf-cards');
    const skeleton = document.getElementById('hf-skeleton');
    if (!cardsContainer) return;

    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

    cardsContainer.innerHTML = models.map((model, index) => {
        const modelId = model.id || model.modelId || 'Unknown';
        const author = model.author || (modelId.includes('/') ? modelId.split('/')[0] : 'Unknown');
        const likes = model.likes || 0;
        const formattedLikes = likes >= 1000000
            ? `${(likes / 1000000).toFixed(1)}M`
            : likes >= 1000
            ? `${(likes / 1000).toFixed(1)}K`
            : likes.toLocaleString();
        const shortName = modelId.includes('/') ? modelId.split('/')[1] : modelId;
        const hfUrl = `https://huggingface.co/${modelId}`;
        const rankLabel = currentLang === 'ko' ? `${index + 1}위` : `#${index + 1}`;

        return `
            <a href="${hfUrl}" target="_blank" rel="noopener noreferrer"
               class="block bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 hover:shadow-lg transition-all border border-orange-100 dark:border-gray-600 group h-full hover-lift">
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-xl">${medals[index]}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white font-medium">${rankLabel}</span>
                </div>
                <h3 class="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-1" title="${modelId}">
                    ${shortName}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">${author}</p>
                <div class="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                    <span>❤️</span>
                    <span class="font-semibold">${formattedLikes}</span>
                    <span class="text-gray-400">${t('hfDownloads')}</span>
                </div>
            </a>
        `;
    }).join('');

    if (skeleton) skeleton.classList.add('hidden');
    cardsContainer.classList.remove('hidden');
}

// Load all data
async function loadData() {
    try {
        const cacheBust = Math.floor(Date.now() / 3600000); // hourly cache bust

        // Load Korean companies list
        const koreanResponse = await fetch(`data/korean-companies.json?v=${cacheBust}`);
        const koreanData = await koreanResponse.json();
        koreanCompanies = koreanData.companies;

        // Load model links mapping
        const modelLinksData = await fetch(`data/model-links.json?v=${cacheBust}`).then(r => r.json()).catch(() => []);
        modelLinks = modelLinksData;

        // Load AI news
        loadNews();

        // Load HuggingFace popular models
        loadHuggingFaceModels();

        // Load pricing data (non-blocking)
        loadPricingData(cacheBust);

        // Load all API data
        const [llm, t2i, t2s, t2v, i2v, lastUpdated] = await Promise.all([
            fetch(`data/llms.json?v=${cacheBust}`).then(r => r.json()).catch(() => null),
            fetch(`data/text-to-image.json?v=${cacheBust}`).then(r => r.json()).catch(() => null),
            fetch(`data/text-to-speech.json?v=${cacheBust}`).then(r => r.json()).catch(() => null),
            fetch(`data/text-to-video.json?v=${cacheBust}`).then(r => r.json()).catch(() => null),
            fetch(`data/image-to-video.json?v=${cacheBust}`).then(r => r.json()).catch(() => null),
            fetch(`data/last-updated.json?v=${cacheBust}`).then(r => r.json()).catch(() => ({ last_updated: 'N/A' }))
        ]);

        allData = {
            llm: llm?.data || [],
            'text-to-image': t2i?.data || [],
            'text-to-speech': t2s?.data || [],
            'text-to-video': t2v?.data || [],
            'image-to-video': i2v?.data || []
        };

        // Load yesterday's data and calculate changes
        // Pass the last-updated date as reference to avoid 404s for files not yet created
        const refDate = (lastUpdated.last_updated && lastUpdated.last_updated !== 'N/A')
            ? new Date(lastUpdated.last_updated)
            : new Date();
        await loadYesterdayDataAndCalculateChanges(cacheBust, refDate);

        // Update stats
        updateStats();

        // Update last updated time
        if (lastUpdated.last_updated !== 'N/A') {
            lastUpdatedDateObj = new Date(lastUpdated.last_updated);
            updateLastUpdatedDisplay();
        }

        // Show initial content
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('content').classList.remove('hidden');
        renderContent();

        // Show ads only after content is loaded (AdSense policy compliance)
        document.getElementById('ad-top').style.display = 'block';
        document.getElementById('ad-middle').style.display = 'block';
        document.getElementById('ad-bottom').style.display = 'block';

    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('loading').innerHTML = `
            <div class="p-12 text-center">
                <p class="text-red-500 text-lg font-medium">${t('loadError')}</p>
                <p class="mt-2 text-gray-600 dark:text-gray-400">${t('loadErrorSub')}</p>
            </div>
        `;
    }
}

// Load pricing data (non-blocking: runs in background after main data loads)
async function loadPricingData(cacheBust) {
    const [pricesRes, manualRes] = await Promise.all([
        fetch(`data/prices.json?v=${cacheBust}`).catch(() => null),
        fetch(`data/prices-manual.json?v=${cacheBust}`).catch(() => null)
    ]);
    if (pricesRes?.ok) pricingData = await pricesRes.json();
    if (manualRes?.ok) manualPricingData = await manualRes.json();

    // If pricing tab is currently active, refresh the view
    if (currentCategory === 'pricing') renderContent();
}

// ─────────────────────────────────────────────
// Pricing Content Rendering
// ─────────────────────────────────────────────
function renderPricingContent() {
    const isKo = currentLang === 'ko';

    const plansHtml = manualPricingData?.plans?.length
        ? renderSubscriptionPlans(manualPricingData.plans, isKo)
        : `<div class="text-gray-500 dark:text-gray-400 text-sm py-4">${isKo ? '구독 플랜 데이터를 불러오는 중...' : 'Loading subscription plans...'}</div>`;

    const apiHtml = pricingData?.models?.length
        ? renderApiPricingTable(pricingData.models, isKo)
        : `<div class="text-gray-500 dark:text-gray-400 text-sm py-4">${isKo ? 'API 가격 데이터를 불러오는 중... (첫 실행 후 자동 생성됩니다)' : 'Loading API pricing... (auto-generated after first run)'}</div>`;

    const lastUpdated = pricingData?.last_updated
        ? new Date(pricingData.last_updated).toLocaleDateString(isKo ? 'ko-KR' : 'en-US')
        : '';

    return `
    <div class="p-4 md:p-6 space-y-8">

      <!-- Subscription Plans Section -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
            ${isKo ? '💳 AI 구독 플랜 비교' : '💳 AI Subscription Plans'}
          </h2>
          <span class="text-xs text-gray-400 dark:text-gray-500">
            ${isKo ? '* 가격은 USD 기준이며 변동될 수 있습니다' : '* Prices in USD, subject to change'}
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${plansHtml}
        </div>
      </div>

      <!-- API Pricing Section -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">
            ${isKo ? '⚡ API 가격 비교 (1M 토큰 기준)' : '⚡ API Pricing (per 1M tokens)'}
          </h2>
          ${lastUpdated ? `<span class="text-xs text-gray-400 dark:text-gray-500">${isKo ? '업데이트' : 'Updated'}: ${lastUpdated}</span>` : ''}
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-3">
          ${isKo
            ? '출처: OpenRouter API · 가격은 USD 기준이며 공급자 설정에 따라 달라질 수 있습니다.'
            : 'Source: OpenRouter API · Prices in USD and may vary by provider settings.'}
        </div>
        <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          ${apiHtml}
        </div>
      </div>

    </div>`;
}

function renderSubscriptionPlans(plans, isKo) {
    return plans.map(plan => {
        const features = plan.features.slice(0, 4).map(f =>
            `<li class="flex items-start gap-1.5"><span class="text-green-500 mt-0.5">✓</span><span>${f}</span></li>`
        ).join('');

        const yearlyMonthly = plan.price_yearly ? (plan.price_yearly / 12).toFixed(2) : null;

        return `
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                 style="background-color: ${plan.provider_color || '#6B7280'}">
              ${plan.provider.charAt(0)}
            </div>
            <div>
              <div class="font-semibold text-gray-900 dark:text-gray-100 text-sm">${plan.name}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">${plan.provider}</div>
            </div>
          </div>

          <div class="mb-4">
            <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">$${plan.price_monthly}</span>
            <span class="text-gray-500 dark:text-gray-400 text-sm">/${isKo ? '월' : 'mo'}</span>
            ${yearlyMonthly ? `<div class="text-xs text-gray-400 dark:text-gray-500">${isKo ? '연간 결제 시' : 'Billed yearly'} $${yearlyMonthly}/${isKo ? '월' : 'mo'}</div>` : ''}
          </div>

          <ul class="text-sm text-gray-600 dark:text-gray-300 space-y-1.5 mb-4 flex-1">
            ${features}
          </ul>

          ${plan.limits ? `<div class="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2 mb-3">${plan.limits}</div>` : ''}

          <a href="${plan.url}" target="_blank" rel="noopener noreferrer"
             class="text-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            ${isKo ? '자세히 보기 →' : 'Learn more →'}
          </a>
        </div>`;
    }).join('');
}

function sortPricingTable(field) {
    if (pricingSortField === field) {
        pricingSortDir = pricingSortDir === 'asc' ? 'desc' : 'asc';
    } else {
        pricingSortField = field;
        pricingSortDir = 'asc';
    }
    renderContent();
}

function renderApiPricingTable(models, isKo) {
    const sorted = [...models].sort((a, b) => {
        let aVal, bVal;
        switch (pricingSortField) {
            case 'name':    aVal = (a.name || a.id).toLowerCase(); bVal = (b.name || b.id).toLowerCase(); break;
            case 'input':   aVal = a.price_1m_input  ?? Infinity;  bVal = b.price_1m_input  ?? Infinity;  break;
            case 'output':  aVal = a.price_1m_output ?? Infinity;  bVal = b.price_1m_output ?? Infinity;  break;
            case 'context': aVal = a.context_length  ?? 0;         bVal = b.context_length  ?? 0;         break;
            default:        return 0;
        }
        if (aVal < bVal) return pricingSortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return pricingSortDir === 'asc' ? 1 : -1;
        return 0;
    });

    const rows = sorted.map((m, idx) => {
        const inputPrice = m.price_1m_input !== null ? `$${m.price_1m_input.toFixed(2)}` : '-';
        const outputPrice = m.price_1m_output !== null ? `$${m.price_1m_output.toFixed(2)}` : '-';
        const provider = m.id.split('/')[0] || '';

        return `
        <tr class="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
          <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">${idx + 1}</td>
          <td class="px-4 py-3">
            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">${m.name || m.id}</div>
            <div class="text-xs text-gray-400 dark:text-gray-500">${provider}</div>
          </td>
          <td class="px-4 py-3 text-sm font-mono text-right text-gray-800 dark:text-gray-200">${inputPrice}</td>
          <td class="px-4 py-3 text-sm font-mono text-right text-gray-800 dark:text-gray-200">${outputPrice}</td>
          <td class="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">
            ${m.context_length ? (m.context_length >= 1000 ? `${(m.context_length/1000).toFixed(0)}K` : m.context_length) : '-'}
          </td>
        </tr>`;
    }).join('');

    const thBtn = (field, label, alignRight = false) => {
        const active = pricingSortField === field;
        const arrow = active ? (pricingSortDir === 'asc' ? ' ↑' : ' ↓') : ' ⇅';
        return `<th class="px-4 py-3 ${alignRight ? 'text-right' : ''} cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors ${active ? 'text-blue-600 dark:text-blue-400' : ''}"
                    onclick="sortPricingTable('${field}')">${label}${arrow}</th>`;
    };

    return `
    <table class="w-full text-left">
      <thead>
        <tr class="bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          <th class="px-4 py-3 w-10">#</th>
          ${thBtn('name',    isKo ? '모델' : 'Model')}
          ${thBtn('input',   isKo ? '입력 ($/1M)' : 'Input ($/1M)',  true)}
          ${thBtn('output',  isKo ? '출력 ($/1M)' : 'Output ($/1M)', true)}
          ${thBtn('context', isKo ? '컨텍스트' : 'Context',          true)}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// Load yesterday's data and calculate ranking changes
// refDate: reference date from last-updated.json to avoid requesting non-existent history files
async function loadYesterdayDataAndCalculateChanges(cacheBust, refDate) {
    try {
        const now = refDate || new Date();

        // Try to find the most recent available history file, up to 7 days back.
        // This handles cases where the GitHub Action failed to run on a given day.
        let historyFound = false;
        for (let daysBack = 1; daysBack <= 7; daysBack++) {
            const targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysBack));
            const dateStr = targetDate.toISOString().split('T')[0];

            const [llm, t2i, t2s, t2v, i2v] = await Promise.all([
                fetch(`data/history/${dateStr}-llms.json?v=${cacheBust}`).then(r => r.ok ? r.json() : null).catch(() => null),
                fetch(`data/history/${dateStr}-text-to-image.json?v=${cacheBust}`).then(r => r.ok ? r.json() : null).catch(() => null),
                fetch(`data/history/${dateStr}-text-to-speech.json?v=${cacheBust}`).then(r => r.ok ? r.json() : null).catch(() => null),
                fetch(`data/history/${dateStr}-text-to-video.json?v=${cacheBust}`).then(r => r.ok ? r.json() : null).catch(() => null),
                fetch(`data/history/${dateStr}-image-to-video.json?v=${cacheBust}`).then(r => r.ok ? r.json() : null).catch(() => null)
            ]);

            // Use the first date where the main LLM data file is available
            if (llm !== null) {
                yesterdayData = {
                    llm: llm?.data || [],
                    'text-to-image': t2i?.data || [],
                    'text-to-speech': t2s?.data || [],
                    'text-to-video': t2v?.data || [],
                    'image-to-video': i2v?.data || []
                };
                historyFound = true;
                historyAvailable = true;
                break;
            }
        }

        if (!historyFound) {
            // No history data available within the past 7 days.
            // Mark historyAvailable = false to prevent false NEW badges for all items.
            yesterdayData = { llm: [], 'text-to-image': [], 'text-to-speech': [], 'text-to-video': [], 'image-to-video': [] };
            historyAvailable = false;
        }

        // Calculate model count changes
        calculateModelCountChanges();

        // Calculate ranking changes for each category
        calculateRankingChanges();

    } catch (error) {
        console.error('Error loading yesterday data:', error);
        // If we can't load yesterday's data, just continue without ranking changes
        yesterdayData = {};
        rankingChanges = {};
        modelCountChanges = {};
        historyAvailable = false;
    }
}

// Calculate model count changes
function calculateModelCountChanges() {
    modelCountChanges = {};

    for (const category in allData) {
        const todayCount = allData[category]?.length || 0;
        const yesterdayCount = yesterdayData[category]?.length || 0;
        const change = todayCount - yesterdayCount;

        modelCountChanges[category] = {
            today: todayCount,
            yesterday: yesterdayCount,
            change: change
        };
    }
}

// Calculate ranking changes for all categories and filters
function calculateRankingChanges() {
    rankingChanges = {};

    // Helper function to calculate rankings for a dataset
    const calculateRankings = (data, sortField) => {
        const getValue = (item, field) => {
            if (field === 'value_ratio') {
                const performance = item.evaluations?.artificial_analysis_intelligence_index;
                const price = item.pricing?.price_1m_blended_3_to_1;
                if (performance && price && price > 0) {
                    return performance / price;
                }
                return null;
            }
            if (item.evaluations && item.evaluations[field] !== undefined) {
                return item.evaluations[field];
            }
            if (item.pricing && item.pricing[field] !== undefined) {
                return item.pricing[field];
            }
            return item[field];
        };

        const sorted = data
            .filter(item => {
                const value = getValue(item, sortField);
                return value !== null && value !== undefined;
            })
            .sort((a, b) => {
                const aVal = getValue(a, sortField) || 0;
                const bVal = getValue(b, sortField) || 0;
                return bVal - aVal;
            });

        const rankings = {};
        sorted.forEach((item, index) => {
            const id = item.id || item.slug || item.name;
            rankings[id] = index + 1;
        });
        return rankings;
    };

    // LLM rankings with different filters
    const llmFilters = {
        'overall': 'artificial_analysis_intelligence_index',
        'coding': 'artificial_analysis_coding_index',
        'math': 'artificial_analysis_math_index',
        'value': 'value_ratio',
        'speed': 'median_output_tokens_per_second'
    };

    rankingChanges.llm = {};
    for (const [filter, sortField] of Object.entries(llmFilters)) {
        const todayRankings = calculateRankings(allData.llm || [], sortField);
        const yesterdayRankings = calculateRankings(yesterdayData.llm || [], sortField);

        rankingChanges.llm[filter] = {};
        for (const id in todayRankings) {
            const todayRank = todayRankings[id];
            const yesterdayRank = yesterdayRankings[id];

            if (yesterdayRank !== undefined) {
                rankingChanges.llm[filter][id] = {
                    today: todayRank,
                    yesterday: yesterdayRank,
                    change: yesterdayRank - todayRank, // Positive = moved up
                    isNew: false
                };
            } else {
                rankingChanges.llm[filter][id] = {
                    today: todayRank,
                    yesterday: null,
                    change: null,
                    isNew: historyAvailable // Only NEW if history was loaded but item wasn't in it
                };
            }
        }
    }

    // Media rankings (by ELO)
    const mediaCategories = ['text-to-image', 'text-to-speech', 'text-to-video', 'image-to-video'];
    for (const category of mediaCategories) {
        const todayData = allData[category] || [];
        const yesterdayDataCat = yesterdayData[category] || [];

        // Sort by ELO
        const todayRankings = {};
        const yesterdayRankings = {};

        todayData
            .filter(item => item.elo !== null && item.elo !== undefined)
            .sort((a, b) => (b.elo || 0) - (a.elo || 0))
            .forEach((item, index) => {
                const id = item.id || item.slug || item.name;
                todayRankings[id] = index + 1;
            });

        yesterdayDataCat
            .filter(item => item.elo !== null && item.elo !== undefined)
            .sort((a, b) => (b.elo || 0) - (a.elo || 0))
            .forEach((item, index) => {
                const id = item.id || item.slug || item.name;
                yesterdayRankings[id] = index + 1;
            });

        rankingChanges[category] = {};
        for (const id in todayRankings) {
            const todayRank = todayRankings[id];
            const yesterdayRank = yesterdayRankings[id];

            if (yesterdayRank !== undefined) {
                rankingChanges[category][id] = {
                    today: todayRank,
                    yesterday: yesterdayRank,
                    change: yesterdayRank - todayRank,
                    isNew: false
                };
            } else {
                rankingChanges[category][id] = {
                    today: todayRank,
                    yesterday: null,
                    change: null,
                    isNew: historyAvailable // Only NEW if history was loaded but item wasn't in it
                };
            }
        }
    }
}

// Animate counter
function animateCounter(element, target, duration = 1000) {
    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16); // 60fps
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current);
        }
    }, 16);
}

// Update statistics with animation
function updateStats() {
    const totalCount = Object.values(allData).reduce((sum, arr) => sum + arr.length, 0);
    const totalElement = document.getElementById('total-models');
    if (totalElement) {
        animateCounter(totalElement, totalCount, 1200);
    }
    const heroTotalElement = document.getElementById('hero-total-models');
    if (heroTotalElement) {
        animateCounter(heroTotalElement, totalCount, 1200);
    }

    const uniqueCompanies = new Set(
        Object.values(allData).flat().map(m => m.model_creator?.id).filter(Boolean)
    );
    const companiesElement = document.getElementById('hero-total-companies');
    if (companiesElement) {
        animateCounter(companiesElement, uniqueCompanies.size, 1200);
    }

    // Calculate and show total model count change
    const totalChangeElement = document.getElementById('total-models-change');
    if (totalChangeElement && modelCountChanges) {
        const totalChange = Object.values(modelCountChanges).reduce((sum, cat) => sum + (cat.change || 0), 0);
        if (totalChange > 0) {
            totalChangeElement.textContent = `(+${totalChange})`;
            totalChangeElement.className = 'text-green-600 dark:text-green-400 text-sm font-semibold ml-1';
        } else if (totalChange < 0) {
            totalChangeElement.textContent = `(${totalChange})`;
            totalChangeElement.className = 'text-red-600 dark:text-red-400 text-sm font-semibold ml-1';
        } else {
            totalChangeElement.textContent = '';
        }
    }

    const koreanCount = Object.values(allData).reduce((sum, arr) => {
        return sum + arr.filter(item => isKoreanCompany(item)).length;
    }, 0);
    const koreanElement = document.getElementById('korean-models');
    if (koreanElement) {
        animateCounter(koreanElement, koreanCount, 1200);
    }

    // Calculate and show Korean model count change
    const koreanChangeElement = document.getElementById('korean-models-change');
    if (koreanChangeElement && yesterdayData && Object.keys(yesterdayData).length > 0) {
        const yesterdayKoreanCount = Object.values(yesterdayData).reduce((sum, arr) => {
            return sum + arr.filter(item => isKoreanCompany(item)).length;
        }, 0);
        const koreanChange = koreanCount - yesterdayKoreanCount;
        if (koreanChange > 0) {
            koreanChangeElement.textContent = `(+${koreanChange})`;
            koreanChangeElement.className = 'text-green-600 dark:text-green-400 text-sm font-semibold ml-1';
        } else if (koreanChange < 0) {
            koreanChangeElement.textContent = `(${koreanChange})`;
            koreanChangeElement.className = 'text-red-600 dark:text-red-400 text-sm font-semibold ml-1';
        } else {
            koreanChangeElement.textContent = '';
        }
    }

    // New entry models and rising rank models
    renderNewEntryModels();
    renderRisingRankModels();
}

// Check if company is Korean
function isKoreanCompany(item) {
    const modelName = item.model_name || item.name || '';
    const companyName = item.model_creator?.name || item.provider || item.company || '';
    const searchText = `${modelName} ${companyName}`.toLowerCase();
    return koreanCompanies.some(company =>
        company.keywords.some(keyword => searchText.includes(keyword.toLowerCase()))
    );
}

// Get models whose release_date is within the last month, sorted oldest-first
function getNewEntryModels() {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const newModels = [];
    for (const [category, models] of Object.entries(allData)) {
        for (const model of models) {
            if (model.release_date) {
                const releaseDate = new Date(model.release_date);
                if (releaseDate >= oneMonthAgo) {
                    newModels.push({ name: model.name, releaseDate, category });
                }
            }
        }
    }

    // Oldest first — models closest to leaving the 1-month window appear at top
    newModels.sort((a, b) => a.releaseDate - b.releaseDate);
    return newModels;
}

// Get models with the biggest positive rank change today (across all categories)
function getRisingRankModels() {
    const risingModels = [];

    // LLM overall filter
    const llmChanges = rankingChanges.llm?.overall || {};
    for (const [id, changeInfo] of Object.entries(llmChanges)) {
        if (changeInfo.change > 0) {
            const model = (allData.llm || []).find(m => (m.id || m.slug || m.name) === id);
            if (model) {
                risingModels.push({ name: model.name, change: changeInfo.change, rank: changeInfo.today });
            }
        }
    }

    // Media categories
    for (const category of ['text-to-image', 'text-to-speech', 'text-to-video', 'image-to-video']) {
        const changes = rankingChanges[category] || {};
        for (const [id, changeInfo] of Object.entries(changes)) {
            if (changeInfo.change > 0) {
                const model = (allData[category] || []).find(m => (m.id || m.slug || m.name) === id);
                if (model) {
                    risingModels.push({ name: model.name, change: changeInfo.change, rank: changeInfo.today });
                }
            }
        }
    }

    // Sort by rank change desc; break ties by current rank asc
    risingModels.sort((a, b) => b.change !== a.change ? b.change - a.change : a.rank - b.rank);
    return risingModels;
}

const MAX_BOX_ITEMS = 3;

// Render the new-entry-models box
function renderNewEntryModels() {
    const el = document.getElementById('new-entry-models');
    if (!el) return;

    const newModels = getNewEntryModels();
    if (newModels.length === 0) {
        el.innerHTML = `<div class="text-xs opacity-70 py-2">${t('noNewModels')}</div>`;
        return;
    }

    const displayed = newModels.slice(0, MAX_BOX_ITEMS);
    const hidden = newModels.length - MAX_BOX_ITEMS;
    const locale = t('dateLocale');

    let html = '<div class="space-y-1.5">';
    for (const model of displayed) {
        const dateStr = model.releaseDate.toLocaleDateString(locale, { month: 'numeric', day: 'numeric' });
        html += `<div class="flex items-center justify-between text-sm leading-tight">
            <span class="font-medium truncate mr-2">${model.name}</span>
            <span class="text-xs opacity-75 flex-shrink-0">${dateStr}</span>
        </div>`;
    }
    if (hidden > 0) {
        html += `<div class="text-xs opacity-70 pt-0.5">${t('andMore', hidden)}</div>`;
    }
    html += '</div>';
    el.innerHTML = html;
}

// Render the rising-rank-models box
function renderRisingRankModels() {
    const el = document.getElementById('rising-rank-models');
    if (!el) return;

    const risingModels = getRisingRankModels();
    if (risingModels.length === 0) {
        el.innerHTML = `
            <div class="flex flex-col items-center justify-center py-2 opacity-70 text-center">
                <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M3 6h18M7 18h10"/>
                </svg>
                <span class="text-xs">${t('noRankChanges')}</span>
            </div>`;
        return;
    }

    const displayed = risingModels.slice(0, MAX_BOX_ITEMS);
    const hidden = risingModels.length - MAX_BOX_ITEMS;

    let html = '<div class="space-y-1.5">';
    for (const model of displayed) {
        html += `<div class="flex items-center justify-between text-sm leading-tight">
            <span class="font-medium truncate mr-2">${model.name}</span>
            <span class="text-green-300 font-bold flex-shrink-0">↑${model.change}</span>
        </div>`;
    }
    if (hidden > 0) {
        html += `<div class="text-xs opacity-70 pt-0.5">${t('andMore', hidden)}</div>`;
    }
    html += '</div>';
    el.innerHTML = html;
}

// Switch category
function switchCategory(category) {
    // Clear comparison selection when switching categories
    clearComparison();

    // Update tab styles
    document.querySelectorAll('.category-tab').forEach(tab => {
        if (tab.dataset.category === category) {
            tab.classList.add('active', 'border-blue-500', 'text-blue-600', 'dark:text-blue-400');
            tab.classList.remove('border-transparent', 'text-gray-600', 'dark:text-gray-400');
        } else {
            tab.classList.remove('active', 'border-blue-500', 'text-blue-600', 'dark:text-blue-400');
            tab.classList.add('border-transparent', 'text-gray-600', 'dark:text-gray-400');
        }
    });

    // Show/hide LLM filters (only show for LLM category)
    document.getElementById('llm-filters').style.display = category === 'llm' ? 'block' : 'none';

    renderContent();
}

// Switch LLM filter
function switchLLMFilter(filter) {
    currentFilter = filter;

    // Update filter button styles
    document.querySelectorAll('.llm-filter-tab').forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active', 'bg-blue-500', 'text-white');
            btn.classList.remove('bg-gray-200', 'dark:bg-gray-600', 'text-gray-700', 'dark:text-gray-300');
        } else {
            btn.classList.remove('active', 'bg-blue-500', 'text-white');
            btn.classList.add('bg-gray-200', 'dark:bg-gray-600', 'text-gray-700', 'dark:text-gray-300');
        }
    });

    renderContent();
}

// Render content based on current category and filter
function renderContent() {
    const contentDiv = document.getElementById('content');

    if (currentCategory === 'llm') {
        contentDiv.innerHTML = renderLLMContent();
    } else if (currentCategory === 'korean') {
        contentDiv.innerHTML = renderKoreanServicesContent();
    } else if (currentCategory === 'pricing') {
        contentDiv.innerHTML = renderPricingContent();
    } else {
        contentDiv.innerHTML = renderMediaContent();
    }
}

// Render LLM content
function renderLLMContent() {
    const data = allData.llm || [];
    if (data.length === 0) {
        return `<div class="p-12 text-center text-gray-500">${t('noData')}</div>`;
    }

    // Determine which field to sort by
    let sortField, isValueRatio = false;
    switch (currentFilter) {
        case 'coding':
            sortField = 'artificial_analysis_coding_index';
            break;
        case 'math':
            sortField = 'artificial_analysis_math_index';
            break;
        case 'value':
            sortField = 'value_ratio';
            isValueRatio = true;
            break;
        case 'speed':
            sortField = 'median_output_tokens_per_second';
            break;
        default:
            sortField = 'artificial_analysis_intelligence_index';
    }
    const sortLabel = t('sortLabel', currentFilter);

    // Helper function to get value from item
    const getValue = (item, field) => {
        // Special handling for value ratio (performance / price)
        if (field === 'value_ratio') {
            const performance = item.evaluations?.artificial_analysis_intelligence_index;
            const price = item.pricing?.price_1m_blended_3_to_1;
            if (performance && price && price > 0) {
                return performance / price; // Higher is better
            }
            return null;
        }

        // For evaluation fields, check evaluations object
        if (item.evaluations && item.evaluations[field] !== undefined) {
            return item.evaluations[field];
        }
        // For pricing/speed fields, check pricing/root object
        if (item.pricing && item.pricing[field] !== undefined) {
            return item.pricing[field];
        }
        // Check root object
        return item[field];
    };

    // Sort and filter data
    const sortedData = data
        .filter(item => {
            const value = getValue(item, sortField);
            if (value === null || value === undefined) return false;
            // For value ranking, require minimum intelligence score to exclude
            // low-quality models that rank high only due to very low price
            if (isValueRatio) {
                const score = item.evaluations?.artificial_analysis_intelligence_index;
                if (!score || score < 30) return false;
            }
            return true;
        })
        .sort((a, b) => {
            const aVal = getValue(a, sortField) || 0;
            const bVal = getValue(b, sortField) || 0;
            return bVal - aVal; // Always descending (higher is better)
        })
        .slice(0, 30);

    const getMedalEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '';
    };

    return `
        <div class="p-6">
            <div class="flex items-center gap-2 mb-6">
                <h2 class="text-2xl font-bold">${t('rankingTitle', sortLabel)}</h2>
                <button onclick="showScoreInfoModal('${currentFilter}')" class="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-400 text-sm font-bold" title="${sortLabel}">
                    ?
                </button>
            </div>
            <div class="space-y-3">
                ${sortedData.map((item, index) => {
                    const rank = index + 1;
                    const isKorean = isKoreanCompany(item);
                    const score = getValue(item, sortField);
                    const medal = getMedalEmoji(rank);
                    const provider = item.model_creator?.name || item.provider || item.company || '-';
                    const modelUrl = getModelUrl('llm', item);

                    // Get ranking change info
                    const itemId = item.id || item.slug || item.name;
                    const changeInfo = rankingChanges?.llm?.[currentFilter]?.[itemId];
                    let rankingIndicator = '';

                    if (changeInfo) {
                        if (changeInfo.isNew) {
                            rankingIndicator = '<span class="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-500 text-white ml-2">NEW</span>';
                        } else if (changeInfo.change > 0) {
                            rankingIndicator = `<span class="inline-flex items-center text-green-600 dark:text-green-400 text-sm font-bold ml-2" title="${t('rankUp', changeInfo.change)}">↑${changeInfo.change}</span>`;
                        } else if (changeInfo.change < 0) {
                            rankingIndicator = `<span class="inline-flex items-center text-red-600 dark:text-red-400 text-sm font-bold ml-2" title="${t('rankDown', Math.abs(changeInfo.change))}">↓${Math.abs(changeInfo.change)}</span>`;
                        } else {
                            rankingIndicator = `<span class="inline-flex items-center text-gray-500 dark:text-gray-400 text-sm ml-2" title="${t('rankSame')}">−</span>`;
                        }
                    }

                    const isAlreadySelected = selectedForComparison.some(m => m.id === itemId);
                    const cmpBtnClass = isAlreadySelected
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400';
                    const scoreUnit = currentFilter === 'value' ? t('unitValueScore') : currentFilter === 'speed' ? t('unitSpeed') : t('unitScore');

                    return `
                        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div class="flex items-center gap-4 flex-1 min-w-0">
                                <div class="flex items-center gap-1">
                                    <div class="text-2xl font-bold text-gray-400 dark:text-gray-500 w-8">
                                        ${rank}
                                    </div>
                                    ${rankingIndicator}
                                </div>
                                ${medal ? `<div class="text-3xl">${medal}</div>` : '<div class="w-8"></div>'}
                                <div class="flex-1 min-w-0">
                                    <div class="font-semibold text-lg">
                                        ${modelUrl ? `<a href="${modelUrl}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">${item.name || item.model_name || 'Unknown'}</a>` : (item.name || item.model_name || 'Unknown')}
                                        ${isKorean ? '<span class="ml-2 text-xl">🇰🇷</span>' : ''}
                                    </div>
                                    <div class="text-sm text-gray-600 dark:text-gray-400">
                                        ${provider}
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3 flex-shrink-0">
                                <div class="text-right">
                                    <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        ${score ? score.toFixed(currentFilter === 'value' ? 1 : currentFilter === 'speed' ? 0 : 1) : '-'}
                                    </div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">${scoreUnit}</div>
                                </div>
                                <button onclick="toggleCompareModel('${itemId}')" id="cmp-btn-${itemId}" class="${cmpBtnClass} px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap">
                                    ${isAlreadySelected ? t('btnSelected') : t('btnCompare')}
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Helper function to generate model URL based on category
function getModelUrl(category, item) {
    if (!item) return null;
    const mapped = modelLinks.find(m => m.name === item.name);
    if (mapped) return mapped.url;
    if (category === 'llm' && item.slug) {
        return `https://artificialanalysis.ai/models/${item.slug}`;
    }
    return null;
}

// Render media content (Text-to-Image, etc.)
function renderMediaContent() {
    const data = allData[currentCategory] || [];
    if (data.length === 0) {
        return `<div class="p-12 text-center text-gray-500">${t('noData')}</div>`;
    }

    // Sort by ELO score
    const sortedData = data
        .filter(item => item.elo !== null && item.elo !== undefined)
        .sort((a, b) => (b.elo || 0) - (a.elo || 0))
        .slice(0, 30);

    const getMedalEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '';
    };

    const categoryNames = {
        'text-to-image': 'Text-to-Image',
        'text-to-speech': 'Text-to-Speech',
        'text-to-video': 'Text-to-Video',
        'image-to-video': 'Image-to-Video'
    };

    const categoryEmojis = {
        'text-to-image': '🎨',
        'text-to-speech': '🎙️',
        'text-to-video': '🎬',
        'image-to-video': '🎞️'
    };

    return `
        <div class="p-6">
            <div class="flex items-center gap-2 mb-6">
                <h2 class="text-2xl font-bold">${t('mediaRankTitle', categoryEmojis[currentCategory], categoryNames[currentCategory])}</h2>
                <button onclick="showScoreInfoModal('${currentCategory}')" class="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-400 text-sm font-bold" title="ELO">
                    ?
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-gray-700">
                            <th class="text-left py-3 px-4 font-semibold">${t('thRank')}</th>
                            <th class="text-left py-3 px-4 font-semibold">${t('thModel')}</th>
                            <th class="text-left py-3 px-4 font-semibold">${t('thCompany')}</th>
                            <th class="text-right py-3 px-4 font-semibold">${t('thElo')}</th>
                            <th class="text-right py-3 px-4 font-semibold">${t('thEval')}</th>
                            <th class="text-right py-3 px-4 font-semibold">${t('thRelease')}</th>
                            <th class="text-center py-3 px-4 font-semibold">${t('thCompare')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sortedData.map((item, index) => {
                            const rank = index + 1;
                            const isKorean = isKoreanCompany(item);
                            const medal = getMedalEmoji(rank);
                            const modelUrl = getModelUrl(currentCategory, item);
                            const company = item.model_creator?.name || item.company || item.provider || '-';

                            // Get ranking change info
                            const itemId = item.id || item.slug || item.name;
                            const changeInfo = rankingChanges?.[currentCategory]?.[itemId];
                            let rankingIndicator = '';

                            if (changeInfo) {
                                if (changeInfo.isNew) {
                                    rankingIndicator = '<span class="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-500 text-white ml-2">NEW</span>';
                                } else if (changeInfo.change > 0) {
                                    rankingIndicator = `<span class="inline-flex items-center text-green-600 dark:text-green-400 text-sm font-bold ml-2" title="${t('rankUp', changeInfo.change)}">↑${changeInfo.change}</span>`;
                                } else if (changeInfo.change < 0) {
                                    rankingIndicator = `<span class="inline-flex items-center text-red-600 dark:text-red-400 text-sm font-bold ml-2" title="${t('rankDown', Math.abs(changeInfo.change))}">↓${Math.abs(changeInfo.change)}</span>`;
                                } else {
                                    rankingIndicator = `<span class="inline-flex items-center text-gray-500 dark:text-gray-400 text-sm ml-2" title="${t('rankSame')}">−</span>`;
                                }
                            }

                            const isAlreadySelected = selectedForComparison.some(m => m.id === itemId);
                            const cmpBtnClass = isAlreadySelected
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400';

                            return `
                                <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td class="py-4 px-4">
                                        <div class="flex items-center gap-2">
                                            <span class="font-bold text-gray-600 dark:text-gray-400">${rank}</span>
                                            ${medal ? `<span class="text-xl">${medal}</span>` : ''}
                                            ${rankingIndicator}
                                        </div>
                                    </td>
                                    <td class="py-4 px-4">
                                        <div class="font-semibold">
                                            ${modelUrl ? `<a href="${modelUrl}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">${item.name || item.model_name || 'Unknown'}</a>` : (item.name || item.model_name || 'Unknown')}
                                            ${isKorean ? '<span class="ml-2">🇰🇷</span>' : ''}
                                        </div>
                                    </td>
                                    <td class="py-4 px-4 text-gray-600 dark:text-gray-400">
                                        ${company}
                                    </td>
                                    <td class="py-4 px-4 text-right">
                                        <span class="font-bold text-blue-600 dark:text-blue-400 text-lg">
                                            ${item.elo ? Math.round(item.elo) : '-'}
                                        </span>
                                    </td>
                                    <td class="py-4 px-4 text-right text-gray-600 dark:text-gray-400">
                                        ${item.appearances ? item.appearances.toLocaleString() : '-'}
                                    </td>
                                    <td class="py-4 px-4 text-right text-gray-600 dark:text-gray-400">
                                        ${item.release_date ? new Date(item.release_date).toLocaleDateString(t('dateLocale')) : '-'}
                                    </td>
                                    <td class="py-4 px-4 text-center">
                                        <button onclick="toggleCompareModel('${itemId}')" id="cmp-btn-${itemId}" class="${cmpBtnClass} px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap">
                                            ${isAlreadySelected ? t('btnSelected') : t('btnCompare')}
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Render Korean services from all categories
function renderKoreanServicesContent() {
    const koreanServices = [];

    // Helper to get category emoji and name
    const categoryInfo = {
        'llm': { emoji: '💬', name: 'LLM', sortField: 'artificial_analysis_intelligence_index', unit: '점' },
        'text-to-image': { emoji: '🎨', name: 'Text-to-Image', sortField: 'elo', unit: 'ELO' },
        'text-to-speech': { emoji: '🎙️', name: 'Text-to-Speech', sortField: 'elo', unit: 'ELO' },
        'text-to-video': { emoji: '🎬', name: 'Text-to-Video', sortField: 'elo', unit: 'ELO' },
        'image-to-video': { emoji: '🎞️', name: 'Image-to-Video', sortField: 'elo', unit: 'ELO' }
    };

    // Collect Korean services from each category
    Object.keys(allData).forEach(category => {
        const data = allData[category] || [];
        const info = categoryInfo[category];

        // Create sorted list to calculate ranks
        let sortedData;
        if (category === 'llm') {
            sortedData = data
                .filter(item => {
                    const value = item.evaluations?.[info.sortField];
                    return value !== null && value !== undefined;
                })
                .sort((a, b) => {
                    const aVal = a.evaluations?.[info.sortField] || 0;
                    const bVal = b.evaluations?.[info.sortField] || 0;
                    return bVal - aVal;
                });
        } else {
            sortedData = data
                .filter(item => item[info.sortField] !== null && item[info.sortField] !== undefined)
                .sort((a, b) => (b[info.sortField] || 0) - (a[info.sortField] || 0));
        }

        // Find Korean services and their ranks
        sortedData.forEach((item, index) => {
            if (isKoreanCompany(item)) {
                const rank = index + 1; // rank is just the index + 1 in sorted array

                let score;
                if (category === 'llm') {
                    score = item.evaluations?.[info.sortField];
                } else {
                    score = item[info.sortField];
                }

                if (score !== null && score !== undefined) {
                    koreanServices.push({
                        name: item.name || item.model_name || 'Unknown',
                        company: item.model_creator?.name || item.provider || item.company || '-',
                        category: category,
                        categoryEmoji: info.emoji,
                        categoryName: info.name,
                        rank: rank,
                        score: score,
                        unit: info.unit,
                        slug: item.slug,
                        totalInCategory: sortedData.length
                    });
                }
            }
        });
    });

    if (koreanServices.length === 0) {
        return `<div class="p-12 text-center text-gray-500">${t('noKoreanData')}</div>`;
    }

    // Sort by rank within category
    koreanServices.sort((a, b) => a.rank - b.rank);

    return `
        <div class="p-6">
            <div class="flex items-center gap-2 mb-6">
                <h2 class="text-2xl font-bold">${t('koreanAiServices')}</h2>
                <span class="text-sm text-gray-500 dark:text-gray-400">${t('koreanTotal', koreanServices.length)}</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-gray-700">
                            <th class="text-left py-3 px-4 font-semibold">${t('thField')}</th>
                            <th class="text-left py-3 px-4 font-semibold">${t('thModel')}</th>
                            <th class="text-left py-3 px-4 font-semibold">${t('thCompany')}</th>
                            <th class="text-center py-3 px-4 font-semibold">${t('thRank')}</th>
                            <th class="text-right py-3 px-4 font-semibold">${t('thScore')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${koreanServices.map((service) => {
                            const modelUrl = getModelUrl(service.category, {
                                slug: service.slug,
                                name: service.name,
                                model_name: service.name
                            });
                            const rankDisplay = `${service.rank}/${service.totalInCategory}`;

                            return `
                                <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td class="py-4 px-4">
                                        <div class="flex items-center gap-2">
                                            <span class="text-xl">${service.categoryEmoji}</span>
                                            <span class="text-sm font-medium">${service.categoryName}</span>
                                        </div>
                                    </td>
                                    <td class="py-4 px-4">
                                        <div class="font-semibold">
                                            ${modelUrl ? `<a href="${modelUrl}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">${service.name}</a>` : service.name}
                                        </div>
                                    </td>
                                    <td class="py-4 px-4 text-gray-600 dark:text-gray-400">
                                        ${service.company}
                                    </td>
                                    <td class="py-4 px-4 text-center">
                                        <span class="inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                            service.rank <= 3 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                            service.rank <= 10 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }">
                                            ${rankDisplay}
                                        </span>
                                    </td>
                                    <td class="py-4 px-4 text-right">
                                        <div class="font-bold text-blue-600 dark:text-blue-400">
                                            ${service.score.toFixed(service.unit === 'ELO' ? 0 : 1)}
                                        </div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">${service.unit}</div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p class="text-sm text-gray-700 dark:text-gray-300">
                    <strong>${t('rankNote')}</strong>
                    <span class="inline-block px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs">${t('rank1to3')}</span>
                    <span class="inline-block px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs">${t('rank4to10')}</span>
                    <span class="inline-block px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">${t('rank11plus')}</span>
                </p>
            </div>
        </div>
    `;
}

// Modal functions
function showScoreInfoModal(filterType) {
    const modal = document.getElementById('info-modal');
    const titleEl = document.getElementById('modal-title');
    const contentEl = document.getElementById('modal-content');

    const scoreInfo = {
        overall: {
            title: '🧠 인공 분석 지능 지수란?',
            content: `
                <p class="leading-relaxed">
                    <strong class="text-blue-600 dark:text-blue-400">인공 분석 지능 지수(Artificial Analysis Intelligence Index)</strong>는
                    추론, 지식, 수학, 프로그래밍 전반에 걸쳐 언어 모델의 능력을 종합적으로 평가하는 지표입니다.
                </p>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 점수 체계</h4>
                    <p class="text-sm">
                        <strong>0-100점 척도</strong>로 평가되며, 10가지 벤치마크 테스트의 종합 점수입니다.
                    </p>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📋 평가 방법</h4>
                    <p class="text-sm">
                        GDPval-AA, τ²-Bench Telecom, Terminal-Bench Hard, SciCode, AA-LCR,
                        AA-Omniscience, IFBench, Humanity's Last Exam, GPQA Diamond, CritPt 등 10가지 평가 도구 통합
                    </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <div class="text-sm font-semibold mb-1">✅ 신뢰도</div>
                        <div class="text-xs">95% 신뢰 구간 ±1% 미만</div>
                    </div>
                    <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <div class="text-sm font-semibold mb-1">🌐 평가 범위</div>
                        <div class="text-xs">텍스트 전용 영어 평가</div>
                    </div>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 italic">
                    ※ 모든 평가 지표와 마찬가지로 한계가 있으며, 모든 사용 사례에 직접 적용할 수는 없습니다.
                </p>
            `
        },
        coding: {
            title: '💻 코딩 점수란?',
            content: `
                <p class="leading-relaxed">
                    <strong class="text-blue-600 dark:text-blue-400">코딩 지수(Coding Index)</strong>는
                    프로그래밍 작업을 수행하는 언어 모델의 능력을 평가하는 지표입니다.
                </p>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 점수 체계</h4>
                    <p class="text-sm mb-2">
                        <strong>0-100점 척도</strong>로 평가됩니다.
                    </p>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>70점 이상: 고급 프로그래밍 능력</li>
                        <li>50-70점: 중급 프로그래밍 능력</li>
                        <li>50점 미만: 기본 프로그래밍 능력</li>
                    </ul>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">🎯 평가 항목</h4>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>코드 생성 및 완성</li>
                        <li>버그 수정 및 디버깅</li>
                        <li>알고리즘 구현</li>
                        <li>코드 리팩토링</li>
                    </ul>
                </div>
            `
        },
        math: {
            title: '🔢 수학 점수란?',
            content: `
                <p class="leading-relaxed">
                    <strong class="text-blue-600 dark:text-blue-400">수학 지수(Math Index)</strong>는
                    수학적 문제 해결 능력을 평가하는 지표입니다.
                </p>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 점수 체계</h4>
                    <p class="text-sm mb-2">
                        <strong>0-100점 척도</strong>로 평가됩니다.
                    </p>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>70점 이상: 고급 수학 문제 해결</li>
                        <li>50-70점: 중급 수학 문제 해결</li>
                        <li>50점 미만: 기본 수학 문제 해결</li>
                    </ul>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">🎯 평가 항목</h4>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>대수학 및 기하학</li>
                        <li>미적분학 및 확률론</li>
                        <li>논리적 추론</li>
                        <li>복잡한 수식 계산</li>
                    </ul>
                </div>
            `
        },
        value: {
            title: '💰 가성비란?',
            content: `
                <p class="leading-relaxed">
                    <strong class="text-blue-600 dark:text-blue-400">가성비(Value for Money)</strong>는
                    성능 대비 가격 효율성을 나타내는 지표입니다.
                </p>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 계산 방식</h4>
                    <p class="text-sm mb-2">
                        <strong>가성비 = 지능 지수 / 가격</strong>
                    </p>
                    <p class="text-sm">
                        단위: <strong>점/$</strong> (1달러당 얻는 성능 점수)
                    </p>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-green-900 dark:text-green-300">💡 해석 방법</h4>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>높을수록 가성비가 좋음</li>
                        <li>같은 가격이면 성능이 높은 모델이 유리</li>
                        <li>같은 성능이면 가격이 낮은 모델이 유리</li>
                    </ul>
                </div>
                <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-yellow-900 dark:text-yellow-300">⚠️ 참고사항</h4>
                    <p class="text-sm">
                        가격은 100만 토큰 기준 혼합 가격(입력:출력 = 3:1)을 사용합니다.
                    </p>
                </div>
            `
        },
        speed: {
            title: '⚡ 속도란?',
            content: `
                <p class="leading-relaxed">
                    <strong class="text-blue-600 dark:text-blue-400">속도(Speed)</strong>는
                    모델이 초당 생성하는 토큰(단어 조각) 수를 나타냅니다.
                </p>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 측정 단위</h4>
                    <p class="text-sm mb-2">
                        <strong>tok/s</strong> (tokens per second)
                    </p>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>100 tok/s 이상: 매우 빠름</li>
                        <li>50-100 tok/s: 빠름</li>
                        <li>50 tok/s 미만: 보통</li>
                    </ul>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-green-900 dark:text-green-300">💡 중요성</h4>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>실시간 대화에서 중요</li>
                        <li>긴 문서 생성 시 체감 속도 차이</li>
                        <li>대량 처리 작업의 효율성</li>
                    </ul>
                </div>
                <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-yellow-900 dark:text-yellow-300">⚠️ 참고사항</h4>
                    <p class="text-sm">
                        중앙값 출력 토큰 속도(median output tokens per second)를 기준으로 측정됩니다.
                    </p>
                </div>
            `
        },
        'text-to-image': {
            title: '🎨 Text-to-Image ELO 점수란?',
            content: `
                <p class="leading-relaxed">
                    <strong class="text-blue-600 dark:text-blue-400">ELO 점수</strong>는
                    텍스트를 이미지로 변환하는 AI 모델의 성능을 측정하는 지표입니다.
                </p>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 ELO 시스템이란?</h4>
                    <p class="text-sm mb-2">
                        체스 등급 시스템에서 유래한 <strong>상대 평가 시스템</strong>입니다.
                    </p>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>1200+ : 우수한 성능</li>
                        <li>1000-1200 : 평균 이상</li>
                        <li>1000 미만 : 평균 이하</li>
                    </ul>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">🎯 평가 방법</h4>
                    <p class="text-sm">
                        사용자들이 같은 프롬프트로 생성된 두 이미지를 비교하여 더 나은 결과를 선택합니다.
                        승리/패배에 따라 점수가 조정됩니다.
                    </p>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-green-900 dark:text-green-300">💡 평가 기준</h4>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>이미지 품질 및 사실성</li>
                        <li>프롬프트 이해도</li>
                        <li>세부 묘사력</li>
                        <li>창의성 및 예술성</li>
                    </ul>
                </div>
            `
        },
        'text-to-speech': {
            title: '🎙️ Text-to-Speech ELO 점수란?',
            content: `
                <p class="leading-relaxed">
                    <strong class="text-blue-600 dark:text-blue-400">ELO 점수</strong>는
                    텍스트를 음성으로 변환하는 AI 모델의 성능을 측정하는 지표입니다.
                </p>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 ELO 시스템이란?</h4>
                    <p class="text-sm mb-2">
                        상대 평가 방식으로, 모델 간 직접 비교를 통해 점수가 결정됩니다.
                    </p>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>1100+ : 우수한 음성 품질</li>
                        <li>1000-1100 : 평균 이상</li>
                        <li>1000 미만 : 평균 이하</li>
                    </ul>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">🎯 평가 방법</h4>
                    <p class="text-sm">
                        사용자들이 같은 텍스트로 생성된 두 음성을 듣고 더 자연스러운 음성을 선택합니다.
                    </p>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-green-900 dark:text-green-300">💡 평가 기준</h4>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>음성의 자연스러움</li>
                        <li>발음 정확도</li>
                        <li>감정 표현력</li>
                        <li>억양 및 리듬</li>
                    </ul>
                </div>
            `
        },
        'text-to-video': {
            title: '🎬 Text-to-Video ELO 점수란?',
            content: `
                <p class="leading-relaxed">
                    <strong class="text-blue-600 dark:text-blue-400">ELO 점수</strong>는
                    텍스트 설명으로 비디오를 생성하는 AI 모델의 성능을 측정하는 지표입니다.
                </p>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 ELO 시스템이란?</h4>
                    <p class="text-sm mb-2">
                        모델 간 직접 비교를 통한 상대 평가 시스템입니다.
                    </p>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>1200+ : 최고 수준의 비디오 품질</li>
                        <li>1000-1200 : 평균 이상</li>
                        <li>1000 미만 : 평균 이하</li>
                    </ul>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">🎯 평가 방법</h4>
                    <p class="text-sm">
                        동일한 프롬프트로 생성된 비디오들을 비교하여 더 우수한 결과를 선택합니다.
                    </p>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-green-900 dark:text-green-300">💡 평가 기준</h4>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>영상 품질 및 해상도</li>
                        <li>움직임의 자연스러움</li>
                        <li>프롬프트 충실도</li>
                        <li>일관성 및 연속성</li>
                    </ul>
                </div>
            `
        },
        'image-to-video': {
            title: '🎞️ Image-to-Video ELO 점수란?',
            content: `
                <p class="leading-relaxed">
                    <strong class="text-blue-600 dark:text-blue-400">ELO 점수</strong>는
                    정지 이미지를 동영상으로 변환하는 AI 모델의 성능을 측정하는 지표입니다.
                </p>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 ELO 시스템이란?</h4>
                    <p class="text-sm mb-2">
                        실제 대결 결과를 기반으로 한 상대 평가 시스템입니다.
                    </p>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>1300+ : 탁월한 애니메이션 품질</li>
                        <li>1000-1300 : 평균 이상</li>
                        <li>1000 미만 : 평균 이하</li>
                    </ul>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">🎯 평가 방법</h4>
                    <p class="text-sm">
                        같은 이미지로 생성된 영상들을 비교하여 더 자연스럽고 품질 좋은 결과를 선택합니다.
                    </p>
                </div>
                <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 class="font-semibold mb-2 text-green-900 dark:text-green-300">💡 평가 기준</h4>
                    <ul class="text-sm space-y-1 list-disc list-inside">
                        <li>움직임의 자연스러움</li>
                        <li>원본 이미지 충실도</li>
                        <li>시간적 일관성</li>
                        <li>물리 법칙 준수</li>
                    </ul>
                </div>
            `
        }
    };

    const scoreInfoEn = {
        overall: `
            <p class="leading-relaxed"><strong class="text-blue-600 dark:text-blue-400">Artificial Analysis Intelligence Index</strong> measures language model capabilities across reasoning, knowledge, math, and programming.</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 Scoring</h4><p class="text-sm">Scored on a <strong>0–100 scale</strong>, combining 10 benchmark tests.</p></div>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📋 Benchmarks</h4><p class="text-sm">GDPval-AA, τ²-Bench Telecom, Terminal-Bench Hard, SciCode, AA-LCR, AA-Omniscience, IFBench, Humanity's Last Exam, GPQA Diamond, CritPt</p></div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3"><div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3"><div class="text-sm font-semibold mb-1">✅ Reliability</div><div class="text-xs">95% confidence interval &lt;±1%</div></div><div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3"><div class="text-sm font-semibold mb-1">🌐 Scope</div><div class="text-xs">Text-only, English evaluation</div></div></div>
            <p class="text-sm text-gray-600 dark:text-gray-400 italic">※ Like all metrics, this has limitations and may not apply to every use case.</p>`,
        coding: `
            <p class="leading-relaxed"><strong class="text-blue-600 dark:text-blue-400">Coding Index</strong> evaluates the ability of language models to perform programming tasks.</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 Scoring</h4><p class="text-sm mb-2">Scored on a <strong>0–100 scale</strong>.</p><ul class="text-sm space-y-1 list-disc list-inside"><li>70+: Advanced programming</li><li>50–70: Intermediate</li><li>&lt;50: Basic</li></ul></div>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">🎯 Tasks</h4><ul class="text-sm space-y-1 list-disc list-inside"><li>Code generation &amp; completion</li><li>Bug fixing &amp; debugging</li><li>Algorithm implementation</li><li>Code refactoring</li></ul></div>`,
        math: `
            <p class="leading-relaxed"><strong class="text-blue-600 dark:text-blue-400">Math Index</strong> evaluates mathematical problem-solving capabilities.</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 Scoring</h4><p class="text-sm mb-2">Scored on a <strong>0–100 scale</strong>.</p><ul class="text-sm space-y-1 list-disc list-inside"><li>70+: Advanced math</li><li>50–70: Intermediate</li><li>&lt;50: Basic</li></ul></div>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">🎯 Topics</h4><ul class="text-sm space-y-1 list-disc list-inside"><li>Algebra &amp; Geometry</li><li>Calculus &amp; Probability</li><li>Logical reasoning</li><li>Complex calculations</li></ul></div>`,
        value: `
            <p class="leading-relaxed"><strong class="text-blue-600 dark:text-blue-400">Value for Money</strong> measures cost-efficiency relative to performance.</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 Formula</h4><p class="text-sm mb-2"><strong>Value = Intelligence Index / Price</strong></p><p class="text-sm">Unit: <strong>pts/$</strong> (performance per dollar)</p></div>
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-green-900 dark:text-green-300">💡 Interpretation</h4><ul class="text-sm space-y-1 list-disc list-inside"><li>Higher = better value</li><li>Same price → prefer higher performance</li><li>Same performance → prefer lower price</li></ul></div>
            <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-yellow-900 dark:text-yellow-300">⚠️ Note</h4><p class="text-sm">Price based on blended 1M token cost (input:output = 3:1).</p></div>`,
        speed: `
            <p class="leading-relaxed"><strong class="text-blue-600 dark:text-blue-400">Speed</strong> is the number of tokens (word fragments) the model generates per second.</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 Unit</h4><p class="text-sm mb-2"><strong>tok/s</strong> (tokens per second)</p><ul class="text-sm space-y-1 list-disc list-inside"><li>100+ tok/s: Very fast</li><li>50–100 tok/s: Fast</li><li>&lt;50 tok/s: Average</li></ul></div>
            <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-yellow-900 dark:text-yellow-300">⚠️ Note</h4><p class="text-sm">Measured as median output tokens per second.</p></div>`,
        'text-to-image': `
            <p class="leading-relaxed"><strong class="text-blue-600 dark:text-blue-400">ELO Score</strong> measures the performance of text-to-image AI models via head-to-head comparisons.</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 ELO System</h4><p class="text-sm mb-2">A <strong>relative rating system</strong> derived from chess rankings.</p><ul class="text-sm space-y-1 list-disc list-inside"><li>1200+: Excellent</li><li>1000–1200: Above average</li><li>&lt;1000: Below average</li></ul></div>
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-green-900 dark:text-green-300">💡 Criteria</h4><ul class="text-sm space-y-1 list-disc list-inside"><li>Image quality &amp; realism</li><li>Prompt adherence</li><li>Detail &amp; creativity</li></ul></div>`,
        'text-to-speech': `
            <p class="leading-relaxed"><strong class="text-blue-600 dark:text-blue-400">ELO Score</strong> measures the performance of text-to-speech AI models via head-to-head comparisons.</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 ELO System</h4><ul class="text-sm space-y-1 list-disc list-inside"><li>1100+: Excellent</li><li>1000–1100: Above average</li><li>&lt;1000: Below average</li></ul></div>
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-green-900 dark:text-green-300">💡 Criteria</h4><ul class="text-sm space-y-1 list-disc list-inside"><li>Naturalness</li><li>Pronunciation accuracy</li><li>Intonation &amp; rhythm</li></ul></div>`,
        'text-to-video': `
            <p class="leading-relaxed"><strong class="text-blue-600 dark:text-blue-400">ELO Score</strong> measures performance of text-to-video AI models via head-to-head comparisons.</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 ELO System</h4><ul class="text-sm space-y-1 list-disc list-inside"><li>1200+: Excellent</li><li>1000–1200: Above average</li><li>&lt;1000: Below average</li></ul></div>
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-green-900 dark:text-green-300">💡 Criteria</h4><ul class="text-sm space-y-1 list-disc list-inside"><li>Video quality</li><li>Motion naturalness</li><li>Prompt fidelity</li></ul></div>`,
        'image-to-video': `
            <p class="leading-relaxed"><strong class="text-blue-600 dark:text-blue-400">ELO Score</strong> measures performance of image-to-video AI models via head-to-head comparisons.</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-blue-900 dark:text-blue-300">📊 ELO System</h4><ul class="text-sm space-y-1 list-disc list-inside"><li>1300+: Exceptional</li><li>1000–1300: Above average</li><li>&lt;1000: Below average</li></ul></div>
            <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4"><h4 class="font-semibold mb-2 text-green-900 dark:text-green-300">💡 Criteria</h4><ul class="text-sm space-y-1 list-disc list-inside"><li>Motion naturalness</li><li>Source image fidelity</li><li>Temporal consistency</li></ul></div>`,
    };

    titleEl.textContent = t('scoreInfoTitle', filterType);
    if (currentLang === 'en') {
        contentEl.innerHTML = scoreInfoEn[filterType] || scoreInfoEn.overall;
    } else {
        const info = scoreInfo[filterType] || scoreInfo.overall;
        contentEl.innerHTML = info.content;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeInfoModal() {
    const modal = document.getElementById('info-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const infoModal = document.getElementById('info-modal');
    if (e.target === infoModal) {
        closeInfoModal();
    }
    const compModal = document.getElementById('comparison-modal');
    if (e.target === compModal) {
        closeComparisonModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeInfoModal();
        closeComparisonModal();
    }
});

// ─────────────────────────────────────────────
// Comparison Feature
// ─────────────────────────────────────────────

function toggleCompareModel(modelId) {
    const existingIndex = selectedForComparison.findIndex(m => m.id === modelId);

    if (existingIndex !== -1) {
        selectedForComparison.splice(existingIndex, 1);
    } else {
        if (selectedForComparison.length >= 4) {
            showToast(t('maxCompare'));
            return;
        }
        const data = allData[currentCategory] || [];
        const model = data.find(item => {
            const id = item.id || item.slug || item.name;
            return id === modelId;
        });
        if (model) {
            selectedForComparison.push({
                id: modelId,
                name: model.name || model.model_name || 'Unknown',
                category: currentCategory,
                data: model
            });
        }
    }

    const btn = document.getElementById(`cmp-btn-${modelId}`);
    if (btn) {
        const isSelected = selectedForComparison.some(m => m.id === modelId);
        updateCompareButton(btn, isSelected);
    }
    updateComparisonBar();
}

function removeFromComparison(modelId) {
    selectedForComparison = selectedForComparison.filter(m => m.id !== modelId);
    const btn = document.getElementById(`cmp-btn-${modelId}`);
    if (btn) updateCompareButton(btn, false);
    updateComparisonBar();
}

function clearComparison() {
    selectedForComparison.forEach(model => {
        const btn = document.getElementById(`cmp-btn-${model.id}`);
        if (btn) updateCompareButton(btn, false);
    });
    selectedForComparison = [];
    updateComparisonBar();
}

function updateCompareButton(btn, isSelected) {
    if (isSelected) {
        btn.textContent = t('btnSelected');
        btn.className = 'bg-blue-500 text-white border-blue-500 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap';
    } else {
        btn.textContent = t('btnCompare');
        btn.className = 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap';
    }
}

function updateComparisonBar() {
    const bar = document.getElementById('comparison-bar');
    const chips = document.getElementById('comparison-chips');
    const countEl = document.getElementById('compare-count');
    const compareBtn = document.getElementById('compare-btn');
    if (!bar || !chips || !countEl || !compareBtn) return;

    if (selectedForComparison.length === 0) {
        bar.classList.add('hidden');
        document.body.style.paddingBottom = '';
        return;
    }

    bar.classList.remove('hidden');
    document.body.style.paddingBottom = '68px';
    countEl.textContent = selectedForComparison.length;
    compareBtn.disabled = selectedForComparison.length < 2;

    const modelColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    chips.innerHTML = selectedForComparison.map((model, i) => `
        <div class="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border"
             style="background-color: ${modelColors[i]}22; border-color: ${modelColors[i]}66; color: ${modelColors[i]};">
            <span class="truncate max-w-[120px]">${model.name}</span>
            <button onclick="removeFromComparison('${model.id}')" class="hover:opacity-70 transition-opacity flex-shrink-0" title="${t('remove')}">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    `).join('');
}

function openComparisonModal() {
    if (selectedForComparison.length < 2) return;
    renderComparisonContent();
    const modal = document.getElementById('comparison-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeComparisonModal() {
    const modal = document.getElementById('comparison-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
    if (comparisonChart) {
        comparisonChart.destroy();
        comparisonChart = null;
    }
}

function renderComparisonContent() {
    const category = selectedForComparison[0]?.category;
    if (category === 'llm') {
        renderLLMComparison();
    } else {
        renderMediaComparison();
    }
}

function renderLLMComparison() {
    const models = selectedForComparison;
    const allLLMs = allData.llm || [];
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    // Max values for normalization (relative to all LLMs in dataset)
    const maxIntelligence = Math.max(...allLLMs.map(m => m.evaluations?.artificial_analysis_intelligence_index || 0));
    const maxCoding = Math.max(...allLLMs.map(m => m.evaluations?.artificial_analysis_coding_index || 0));
    const maxMath = Math.max(...allLLMs.map(m => m.evaluations?.artificial_analysis_math_index || 0));
    const maxSpeed = Math.max(...allLLMs.map(m => m.pricing?.median_output_tokens_per_second || 0));
    const maxValue = Math.max(...allLLMs.map(m => {
        const perf = m.evaluations?.artificial_analysis_intelligence_index;
        const price = m.pricing?.price_1m_blended_3_to_1;
        return (perf && price && price > 0) ? perf / price : 0;
    }));

    const normalize = (val, max) => (max > 0 && val != null) ? Math.round((val / max) * 100) : 0;

    const datasets = models.map((model, i) => {
        const item = model.data;
        const intelligence = item.evaluations?.artificial_analysis_intelligence_index || 0;
        const coding = item.evaluations?.artificial_analysis_coding_index || 0;
        const math = item.evaluations?.artificial_analysis_math_index || 0;
        const speed = item.pricing?.median_output_tokens_per_second || 0;
        const price = item.pricing?.price_1m_blended_3_to_1;
        const valueRatio = (intelligence && price && price > 0) ? intelligence / price : 0;

        return {
            label: model.name,
            data: [
                normalize(intelligence, maxIntelligence),
                normalize(coding, maxCoding),
                normalize(math, maxMath),
                normalize(speed, maxSpeed),
                normalize(valueRatio, maxValue),
            ],
            borderColor: colors[i],
            backgroundColor: colors[i] + '33',
            borderWidth: 2,
            pointBackgroundColor: colors[i],
            pointRadius: 4,
        };
    });

    // Metrics for the detail table
    const metrics = [
        {
            label: t('metricIntelligence'), unit: t('unitScore'),
            getValue: item => item.evaluations?.artificial_analysis_intelligence_index,
            format: v => v != null ? v.toFixed(1) : '-',
            higherIsBetter: true,
        },
        {
            label: t('metricCoding'), unit: t('unitScore'),
            getValue: item => item.evaluations?.artificial_analysis_coding_index,
            format: v => v != null ? v.toFixed(1) : '-',
            higherIsBetter: true,
        },
        {
            label: t('metricMath'), unit: t('unitScore'),
            getValue: item => item.evaluations?.artificial_analysis_math_index,
            format: v => v != null ? v.toFixed(1) : '-',
            higherIsBetter: true,
        },
        {
            label: t('metricSpeed'), unit: 'tok/s',
            getValue: item => item.pricing?.median_output_tokens_per_second,
            format: v => v != null ? Math.round(v).toLocaleString() : '-',
            higherIsBetter: true,
        },
        {
            label: t('metricInputPrice'), unit: '/1M tok',
            getValue: item => item.pricing?.price_1m_input_tokens,
            format: v => v != null ? `$${v.toFixed(2)}` : '-',
            higherIsBetter: false,
        },
        {
            label: t('metricOutputPrice'), unit: '/1M tok',
            getValue: item => item.pricing?.price_1m_output_tokens,
            format: v => v != null ? `$${v.toFixed(2)}` : '-',
            higherIsBetter: false,
        },
        {
            label: t('metricValue'), unit: t('unitValueScore'),
            getValue: item => {
                const perf = item.evaluations?.artificial_analysis_intelligence_index;
                const price = item.pricing?.price_1m_blended_3_to_1;
                return (perf && price && price > 0) ? perf / price : null;
            },
            format: v => v != null ? v.toFixed(1) : '-',
            higherIsBetter: true,
        },
    ];

    const tableRows = metrics.map(metric => {
        const values = models.map(m => metric.getValue(m.data));
        const numericVals = values.filter(v => v != null);
        const bestVal = numericVals.length
            ? (metric.higherIsBetter ? Math.max(...numericVals) : Math.min(...numericVals))
            : null;

        const cells = values.map((v, i) => {
            const isBest = bestVal != null && v === bestVal && numericVals.length > 1;
            return `
                <td class="py-3 px-4 text-center ${isBest ? 'bg-blue-50 dark:bg-blue-900/20' : ''}">
                    <span class="font-bold ${isBest ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}">
                        ${metric.format(v)}
                    </span>
                    ${isBest ? '<span class="ml-1 text-xs">🏆</span>' : ''}
                </td>`;
        }).join('');

        return `
            <tr class="border-b border-gray-100 dark:border-gray-800">
                <td class="py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 whitespace-nowrap">
                    ${metric.label}
                    <div class="text-xs text-gray-400 dark:text-gray-500">${metric.unit}</div>
                </td>
                ${cells}
            </tr>`;
    }).join('');

    const modelHeaders = models.map((m, i) =>
        `<th class="text-center py-3 px-4 font-semibold text-sm" style="color:${colors[i]}">${m.name}</th>`
    ).join('');

    const contentEl = document.getElementById('comparison-content');
    contentEl.innerHTML = `
        <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">
                ${t('comparingModels', models.length)}
            </p>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 mb-6">
                <h3 class="text-base font-bold mb-4 text-gray-900 dark:text-gray-100">${t('compareChartTitle')}</h3>
                <div class="relative mx-auto" style="height:300px; max-width:480px;">
                    <canvas id="comparison-chart-canvas"></canvas>
                </div>
            </div>
            <h3 class="text-base font-bold mb-3 text-gray-900 dark:text-gray-100">${t('compareDetailTitle')}</h3>
            <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-gray-700">
                            <th class="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50">${t('compareIndicator')}</th>
                            ${modelHeaders}
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        </div>`;

    setTimeout(() => {
        const canvas = document.getElementById('comparison-chart-canvas');
        if (!canvas || typeof Chart === 'undefined') return;
        if (comparisonChart) { comparisonChart.destroy(); comparisonChart = null; }

        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        const labelColor = isDark ? '#9CA3AF' : '#6B7280';

        comparisonChart = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: [t('chartIntelligence'), t('chartCoding'), t('chartMath'), t('chartSpeed'), t('chartValue')],
                datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 0, max: 100,
                        ticks: { stepSize: 25, color: labelColor, backdropColor: 'transparent', font: { size: 10 } },
                        grid: { color: gridColor },
                        angleLines: { color: gridColor },
                        pointLabels: { color: labelColor, font: { size: 12, weight: '600' } },
                    },
                },
                plugins: {
                    legend: { position: 'bottom', labels: { color: labelColor, padding: 16, font: { size: 12 } } },
                    tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw}%` } },
                },
            },
        });
    }, 50);
}

function renderMediaComparison() {
    const models = selectedForComparison;
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    const category = models[0]?.category;
    const categoryNames = {
        'text-to-image': 'Text-to-Image',
        'text-to-speech': 'Text-to-Speech',
        'text-to-video': 'Text-to-Video',
        'image-to-video': 'Image-to-Video',
    };

    const allCategoryData = allData[category] || [];
    const rankMap = {};
    allCategoryData
        .filter(item => item.elo != null)
        .sort((a, b) => (b.elo || 0) - (a.elo || 0))
        .forEach((item, idx) => {
            rankMap[item.id || item.slug || item.name] = idx + 1;
        });

    const metrics = [
        {
            label: t('metricRank'),
            getValue: item => rankMap[item.id || item.slug || item.name],
            format: v => v != null ? `${v}${t('rankSuffix')}` : '-',
            higherIsBetter: false,
        },
        {
            label: t('metricElo'),
            getValue: item => item.elo,
            format: v => v != null ? Math.round(v).toLocaleString() : '-',
            higherIsBetter: true,
        },
        {
            label: t('metricEvalCount'),
            getValue: item => item.appearances,
            format: v => v != null ? v.toLocaleString() : '-',
            higherIsBetter: true,
        },
        {
            label: t('metricReleaseDate'),
            getValue: item => item.release_date,
            format: v => v ? new Date(v).toLocaleDateString(t('dateLocale')) : '-',
            higherIsBetter: null,
        },
    ];

    const tableRows = metrics.map(metric => {
        const values = models.map(m => metric.getValue(m.data));
        const numericVals = values.filter(v => v != null && typeof v === 'number');
        const bestVal = metric.higherIsBetter == null || numericVals.length === 0
            ? null
            : (metric.higherIsBetter ? Math.max(...numericVals) : Math.min(...numericVals));

        const cells = values.map((v, i) => {
            const isBest = bestVal != null && v === bestVal && numericVals.length > 1;
            return `
                <td class="py-3 px-4 text-center ${isBest ? 'bg-blue-50 dark:bg-blue-900/20' : ''}">
                    <span class="font-bold ${isBest ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}">
                        ${metric.format(v)}
                    </span>
                    ${isBest ? '<span class="ml-1 text-xs">🏆</span>' : ''}
                </td>`;
        }).join('');

        return `
            <tr class="border-b border-gray-100 dark:border-gray-800">
                <td class="py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 whitespace-nowrap">
                    ${metric.label}
                </td>
                ${cells}
            </tr>`;
    }).join('');

    const modelHeaders = models.map((m, i) =>
        `<th class="text-center py-3 px-4 font-semibold text-sm" style="color:${colors[i]}">${m.name}</th>`
    ).join('');

    const chartHeight = Math.max(160, models.length * 64);
    const contentEl = document.getElementById('comparison-content');
    contentEl.innerHTML = `
        <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">
                ${t('mediaComparing', categoryNames[category] || category, models.length)}
            </p>
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 mb-6">
                <h3 class="text-base font-bold mb-4 text-gray-900 dark:text-gray-100">${t('eloCompareTitle')}</h3>
                <div class="relative" style="height:${chartHeight}px;">
                    <canvas id="comparison-chart-canvas"></canvas>
                </div>
            </div>
            <h3 class="text-base font-bold mb-3 text-gray-900 dark:text-gray-100">${t('detailCompareTitle')}</h3>
            <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-gray-700">
                            <th class="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50">${t('compareIndicator')}</th>
                            ${modelHeaders}
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        </div>`;

    setTimeout(() => {
        const canvas = document.getElementById('comparison-chart-canvas');
        if (!canvas || typeof Chart === 'undefined') return;
        if (comparisonChart) { comparisonChart.destroy(); comparisonChart = null; }

        const isDark = document.documentElement.classList.contains('dark');
        const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        const labelColor = isDark ? '#9CA3AF' : '#6B7280';

        comparisonChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: models.map(m => m.name),
                datasets: [{
                    label: t('metricElo'),
                    data: models.map(m => m.data.elo ? Math.round(m.data.elo) : 0),
                    backgroundColor: models.map((_, i) => colors[i] + 'CC'),
                    borderColor: models.map((_, i) => colors[i]),
                    borderWidth: 2,
                    borderRadius: 6,
                }],
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: labelColor } },
                    y: { grid: { color: gridColor }, ticks: { color: labelColor, font: { size: 11 } } },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: ctx => `ELO: ${ctx.raw.toLocaleString()}` } },
                },
            },
        });
    }, 50);
}

function showToast(message) {
    const existing = document.getElementById('toast-notification');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-[60]';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}


// ── AI World Adoption Modal ──
function openAdoptionModal() {
    const modal = document.getElementById('adoption-modal');
    const iframe = document.getElementById('adoption-iframe');
    if (!modal || !iframe) return;
    if (!iframe.getAttribute('src')) {
        iframe.src = 'ai-adoption-world-map.html';
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeAdoptionModal() {
    const modal = document.getElementById('adoption-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const adoptionModal = document.getElementById('adoption-modal');
        if (adoptionModal && !adoptionModal.classList.contains('hidden')) {
            closeAdoptionModal();
        }
    }
});
