import os
import requests
import re
from dotenv import load_dotenv

load_dotenv()  # Load .env variables

def get_so_answer(error: str) -> str:
    """Fetch top answer using Stack Overflow API (recommended)."""
    api_key = os.getenv("STACK_OVERFLOW_API_KEY")
    params = {
        "order": "desc",
        "sort": "votes",
        "q": error,
        "site": "stackoverflow",
        "key": api_key,
        "filter": "withbody"  # Get full answer text
    }
    try:
        response = requests.get(
            "https://api.stackexchange.com/2.3/search/advanced",
            params=params,
            timeout=10
        )
        items = response.json().get("items", [])
        if not items:
            return "No solutions found on Stack Overflow."
        top_answer = items[0]["body"]  # Raw HTML
        return clean_html(top_answer)
    except Exception as e:
        return f"API Error: {str(e)}"

def clean_html(html: str) -> str:
    """Strip HTML tags and truncate."""
    clean_text = re.sub(r'<[^>]+>', '', html)
    return clean_text[:1000]  # Trim long answers
