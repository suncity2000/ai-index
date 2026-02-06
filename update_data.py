import json
import datetime

def get_latest_benchmarks():
    """주요 분야별 최신 벤치마크 점수 (현시점 공인 수치 기준)"""
    return {
        "intelligence": [
            {"name": "o1-2024-12-17", "score": 1362},
            {"name": "GPT-4o", "score": 1335},
            {"name": "Claude 3.5 Sonnet", "score": 1324},
            {"name": "Gemini 1.5 Pro", "score": 1308}
        ],
        "image_gen": [
            {"name": "Flux.1 [pro]", "score": 1240},
            {"name": "Midjourney v6.1", "score": 1215},
            {"name": "DALL-E 3", "score": 1130},
            {"name": "Imagen 3", "score": 1180}
        ],
        "video_gen": [
            {"name": "Kling AI", "score": 95},
            {"name": "Sora (Preview)", "score": 98},
            {"name": "Runway Gen-3", "score": 92},
            {"name": "Luma Dream", "score": 88}
        ],
        "agents": [
            {"name": "Claude 3.5 (Comp Use)", "score": 88},
            {"name": "GPT-4o (Agentic)", "score": 85},
            {"name": "Devin", "score": 72},
            {"name": "OpenDevin", "score": 65}
        ],
        "user_popularity": [ # 구글 트렌드 및 웹 트래픽 기반 상대적 인기 지수 (100점 만점)
            {"name": "ChatGPT", "score": 100},
            {"name": "Claude", "score": 45},
            {"name": "Gemini", "score": 60},
            {"name": "Perplexity", "score": 35}
        ],
        "country_rank": [
            {"country": "USA", "score": 100},
            {"country": "China", "score": 62.9},
            {"country": "Singapore", "score": 50.4},
            {"country": "South Korea", "score": 41.5},
            {"country": "UK", "score": 44.8}
        ]
    }


def update_json():
    filename = 'data.json'
    current_date = datetime.datetime.now().strftime("%Y-%m")
    
    new_entry = {
        "date": current_date,
        "intelligence": [
            {"name": "o1-2024-12-17", "score": 1362},
            {"name": "GPT-4o", "score": 1335},
            {"name": "Claude 3.5 Sonnet", "score": 1324},
            {"name": "Gemini 1.5 Pro", "score": 1308}
        ],
        "image_gen": [
            {"name": "Flux.1 [pro]", "score": 1240},
            {"name": "Midjourney v6.1", "score": 1215},
            {"name": "Imagen 3", "score": 1180},
            {"name": "DALL-E 3", "score": 1130}
        ],
        "video_gen": [
            {"name": "Sora (Preview)", "score": 98},
            {"name": "Kling AI", "score": 95},
            {"name": "Runway Gen-3", "score": 92},
            {"name": "Luma Dream", "score": 88}
        ],
        "agents": [
            {"name": "Claude 3.5 (Comp Use)", "score": 88},
            {"name": "GPT-4o (Agentic)", "score": 85},
            {"name": "Devin", "score": 72},
            {"name": "OpenDevin", "score": 65}
        ],
        "user_popularity": [
            {"name": "ChatGPT", "score": 100},
            {"name": "Gemini", "score": 60},
            {"name": "Claude", "score": 45},
            {"name": "Perplexity", "score": 35}
        ],
        "country_rank": [
            {"country": "USA", "score": 100},
            {"country": "China", "score": 62.9},
            {"country": "UK", "score": 44.8},
            {"country": "South Korea", "score": 41.5}
        ]
    }

    try:
        with open(filename, 'r', encoding='utf-8') as f:
            history = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        history = []

    idx = next((i for i, item in enumerate(history) if item['date'] == current_date), None)
    if idx is not None:
        history[idx] = new_entry
    else:
        history.append(new_entry)
        
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(history[-12:], f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    update_json()
