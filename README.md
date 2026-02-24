# AINET AI RANK HUB

AI 모델들의 성능을 종합적으로 분석·비교하는 대시보드. GitHub Pages로 호스팅되며 매일 자동 업데이트됩니다.

---

## 파일 구조

```
ai-index/
├── index.html          # 메인 HTML (348줄) — 탭/카테고리 UI, data-i18n 속성 포함
├── app.js              # 전체 로직 (2192줄) — 상태관리·렌더·비교·번역 모두 포함
├── styles.css          # 추가 스타일 (233줄) — Tailwind 보완용 커스텀 CSS
├── data/
│   ├── llms.json             # LLM 모델 데이터 (Artificial Analysis API)
│   ├── text-to-image.json    # 이미지 생성 모델
│   ├── text-to-speech.json   # 음성 생성 모델
│   ├── text-to-video.json    # 영상 생성 모델
│   ├── image-to-video.json   # 이미지→영상 모델
│   ├── korean-companies.json # 한국 회사 ID 목록
│   ├── ai-news.json          # 수집된 뉴스 (scripts/fetch-news.js 생성)
│   ├── last-updated.json     # 마지막 데이터 업데이트 타임스탬프
│   └── history/              # 전일 데이터 (순위 변동 계산용)
└── scripts/
    ├── fetch-news.js   # AI 뉴스 수집 스크립트
    ├── package.json
    └── README.md
```

---

## app.js 핵심 구조

### 전역 상태 변수 (app.js:1~18)
```js
currentCategory   // 'llm' | 'image' | 'speech' | 'video' | 'image-video' | 'korean'
currentFilter     // 'overall' | 'coding' | 'math' | 'value' | 'speed'
allData           // { llm, image, speech, video, imageVideo }
yesterdayData     // 전일 데이터 (순위 변동 계산용)
rankingChanges    // 모델별 순위 변동
modelCountChanges // 카테고리별 모델 수 변동
koreanCompanies   // 한국 회사 ID 배열
selectedForComparison // 비교 선택된 모델 ID 배열 (최대 3개)
currentLang       // 'ko' | 'en' (localStorage 저장)
```

### 번역 시스템 (app.js:20~226)
- `translations` 객체: `ko` / `en` 키로 구성
- `t(key, ...args)` (app.js:227): 번역 문자열 반환, 함수형 값 지원
- `applyTranslations()` (app.js:236): `[data-i18n]` 속성 기반 DOM 자동 갱신
- `toggleLanguage()` (app.js:310): 언어 전환 + localStorage 저장
- `initLang()` (app.js:288): 초기 언어 적용

### 데이터 로딩 (app.js:498~)
- `loadData()` (app.js:498): 모든 JSON 파일 병렬 fetch
- `loadYesterdayDataAndCalculateChanges()` (app.js:557): history/ 폴더에서 전일 데이터 로드
- `calculateModelCountChanges()` (app.js:598): 카테고리별 모델 수 변동
- `calculateRankingChanges()` (app.js:615): 모델별 순위 변동 계산

### 렌더링 (app.js:874~)
- `renderContent()` (app.js:874): currentCategory에 따라 렌더 분기
- `renderLLMContent()` (app.js:887): LLM 탭 렌더 (currentFilter 적용)
- `renderMediaContent()` (app.js:1054): 미디어 카테고리 렌더
- `renderKoreanServicesContent()` (app.js:1183): 한국 서비스 탭 렌더
- `getModelUrl(category, item)` (app.js:1045): 모델별 외부 링크 URL 생성
- `isKoreanCompany(item)` (app.js:824): korean-companies.json ID 기반 판별

### 뉴스 (app.js:366~497)
- `loadNews()` (app.js:366): ai-news.json fetch + 뉴스 티커·카드 렌더
- `renderNewsTicker(newsItems)` (app.js:402): 상단 스크롤 티커
- `renderNewsCards(newsItems)` (app.js:444): 카드 목록 렌더
- `toggleNewsExpand()` (app.js:471): 뉴스 섹션 펼치기/접기
  - "뉴스 읽기" 히어로 버튼 클릭 시 → 섹션 스크롤 후 자동 펼치기

### 모델 비교 기능 (app.js:1726~2178)
- `toggleCompareModel(modelId)` (app.js:1726): 비교 선택 토글
- `updateComparisonBar()` (app.js:1785): 하단 고정 비교바 업데이트
- `openComparisonModal()` (app.js:1817): 비교 모달 열기
- `renderComparisonContent()` (app.js:1838): LLM or 미디어 비교 분기
- `renderLLMComparison()` (app.js:1847): LLM 레이더 차트 + 수치 테이블
- `renderMediaComparison()` (app.js:2035): 미디어 모델 바 차트 비교
- 최대 3개 선택, Chart.js 사용

