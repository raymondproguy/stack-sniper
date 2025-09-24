from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.exceptions import RequestValidationError
import logging
from scraper import get_so_answer

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="StackSniper",
    version="1.0.0",
    description="Instant Stack Overflow solutions for error messages",
    docs_url="/docs",
    redoc_url=None
)

# Add security middleware (SIMPLIFIED - no GZip)
#app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# Mount static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Custom exception handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception):
    return templates.TemplateResponse(
        "404.html", 
        {"request": request},
        status_code=404
    )

@app.exception_handler(500)
async def server_error_handler(request: Request, exc: Exception):
    logger.error(f"Server error: {exc}")
    return templates.TemplateResponse(
        "500.html", 
        {"request": request},
        status_code=500
    )

@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": "Validation error",
            "solution": "Please provide a valid error message."
        }
    )

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    """Serve the main frontend page."""
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/snipe")
async def snipe(request: Request, error: str):
    """
    API endpoint to fetch Stack Overflow solutions.
    """
    if not error or len(error.strip()) < 2:
        raise HTTPException(
            status_code=400,
            detail="Error query must be at least 2 characters long."
        )
    
    clean_error = error.strip()
    logger.info(f"Processing error: {clean_error}")
    
    try:
        answer = get_so_answer(clean_error)
        return {
            "success": True,
            "error": clean_error,
            "solution": answer
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing '{clean_error}': {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error. Please try again later."
        )

@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring."""
    return {"status": "healthy", "service": "StackSniper"}

@app.get("/favicon.ico")
async def favicon():
    """Avoid favicon errors."""
    return JSONResponse(content=None, status_code=204)

@app.get("/about")
async def about(request: Request):
    """About page."""
    return templates.TemplateResponse("about.html", {"request": request})

@app.get("/privacy")
async def privacy(request: Request):
    """Privacy policy page."""
    return templates.TemplateResponse("privacy.html", {"request": request})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
