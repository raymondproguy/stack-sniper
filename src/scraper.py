import os
import requests
import re
from dotenv import load_dotenv
import logging
from typing import Optional
import html

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

def get_so_answer(error: str) -> str:
    """Fetch top answer from Stack Overflow with better search accuracy."""
    api_key = os.getenv("STACK_OVERFLOW_API_KEY")
    if not api_key:
        return "API configuration error. Please check your API key."
    
    # BETTER SEARCH PARAMETERS - more specific to the error
    params = {
        "order": "desc",
        "sort": "relevance",  # Changed from 'votes' to 'relevance'
        "q": error,
        "site": "stackoverflow",
        "key": api_key,
        "pagesize": 3,  # Get more results to find better matches
        "answers": 1,    # Only questions with answers
        "filter": "!-*jbN(9eSgKQv"
    }
    
    try:
        logger.info(f"Searching Stack Overflow for: {error}")
        response = requests.get(
            "https://api.stackexchange.com/2.3/search/advanced",
            params=params,
            timeout=15
        )
        
        if response.status_code != 200:
            return f"API error: {response.status_code}"
        
        data = response.json()
        items = data.get("items", [])
        
        if not items:
            return f"No solutions found for '{error}'. Try simplifying the error message."
        
        # Find the most relevant question (better matching)
        best_question = None
        best_score = -1
        
        for question in items:
            title = question.get("title", "").lower()
            error_lower = error.lower()
            
            # Simple relevance scoring
            score = 0
            if error_lower in title:
                score += 10
            if any(word in title for word in error_lower.split()[:3]):
                score += 5
            if question.get("answer_count", 0) > 0:
                score += 3
            if question.get("is_answered", False):
                score += 2
                
            if score > best_score:
                best_score = score
                best_question = question
        
        if not best_question:
            return "No relevant solutions found."
        
        question_id = best_question["question_id"]
        question_title = best_question["title"]
        has_accepted_answer = best_question.get("accepted_answer_id")
        
        logger.info(f"Best match: {question_title} (Score: {best_score})")
        
        # Get the ANSWERS for this question
        answers_params = {
            "order": "desc",
            "sort": "votes",
            "site": "stackoverflow", 
            "key": api_key,
            "filter": "!-*jbN(9eSgKQv",
            "pagesize": 3
        }
        
        answers_response = requests.get(
            f"https://api.stackexchange.com/2.3/questions/{question_id}/answers",
            params=answers_params,
            timeout=15
        )
        
        if answers_response.status_code != 200:
            return f"Found question but couldn't fetch answers."
        
        answers_data = answers_response.json()
        answers = answers_data.get("items", [])
        
        if not answers:
            return f"Found question but no answers yet: {question_title}"
        
        # Get the best answer (accepted or highest voted)
        best_answer = None
        for answer in answers:
            if has_accepted_answer and answer["answer_id"] == has_accepted_answer:
                best_answer = answer
                break
        
        if not best_answer:
            best_answer = answers[0]  # Highest voted
        
        answer_body = best_answer["body"]
        score = best_answer["score"]
        is_accepted = best_answer.get("is_accepted", False)
        
        # Clean and format the answer
        clean_answer = clean_html(answer_body)
        
        # Format the response clearly
        formatted_response = f"🔍 {question_title}\n\n"
        if is_accepted:
            formatted_response += "✅ Accepted Solution\n"
        formatted_response += f"⭐ Score: {score}\n\n"
        formatted_response += "--- SOLUTION ---\n\n"
        formatted_response += clean_answer
        
        return formatted_response
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return "An error occurred. Please try again."

def clean_html(html_content: str) -> str:
    """Better HTML cleaning with proper entity decoding."""
    try:
        # First decode HTML entities
        clean_text = html.unescape(html_content)
        
        # Remove HTML comments
        clean_text = re.sub(r'<!--.*?-->', '', clean_text, flags=re.DOTALL)
        
        # Convert code blocks
        clean_text = re.sub(r'<pre[^>]*>\s*<code[^>]*>(.*?)</code>\s*</pre>', 
                           r'\n\n```\n\1\n```\n\n', clean_text, flags=re.DOTALL)
        
        # Convert inline code
        clean_text = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', clean_text)
        
        # Convert line breaks and paragraphs
        clean_text = re.sub(r'<br\s*/?>', '\n', clean_text)
        clean_text = re.sub(r'<p[^>]*>', '\n', clean_text)
        clean_text = re.sub(r'</p>', '\n', clean_text)
        
        # Remove all other HTML tags
        clean_text = re.sub(r'<[^>]+>', '', clean_text)
        
        # Clean up whitespace
        clean_text = re.sub(r'[ \t]+', ' ', clean_text)
        clean_text = re.sub(r'\n{3,}', '\n\n', clean_text)
        clean_text = clean_text.strip()
        
        # Smart truncation
        if len(clean_text) > 2000:
            clean_text = clean_text[:2000] + "\n\n...\n*Answer truncated*"
        
        return clean_text
        
    except Exception as e:
        return f"Error processing content: {str(e)}"
