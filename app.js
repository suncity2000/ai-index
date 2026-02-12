// Global state
let currentCategory = 'llm';
let currentFilter = 'overall';
let allData = {};
let yesterdayData = {};
let rankingChanges = {};
let modelCountChanges = {};
let koreanCompanies = [];

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initEventListeners();
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

// Event listeners
function initEventListeners() {
    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            currentCategory = e.target.dataset.category;
            switchCategory(currentCategory);
        });
    });

    // LLM filter tabs
    document.querySelectorAll('.llm-filter-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            currentFilter = e.target.dataset.filter;
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
        const response = await fetch('data/ai-news.json');
        const data = await response.json();

        // Hide loading
        document.getElementById('news-loading').classList.add('hidden');

        // Update last updated time
        if (data.last_updated) {
            const date = new Date(data.last_updated);
            const formattedDate = date.toLocaleDateString('ko-KR', {
                month: 'numeric',
                day: 'numeric'
            });
            document.getElementById('news-last-updated').textContent = `업데이트: ${formattedDate}`;
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

// Load all data
async function loadData() {
    try {
        // Load Korean companies list
        const koreanResponse = await fetch('data/korean-companies.json');
        const koreanData = await koreanResponse.json();
        koreanCompanies = koreanData.companies;

        // Load AI news
        loadNews();

        // Load all API data
        const [llm, t2i, t2s, t2v, i2v, lastUpdated] = await Promise.all([
            fetch('data/llms.json').then(r => r.json()).catch(() => null),
            fetch('data/text-to-image.json').then(r => r.json()).catch(() => null),
            fetch('data/text-to-speech.json').then(r => r.json()).catch(() => null),
            fetch('data/text-to-video.json').then(r => r.json()).catch(() => null),
            fetch('data/image-to-video.json').then(r => r.json()).catch(() => null),
            fetch('data/last-updated.json').then(r => r.json()).catch(() => ({ last_updated: 'N/A' }))
        ]);

        allData = {
            llm: llm?.data || [],
            'text-to-image': t2i?.data || [],
            'text-to-speech': t2s?.data || [],
            'text-to-video': t2v?.data || [],
            'image-to-video': i2v?.data || []
        };

        // Load yesterday's data and calculate changes
        await loadYesterdayDataAndCalculateChanges();

        // Update stats
        updateStats();

        // Update last updated time
        if (lastUpdated.last_updated !== 'N/A') {
            const date = new Date(lastUpdated.last_updated);
            const formattedDate = date.toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            const shortDate = date.toLocaleString('ko-KR', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            document.getElementById('last-updated').textContent = formattedDate;
            document.getElementById('header-last-updated').textContent = shortDate;
        }

        // Show initial content
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('content').classList.remove('hidden');
        renderContent();

    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('loading').innerHTML = `
            <div class="p-12 text-center">
                <p class="text-red-500 text-lg font-medium">❌ 데이터를 불러올 수 없습니다</p>
                <p class="mt-2 text-gray-600 dark:text-gray-400">잠시 후 다시 시도해주세요.</p>
            </div>
        `;
    }
}

// Load yesterday's data and calculate ranking changes
async function loadYesterdayDataAndCalculateChanges() {
    try {
        // Calculate yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Try to load yesterday's data from history
        const [llm, t2i, t2s, t2v, i2v] = await Promise.all([
            fetch(`data/history/${yesterdayStr}-llms.json`).then(r => r.json()).catch(() => null),
            fetch(`data/history/${yesterdayStr}-text-to-image.json`).then(r => r.json()).catch(() => null),
            fetch(`data/history/${yesterdayStr}-text-to-speech.json`).then(r => r.json()).catch(() => null),
            fetch(`data/history/${yesterdayStr}-text-to-video.json`).then(r => r.json()).catch(() => null),
            fetch(`data/history/${yesterdayStr}-image-to-video.json`).then(r => r.json()).catch(() => null)
        ]);

        yesterdayData = {
            llm: llm?.data || [],
            'text-to-image': t2i?.data || [],
            'text-to-speech': t2s?.data || [],
            'text-to-video': t2v?.data || [],
            'image-to-video': i2v?.data || []
        };

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
                    isNew: true
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
                    isNew: true
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

// Switch category
function switchCategory(category) {
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
    } else {
        contentDiv.innerHTML = renderMediaContent();
    }
}

// Render LLM content
function renderLLMContent() {
    const data = allData.llm || [];
    if (data.length === 0) {
        return '<div class="p-12 text-center text-gray-500">데이터가 없습니다.</div>';
    }

    // Determine which field to sort by
    let sortField, sortLabel, sortOrder = 'desc', isValueRatio = false;
    switch (currentFilter) {
        case 'coding':
            sortField = 'artificial_analysis_coding_index';
            sortLabel = '코딩 점수';
            break;
        case 'math':
            sortField = 'artificial_analysis_math_index';
            sortLabel = '수학 점수';
            break;
        case 'value':
            sortField = 'value_ratio'; // Special calculated field
            sortLabel = '가성비 점수';
            isValueRatio = true;
            break;
        case 'speed':
            sortField = 'median_output_tokens_per_second';
            sortLabel = '속도';
            break;
        default:
            sortField = 'artificial_analysis_intelligence_index';
            sortLabel = '지능 지수';
    }

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
            return value !== null && value !== undefined;
        })
        .sort((a, b) => {
            const aVal = getValue(a, sortField) || 0;
            const bVal = getValue(b, sortField) || 0;
            return bVal - aVal; // Always descending (higher is better)
        })
        .slice(0, 20);

    const getMedalEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '';
    };

    return `
        <div class="p-6">
            <div class="flex items-center gap-2 mb-6">
                <h2 class="text-2xl font-bold">🏆 ${sortLabel} 순위</h2>
                <button onclick="showScoreInfoModal('${currentFilter}')" class="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-400 text-sm font-bold" title="${sortLabel} 설명">
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
                            rankingIndicator = `<span class="inline-flex items-center text-green-600 dark:text-green-400 text-sm font-bold ml-2" title="어제보다 ${changeInfo.change}계단 상승">↑${changeInfo.change}</span>`;
                        } else if (changeInfo.change < 0) {
                            rankingIndicator = `<span class="inline-flex items-center text-red-600 dark:text-red-400 text-sm font-bold ml-2" title="어제보다 ${Math.abs(changeInfo.change)}계단 하락">↓${Math.abs(changeInfo.change)}</span>`;
                        } else {
                            rankingIndicator = '<span class="inline-flex items-center text-gray-500 dark:text-gray-400 text-sm ml-2" title="순위 변동 없음">−</span>';
                        }
                    }

                    return `
                        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div class="flex items-center gap-4 flex-1">
                                <div class="flex items-center gap-1">
                                    <div class="text-2xl font-bold text-gray-400 dark:text-gray-500 w-8">
                                        ${rank}
                                    </div>
                                    ${rankingIndicator}
                                </div>
                                ${medal ? `<div class="text-3xl">${medal}</div>` : '<div class="w-8"></div>'}
                                <div class="flex-1">
                                    <div class="font-semibold text-lg">
                                        ${modelUrl ? `<a href="${modelUrl}" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">${item.name || item.model_name || 'Unknown'}</a>` : (item.name || item.model_name || 'Unknown')}
                                        ${isKorean ? '<span class="ml-2 text-xl">🇰🇷</span>' : ''}
                                    </div>
                                    <div class="text-sm text-gray-600 dark:text-gray-400">
                                        ${provider}
                                    </div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    ${score ? score.toFixed(currentFilter === 'value' ? 1 : currentFilter === 'speed' ? 0 : 1) : '-'}
                                </div>
                                <div class="text-xs text-gray-500 dark:text-gray-400">${currentFilter === 'value' ? '점/$' : currentFilter === 'speed' ? 'tok/s' : '점'}</div>
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
    // Only generate URLs for LLM category
    if (category === 'llm' && item && item.slug) {
        return `https://artificialanalysis.ai/models/${item.slug}`;
    }
    return null;
}

// Render media content (Text-to-Image, etc.)
function renderMediaContent() {
    const data = allData[currentCategory] || [];
    if (data.length === 0) {
        return '<div class="p-12 text-center text-gray-500">데이터가 없습니다.</div>';
    }

    // Sort by ELO score
    const sortedData = data
        .filter(item => item.elo !== null && item.elo !== undefined)
        .sort((a, b) => (b.elo || 0) - (a.elo || 0))
        .slice(0, 20);

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
                <h2 class="text-2xl font-bold">${categoryEmojis[currentCategory]} ${categoryNames[currentCategory]} 순위</h2>
                <button onclick="showScoreInfoModal('${currentCategory}')" class="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-gray-600 dark:text-gray-400 text-sm font-bold" title="ELO 점수 설명">
                    ?
                </button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-gray-700">
                            <th class="text-left py-3 px-4 font-semibold">순위</th>
                            <th class="text-left py-3 px-4 font-semibold">모델명</th>
                            <th class="text-left py-3 px-4 font-semibold">회사</th>
                            <th class="text-right py-3 px-4 font-semibold">ELO 점수</th>
                            <th class="text-right py-3 px-4 font-semibold">평가 횟수</th>
                            <th class="text-right py-3 px-4 font-semibold">출시일</th>
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
                                    rankingIndicator = `<span class="inline-flex items-center text-green-600 dark:text-green-400 text-sm font-bold ml-2" title="어제보다 ${changeInfo.change}계단 상승">↑${changeInfo.change}</span>`;
                                } else if (changeInfo.change < 0) {
                                    rankingIndicator = `<span class="inline-flex items-center text-red-600 dark:text-red-400 text-sm font-bold ml-2" title="어제보다 ${Math.abs(changeInfo.change)}계단 하락">↓${Math.abs(changeInfo.change)}</span>`;
                                } else {
                                    rankingIndicator = '<span class="inline-flex items-center text-gray-500 dark:text-gray-400 text-sm ml-2" title="순위 변동 없음">−</span>';
                                }
                            }

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
                                        ${item.release_date ? new Date(item.release_date).toLocaleDateString('ko-KR') : '-'}
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
        return '<div class="p-12 text-center text-gray-500">한국 서비스 데이터가 없습니다.</div>';
    }

    // Sort by rank within category
    koreanServices.sort((a, b) => a.rank - b.rank);

    return `
        <div class="p-6">
            <div class="flex items-center gap-2 mb-6">
                <h2 class="text-2xl font-bold">🇰🇷 한국 AI 서비스</h2>
                <span class="text-sm text-gray-500 dark:text-gray-400">(전체 ${koreanServices.length}개)</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200 dark:border-gray-700">
                            <th class="text-left py-3 px-4 font-semibold">분야</th>
                            <th class="text-left py-3 px-4 font-semibold">모델명</th>
                            <th class="text-left py-3 px-4 font-semibold">회사</th>
                            <th class="text-center py-3 px-4 font-semibold">순위</th>
                            <th class="text-right py-3 px-4 font-semibold">점수</th>
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
                    <strong>💡 순위 표시:</strong> 각 분야에서의 순위를 표시합니다.
                    <span class="inline-block px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs">1-3위</span>
                    <span class="inline-block px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs">4-10위</span>
                    <span class="inline-block px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">11위 이하</span>
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

    const info = scoreInfo[filterType] || scoreInfo.overall;
    titleEl.textContent = info.title;
    contentEl.innerHTML = info.content;

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
    const modal = document.getElementById('info-modal');
    if (e.target === modal) {
        closeInfoModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeInfoModal();
    }
});
