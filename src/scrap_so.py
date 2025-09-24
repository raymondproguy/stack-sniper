import os
import requests
import re
from dotenv import load_dotenv
import logging
import html

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

def get_so_answer(error: str) -> str:
    """Fetch top answer from Stack Overflow with simplified parameters."""
    api_key = os.getenv("STACK_OVERFLOW_API_KEY")
    if not api_key:
        return "API configuration error. Please check your API key."
    
    # SIMPLIFIED PARAMETERS - no complex filters
    params = {
        "order": "desc",
        "sort": "relevance",
        "q": error,
        "site": "stackoverflow",
        "key": api_key,
        "pagesize": 3,
        "answers": 1
    }
    
    try:
        response = requests.get(
            "https://api.stackexchange.com/2.3/search/advanced",
            params=params,
            timeout=10
        )
        
        if response.status_code != 200:
            return f"Stack Overflow API error: {response.status_code}"
        
        data = response.json()
        items = data.get("items", [])
        
        if not items:
            return f"No solutions found for '{error}'. Try a different error message."
        
        # Get the first relevant question
        question = items[0]
        question_title = question["title"]
        question_id = question["question_id"]
        
        # Get answers for this question
        answers_response = requests.get(
            f"https://api.stackexchange.com/2.3/questions/{question_id}/answers",
            params={
                "order": "desc",
                "sort": "votes",
                "site": "stackoverflow",
                "key": api_key,
                "pagesize": 1
            },
            timeout=10
        )
        
        if answers_response.status_code != 200:
            return f"Found question but couldn't fetch answers: {question_title}"
        
        answers_data = answers_response.json()
        answers = answers_data.get("items", [])
        
        if not answers:
            return f"Found question but no answers yet: {question_title}"
        
        # Get the top answer
        answer = answers[0]["body"]
        
        # Simple cleaning
        clean_text = re.sub(r'<[^>]+>', '', answer)  # Remove HTML tags
        clean_text = html.unescape(clean_text)  # Decode entities
        clean_text = clean_text.strip()
        
        # Simple truncation
        if len(clean_text) > 1000:
            clean_text = clean_text[:1000] + "..."
        
        return f"🔍 {question_title}\n\n{clean_text}"
        
    except Exception as e:
        return f"Error: {str(e)}"
