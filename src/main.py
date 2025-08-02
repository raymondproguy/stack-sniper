from fastapi import FastAPI
from fastapi.responses import JSONResponse
from scraper import get_so_answer

app = FastAPI()

@app.get("/snipe")
async def snipe(error: str):
    """Fetch top Stack Overflow answer for an error."""
    answer = get_so_answer(error)
    return JSONResponse(
        content={"error": error, "solution": answer}
    )
