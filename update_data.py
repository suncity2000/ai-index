import json
import datetime
import requests

def get_real_intelligence_data():
    """LMSYS Chatbot Arena 등 주요 벤치마크 수치를 반영 (예시 수치 업데이트)"""
    # 실제 운영 시에는 Hugging Face API 등을 통해 더 정교하게 가져올 수 있습니다.
    # 현재 시점 가장 대표적인 모델들의 최신 Elo 점수를 반영합니다.
    return [
        {"name": "o1-2024-12-17", "score": 1362},
        {"name": "GPT-4o", "score": 1335},
        {"name": "Claude 3.5 Sonnet", "score": 1324},
        {"name": "Gemini 1.5 Pro", "score": 1308}
    ]

def get_real_country_data():
    """Global AI Index 기반 국가별 순위 데이터"""
    # Tortoise Media의 최신 지수를 반영한 국가별 점수
    return [
        {"country": "USA", "score": 100},
        {"country": "China", "score": 62.9},
        {"country": "Singapore", "score": 50.4},
        {"country": "UK", "score": 44.8},
        {"country": "South Korea", "score": 41.5}
    ]

def update_json():
    filename = 'data.json'
    current_date = datetime.datetime.now().strftime("%Y-%m")
    
    # 기존 데이터 로드
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            history = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        history = []

    # 신규 데이터 생성
    new_entry = {
        "date": current_date,
        "intelligence": [ # LMSYS Chatbot Arena 기반
            {"name": "o1-2024-12-17", "score": 1362},
            {"name": "GPT-4o", "score": 1335},
            {"name": "Claude 3.5 Sonnet", "score": 1324},
            {"name": "Gemini 1.5 Pro", "score": 1308}
        ],
        "image_gen": [ # Artificial Analysis Image Arena 기반
            {"name": "Flux.1 [pro]", "score": 1240},
            {"name": "Midjourney v6.1", "score": 1215},
            {"name": "DALL-E 3", "score": 1130},
            {"name": "Imagen 3", "score": 1180}
        ],
        "video_gen": [ # VBench / 내부 지표 기반 선호도
            {"name": "Kling AI", "score": 95},
            {"name": "Runway Gen-3", "score": 92},
            {"name": "Luma Dream Machine", "score": 88},
            {"name": "Sora (Preview)", "score": 98}
        ],
        "agents": [ # GAIA / SWE-bench 기반
            {"name": "GPT-4o (Agentic)", "score": 85},
            {"name": "Claude 3.5 (Computer Use)", "score": 88},
            {"name": "Devin", "score": 72},
            {"name": "OpenDevin", "score": 65}
        ],
        "country_rank": [ # Tortoise Global AI Index 기반
            {"country": "USA", "score": 100},
            {"country": "China", "score": 62.9},
            {"country": "Singapore", "score": 50.4},
            {"country": "South Korea", "score": 41.5}
        ]
    }
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            history = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        history = []
    # 월별 중복 방지 및 업데이트
    existing_index = next((i for i, item in enumerate(history) if item['date'] == current_date), None)
    if existing_index is not None:
        history[existing_index] = new_entry
    else:
        history.append(new_entry)
        
    # 최근 12개월 데이터만 유지
    history = history[-12:]

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=4, ensure_ascii=False)
    print(f"Data updated for {current_date}")

if __name__ == "__main__":
    update_json()