### 통계 & UI (app.js:762~)
- `updateStats()` (app.js:762): 히어로 섹션 통계 카운터 업데이트
- `animateCounter(el, target)` (app.js:745): 숫자 애니메이션
- `switchCategory(category)` (app.js:834): 카테고리 탭 전환
- `switchLLMFilter(filter)` (app.js:856): LLM 서브필터 전환
- `showScoreInfoModal(filterType)` (app.js:1332): 점수 설명 모달
- `showToast(message)` (app.js:2179): 토스트 알림

### 테마 (app.js:327~)
- `initTheme()` (app.js:327): localStorage 기반 다크/라이트 초기화
- 토글 버튼 id: `theme-toggle`

---

## 데이터 형식

### llms.json (핵심 필드)
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "모델명",
      "slug": "model-slug",
      "release_date": "YYYY-MM-DD",
      "model_creator": { "id": "uuid", "name": "회사명", "slug": "slug" },
      "evaluations": {
        "artificial_analysis_intelligence_index": 85.2,
        "artificial_analysis_coding_index": 80.1,
        "artificial_analysis_math_index": 90.3
      },
      "pricing": {
        "price_1m_blended_3_to_1": 0.5,
        "price_1m_input_tokens": 0.3,
        "price_1m_output_tokens": 1.2
      },
      "median_output_tokens_per_second": 120.5
    }
  ]
}
```

### ai-news.json
```json
{
  "last_updated": "2026-02-24T09:00:00Z",
  "news": [
    { "title": "제목", "url": "https://...", "source": "언론사명", "date": "ISO8601" }
  ]
}
```

### korean-companies.json
```json
["uuid1", "uuid2", ...]
```

### last-updated.json
```json
{ "last_updated": "2026-02-24T03:15:00Z" }
```

---

## 주요 기능 목록

| 기능 | 구현 위치 | 비고 |
|------|-----------|------|
| 다국어 (한/영) | app.js:20~319 | `data-i18n` 속성, localStorage 저장 |
| 카테고리 탭 | app.js:834~887 | llm / image / speech / video / image-video / korean |
| LLM 서브필터 | app.js:856~873 | overall / coding / math / value / speed |
| 가성비 필터 | app.js:887~ | 최소 점수 30 기준 (`valueScore >= 30`) |
| 모델 비교 모달 | app.js:1726~2178 | 최대 3개, Chart.js 레이더/바 차트 |
| 뉴스 티커 | app.js:402~443 | CSS 자동 스크롤 |
| 뉴스 자동 펼치기 | app.js:471~497 | 히어로 "뉴스 읽기" 버튼 → 스크롤 + expand |
| 순위 변동 표시 | app.js:557~714 | ▲▼ 아이콘, history/ 폴더 비교 |
| 한국 서비스 탭 | app.js:1183~1330 | korean-companies.json ID 매칭 |
| 다크모드 | app.js:327~340 | localStorage 저장 |
| 통계 카운터 | app.js:762~823 | 모델 수, 기업 수 애니메이션 |

---

## 자동화 (GitHub Actions)

- **데이터 업데이트**: 매일 09:00 KST (00:00 UTC) — Artificial Analysis API fetch
- **뉴스 업데이트**: 매일 09:00 KST — Google News RSS 수집 (`scripts/fetch-news.js`)

---

## 로컬 개발

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

뉴스 스크립트 단독 실행:
```bash
cd scripts && npm install && node fetch-news.js
```

---

## 최근 변경 이력

| PR | 내용 |
|----|------|
| #19 | 뉴스 읽기 버튼 클릭 시 뉴스 섹션 자동 펼치기 |
| #18 | 탭 클릭 `e.target→e.currentTarget` 수정, 가성비 최소점수 30 기준 추가 |
| #17 | HTML에 `data-i18n` 속성 적용 및 언어 토글 버튼 추가 |
| #16 | 모델 비교 기능 구현 (모달, Chart.js) |
| #15 | 회사 수 중복 제거 (`model_creator.id` 기준) |
| #13 | 헤더 풀 히어로 섹션 리디자인 |
| #12 | 브랜드명 AINET AI RANK HUB로 변경, 리스트 30개 확대 |

---

## 기술 스택

- **Frontend**: Vanilla JS, HTML, Tailwind CSS
- **Charts**: Chart.js (모델 비교 모달)
- **Data**: Artificial Analysis API → GitHub Actions → JSON 파일
- **Hosting**: GitHub Pages
- **License**: MIT
