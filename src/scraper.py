import os
import requests
from dotenv import load_dotenv

load_dotenv()  # Load to load .env variables

def get_so_answer(error: str) -> str:
    """Fetch top answer using Stack Overflow API."""
    api_key = os.getenv("STACK_OVERFLOW_API_KEY")
    params = {
        "order": "desc",
        "sort": "votes",
        "q": error,
        "site": "stackoverflow",
        "key": api_key,  # From .env
        "filter": "withbody"  # Include answer bodies
    }
    try:
        response = requests.get(
            "https://api.stackexchange.com/2.3/search/advanced",
            params=params,
            timeout=10
        )
        items = response.json()["items"]
        if not items:
            return "No solutions found."
        top_answer = items[0]["body"]  # Raw HTML
        return clean_html(top_answer)  # Remove HTML tags (see below)
    except Exception as e:
        return f"API Error: {str(e)}"

def clean_html(html: str) -> str:
    """Remove HTML tags (simplified version)."""
    import re
    return re.sub(r'<[^>]+>', '', html)[:1000]  # Truncate
