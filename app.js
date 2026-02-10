// Global state
let currentCategory = 'llm';
let currentFilter = 'overall';
let allData = {};
let koreanCompanies = [];

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    initEventListeners();
    await loadData();
});

// Theme handling
function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
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

// Load all data
async function loadData() {
    try {
        // Load Korean companies list
        const koreanResponse = await fetch('data/korean-companies.json');
        const koreanData = await koreanResponse.json();
        koreanCompanies = koreanData.companies;

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

        // Update stats
        updateStats();

        // Update last updated time
        if (lastUpdated.last_updated !== 'N/A') {
            const date = new Date(lastUpdated.last_updated);
            document.getElementById('last-updated').textContent = date.toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
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

// Update statistics
function updateStats() {
    const totalCount = Object.values(allData).reduce((sum, arr) => sum + arr.length, 0);
    document.getElementById('total-models').textContent = totalCount;

    const koreanCount = Object.values(allData).reduce((sum, arr) => {
        return sum + arr.filter(item => isKoreanCompany(item)).length;
    }, 0);
    document.getElementById('korean-models').textContent = koreanCount;
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

    // Show/hide LLM filters
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
            sortLabel = '종합 점수';
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
            <h2 class="text-2xl font-bold mb-6">🏆 ${sortLabel} 순위</h2>
            <div class="space-y-3">
                ${sortedData.map((item, index) => {
                    const rank = index + 1;
                    const isKorean = isKoreanCompany(item);
                    const score = getValue(item, sortField);
                    const medal = getMedalEmoji(rank);
                    const provider = item.model_creator?.name || item.provider || item.company || '-';

                    return `
                        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div class="flex items-center gap-4 flex-1">
                                <div class="text-2xl font-bold text-gray-400 dark:text-gray-500 w-8">
                                    ${rank}
                                </div>
                                ${medal ? `<div class="text-3xl">${medal}</div>` : '<div class="w-8"></div>'}
                                <div class="flex-1">
                                    <div class="font-semibold text-lg">
                                        ${item.name || item.model_name || 'Unknown'}
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

    return `
        <div class="p-6">
            <h2 class="text-2xl font-bold mb-6">🏆 ${categoryNames[currentCategory]} 순위</h2>
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

                            return `
                                <tr class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td class="py-4 px-4">
                                        <div class="flex items-center gap-2">
                                            <span class="font-bold text-gray-600 dark:text-gray-400">${rank}</span>
                                            ${medal ? `<span class="text-xl">${medal}</span>` : ''}
                                        </div>
                                    </td>
                                    <td class="py-4 px-4">
                                        <div class="font-semibold">
                                            ${item.name || item.model_name || 'Unknown'}
                                            ${isKorean ? '<span class="ml-2">🇰🇷</span>' : ''}
                                        </div>
                                    </td>
                                    <td class="py-4 px-4 text-gray-600 dark:text-gray-400">
                                        ${item.company || item.provider || '-'}
                                    </td>
                                    <td class="py-4 px-4 text-right">
                                        <span class="font-bold text-blue-600 dark:text-blue-400 text-lg">
                                            ${item.elo ? Math.round(item.elo) : '-'}
                                        </span>
                                    </td>
                                    <td class="py-4 px-4 text-right text-gray-600 dark:text-gray-400">
                                        ${item.num_ratings || item.evaluations || '-'}
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
