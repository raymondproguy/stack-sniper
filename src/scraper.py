import os
import requests
import re
from dotenv import load_dotenv
import logging
from typing import Optional

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

def get_so_answer(error: str) -> str:
    """Fetch top answer from Stack Overflow with improved error handling."""
    api_key = os.getenv("STACK_OVERFLOW_API_KEY")
    if not api_key:
        logger.error("STACK_OVERFLOW_API_KEY not found in environment variables")
        return "API configuration error. Please contact administrator."
    
    params = {
        "order": "desc",
        "sort": "votes",
        "q": error,
        "site": "stackoverflow",
        "key": api_key,
        "pagesize": 1,
        "filter": "!-NHuCSBOsJ9n-ExTdCki"  # Better filter for answers
    }
    
    try:
        response = requests.get(
            "https://api.stackexchange.com/2.3/search/advanced",
            params=params,
            timeout=15
        )
        response.raise_for_status()  # Raises exception for bad status codes
        
        data = response.json()
        items = data.get("items", [])
        
        if not items:
            return f"No solutions found for '{error}' on Stack Overflow. Try simplifying the error message."
        
        # Get the question ID of the top result
        question_id = items[0]["question_id"]
        
        # Now get the answers for this question
        answers_response = requests.get(
            f"https://api.stackexchange.com/2.3/questions/{question_id}/answers",
            params={
                "order": "desc",
                "sort": "votes",
                "site": "stackoverflow",
                "key": api_key,
                "filter": "!-*jbN08T3KmS",  # Filter for answer body
                "pagesize": 1
            },
            timeout=15
        )
        answers_response.raise_for_status()
        
        answers_data = answers_response.json()
        answers = answers_data.get("items", [])
        
        if not answers:
            return "Found a relevant question but no answers yet."
        
        top_answer = answers[0]["body"]
        return clean_html(top_answer)
        
    except requests.exceptions.Timeout:
        logger.warning(f"Request timeout for error: {error}")
        return "Request timeout. Stack Overflow might be busy. Please try again."
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error: {str(e)}")
        return "Network error. Please check your connection and try again."
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return "An unexpected error occurred. Please try again later."

def clean_html(html: str) -> str:
    """
    Clean HTML content from Stack Overflow answers.
    Converts code blocks and maintains readability.
    """
    # Remove HTML tags but preserve line breaks and code formatting
    clean_text = re.sub(r'<br\s*/?>', '\n', html)  # Convert <br> to newlines
    clean_text = re.sub(r'<pre[^>]*>(.*?)</pre>', r'\n```\n\1\n```\n', clean_text, flags=re.DOTALL)  # Code blocks
    clean_text = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', clean_text, flags=re.DOTALL)  # Inline code
    clean_text = re.sub(r'<[^>]+>', '', clean_text)  # Remove all other tags
    
    # Clean up extra whitespace
    clean_text = re.sub(r'\n{3,}', '\n\n', clean_text)  # Limit consecutive newlines
    clean_text = clean_text.strip()
    
    # Truncate very long answers but preserve code blocks
    if len(clean_text) > 1500:
        clean_text = clean_text[:1500] + "...\n\n[Answer truncated due to length]"
    
    return clean_text
