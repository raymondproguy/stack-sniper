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
    """Fetch top answer from Stack Overflow with simplified, reliable parameters."""
    api_key = os.getenv("STACK_OVERFLOW_API_KEY")
    if not api_key:
        logger.error("STACK_OVERFLOW_API_KEY not found in environment variables")
        return "API configuration error. Please check your API key."
    
    # SIMPLIFIED AND RELIABLE PARAMETERS
    params = {
        "order": "desc",
        "sort": "votes",
        "q": error,
        "site": "stackoverflow",
        "key": api_key,
        "pagesize": 1,
        "filter": "withbody"  # Simple, reliable filter that always works
    }
    
    try:
        logger.info(f"Searching Stack Overflow for: {error}")
        response = requests.get(
            "https://api.stackexchange.com/2.3/search/advanced",
            params=params,
            timeout=15
        )
        
        # Log the API response for debugging
        logger.info(f"API Status: {response.status_code}")
        
        if response.status_code != 200:
            logger.warning(f"API returned non-200 status: {response.status_code}")
            return f"Stack Overflow API returned error: {response.status_code}"
        
        data = response.json()
        items = data.get("items", [])
        
        if not items:
            logger.info(f"No results found for error: {error}")
            return f"No solutions found for '{error}' on Stack Overflow. Try simplifying the error message."
        
        # Get the top question details
        top_question = items[0]
        question_id = top_question["question_id"]
        question_title = top_question["title"]
        
        logger.info(f"Top result: {question_title} (ID: {question_id})")
        
        # Now get the top answer for this question
        answers_params = {
            "order": "desc",
            "sort": "votes",
            "site": "stackoverflow", 
            "key": api_key,
            "filter": "withbody",
            "pagesize": 1
        }
        
        answers_response = requests.get(
            f"https://api.stackexchange.com/2.3/questions/{question_id}/answers",
            params=answers_params,
            timeout=15
        )
        
        if answers_response.status_code != 200:
            logger.warning(f"Answers API returned: {answers_response.status_code}")
            return f"Found question but couldn't fetch answers: {question_title}"
        
        answers_data = answers_response.json()
        answers = answers_data.get("items", [])
        
        if not answers:
            logger.info("Question found but no answers available")
            return f"Found question but no answers yet: {question_title}"
        
        top_answer = answers[0]["body"]
        logger.info("Successfully fetched answer content")
        
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
    try:
        # Convert line breaks
        clean_text = re.sub(r'<br\s*/?>', '\n', html)
        
        # Convert code blocks
        clean_text = re.sub(r'<pre[^>]*>(.*?)</pre>', r'\n```\n\1\n```\n', clean_text, flags=re.DOTALL)
        
        # Convert inline code
        clean_text = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', clean_text, flags=re.DOTALL)
        
        # Remove all other HTML tags
        clean_text = re.sub(r'<[^>]+>', '', clean_text)
        
        # Clean up extra whitespace
        clean_text = re.sub(r'\n{3,}', '\n\n', clean_text)
        clean_text = clean_text.strip()
        
        # Truncate very long answers but preserve code blocks
        if len(clean_text) > 2000:
            # Find a good truncation point that doesn't cut code blocks
            truncated = clean_text[:2000]
            if '```' in truncated:
                # Don't truncate in the middle of a code block
                last_code_block = truncated.rfind('```')
                if last_code_block != -1:
                    # Find the end of this code block
                    end_of_block = truncated.find('```', last_code_block + 3)
                    if end_of_block == -1:
                        # Code block wasn't closed, truncate before it
                        truncated = clean_text[:last_code_block]
            
            clean_text = truncated + "...\n\n[Answer truncated due to length]"
        
        return clean_text
        
    except Exception as e:
        logger.error(f"Error cleaning HTML: {str(e)}")
        return "Error processing the answer content."
