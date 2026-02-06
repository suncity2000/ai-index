import json
import datetime

# 1. 실제로는 여기서 API 호출이나 웹 크롤링을 수행합니다.
# 지금은 구조 파악을 위해 샘플 데이터를 생성하는 로직을 넣었습니다.
def fetch_ai_data():
    current_date = datetime.datetime.now().strftime("%Y-%m")
    
    # 예시 데이터 (실제 운영 시에는 오픈 API나 크롤링 결과값 대입)
    new_data = {
        "date": current_date,
        "intelligence": [
            {"name": "GPT-4o", "score": 1350},
            {"name": "Claude 3.5", "score": 1380},
            {"name": "Gemini 1.5 Pro", "score": 1320}
        ],
        "country_rank": [
            {"country": "USA", "score": 100},
            {"country": "China", "score": 85},
            {"country": "South Korea", "score": 75}
        ]
    }
    return new_data

def update_json():
    filename = 'data.json'
    
    # 기존 데이터 로드
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            history = json.load(f)
    except FileNotFoundError:
        history = []

    # 신규 데이터 추가
    new_entry = fetch_ai_data()
    
    # 날짜가 중복되지 않게 관리 (월 단위 업데이트 가정)
    if not any(item['date'] == new_entry['date'] for item in history):
        history.append(new_entry)
        # 최대 12개(6개월 단위 비교를 위해 1년치 이상) 보관
        history = history[-12:] 

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    update_json()
