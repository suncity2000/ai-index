# AI News Fetcher

이 스크립트는 한국 언론사들로부터 최신 AI 뉴스를 자동으로 수집합니다.

## 뉴스 소스

- **Google News RSS**: 한국어 AI 뉴스 통합 검색
  - 인공지능, AI, ChatGPT, 딥러닝, 머신러닝 등의 키워드
  - 최근 7일간의 뉴스

## 작동 방식

1. GitHub Actions가 매일 오전 9시(UTC)에 자동 실행
2. 여러 뉴스 소스에서 최신 기사 수집
3. 중복 제거 및 날짜순 정렬
4. `data/ai-news.json` 파일 자동 업데이트
5. 변경사항 자동 커밋 및 푸시

## 수동 실행 방법

### 로컬에서 실행

```bash
cd scripts
npm install
node fetch-news.js
```

### GitHub Actions에서 수동 실행

1. GitHub 저장소의 **Actions** 탭으로 이동
2. **Update AI News** 워크플로우 선택
3. **Run workflow** 버튼 클릭

## 출력 형식

생성되는 `data/ai-news.json` 파일 구조:

```json
{
  "last_updated": "2025-02-11T09:00:00Z",
  "news": [
    {
      "title": "뉴스 제목",
      "url": "https://...",
      "source": "언론사명",
      "date": "2025-02-11T08:00:00Z"
    }
  ]
}
```

## 뉴스 소스 추가 방법

`fetch-news.js` 파일의 `newsSources` 배열에 새로운 소스를 추가:

### RSS 피드 추가

```javascript
{
  name: '언론사명',
  type: 'rss',
  url: 'https://example.com/rss',
  maxItems: 5
}
```

### 웹 스크래핑 추가

```javascript
{
  name: '언론사명',
  type: 'web',
  url: 'https://example.com/ai-news',
  selector: '.news-item',
  titleSelector: '.title',
  linkSelector: 'a',
  maxItems: 5
}
```

## 주의사항

- 일부 사이트는 크롤링 방지 정책으로 차단될 수 있습니다
- GitHub Actions는 서버 환경이므로 로컬보다 성공률이 높습니다
- User-Agent를 설정하여 일반 브라우저처럼 요청합니다

## 의존성

- **axios**: HTTP 요청
- **cheerio**: HTML 파싱 (웹 스크래핑용)
- **rss-parser**: RSS 피드 파싱
