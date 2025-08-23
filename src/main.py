from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from scraper import get_so_answer
import logging

# Logger to see errors in console
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="StackSniper", version="1.0.0")

# Mount static files (CSS, JS) and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """Serve the main frontend page."""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/snipe")
async def snipe(error: str):
   # API endpoint to fetch Stack Overflow solutions.
    
    if not error or len(error.strip()) < 2:
        raise HTTPException(
            status_code=400,
            detail="Error query must be at least 2 characters long."
        )
    
    try:
        answer = get_so_answer(error.strip())
        return {
            "success": True,
            "error": error,
            "solution": answer
        }
    except Exception as e:
        logger.error(f"API Error for '{error}': {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch solution from Stack Overflow. Please try again later."
        )
