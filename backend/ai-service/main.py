from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
import os
from dotenv import load_dotenv

from services.openai_service import OpenAIService
from services.gemini_service import GeminiService
from services.rag_engine import RAGEngine
from services.web_scraper import AsyncWebScraper

load_dotenv()

app = FastAPI(title="PBL AI Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
openai_service = OpenAIService()
gemini_service = GeminiService()
rag_engine = RAGEngine()


class GenerateFlashcardsRequest(BaseModel):
    content: str
    count: int = 10
    provider: str = "openai"


class FlashcardResponse(BaseModel):
    question: str
    answer: str
    tags: List[str] = []
    difficulty: str = "medium"


class QuestionRequest(BaseModel):
    question: str
    context: Optional[str] = None
    use_rag: bool = False


class ScrapeRequest(BaseModel):
    url: HttpUrl
    generate_flashcards: bool = False
    flashcard_count: int = 10
    index_to_rag: bool = False


class ScrapeAndGenerateRequest(BaseModel):
    url: HttpUrl
    flashcard_count: int = 10
    provider: str = "openai"


class BatchScrapeRequest(BaseModel):
    urls: List[HttpUrl]
    max_concurrent: int = 5


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "providers": {
            "openai": bool(os.getenv("OPENAI_API_KEY")),
            "gemini": bool(os.getenv("GEMINI_API_KEY"))
        }
    }


@app.post("/api/generate-flashcards")
async def generate_flashcards(request: GenerateFlashcardsRequest):
    """Generate flashcards from content using AI"""
    try:
        if request.provider == "openai":
            flashcards = await openai_service.generate_flashcards(
                request.content,
                request.count
            )
        elif request.provider == "gemini":
            flashcards = await gemini_service.generate_flashcards(
                request.content,
                request.count
            )
        else:
            raise HTTPException(status_code=400, message="Invalid provider")

        return {
            "flashcards": flashcards,
            "count": len(flashcards),
            "provider": request.provider
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/answer-question")
async def answer_question(request: QuestionRequest):
    """Answer a question with optional RAG context"""
    try:
        if request.use_rag:
            answer = await rag_engine.answer_with_context(request.question)
            return {
                "answer": answer["answer"],
                "sources": answer.get("sources", []),
                "method": "rag"
            }
        else:
            if request.context:
                answer = await openai_service.answer_with_context(
                    request.question,
                    request.context
                )
            else:
                answer = await openai_service.generate_text(request.question)
            
            return {
                "answer": answer,
                "method": "direct"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/summarize")
async def summarize_content(content: str, max_length: int = 500):
    """Summarize long content"""
    try:
        summary = await openai_service.summarize(content, max_length)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/scrape")
async def scrape_url(request: ScrapeRequest):
    """Scrape a URL and return structured content"""
    try:
        async with AsyncWebScraper() as scraper:
            content = await scraper.fetch_and_parse(str(request.url))
            
            return {
                "status": "success",
                "url": content["url"],
                "title": content["title"],
                "text": content["text"][:1000] + "..." if len(content["text"]) > 1000 else content["text"],
                "text_length": content["length"],
                "links_found": len(content["links"]),
                "links": content["links"][:10],  # First 10 links
                "metadata": content["metadata"],
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scraping failed: {str(e)}")


@app.post("/api/scrape-and-index")
async def scrape_and_index(request: ScrapeRequest):
    """Scrape URL and optionally index to RAG / generate flashcards"""
    try:
        async with AsyncWebScraper() as scraper:
            # Scrape content
            content = await scraper.fetch_and_parse(str(request.url))
            
            result = {
                "status": "success",
                "url": content["url"],
                "title": content["title"],
                "text_length": content["length"],
                "links_found": len(content["links"]),
            }
            
            # Index to RAG if requested
            if request.index_to_rag:
                notes = [{
                    "id": content["id"],
                    "title": content["title"],
                    "content": content["text"]
                }]
                chunks = await rag_engine.index_notes(notes)
                result["chunks_indexed"] = chunks
            
            # Generate flashcards if requested
            if request.generate_flashcards:
                flashcards = await openai_service.generate_flashcards(
                    content["text"],
                    request.flashcard_count
                )
                result["flashcards"] = flashcards
                result["flashcard_count"] = len(flashcards)
            
            return result
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Operation failed: {str(e)}")


@app.post("/api/scrape-and-generate")
async def scrape_and_generate(request: ScrapeAndGenerateRequest):
    """Scrape URL, index to RAG, and generate flashcards"""
    try:
        async with AsyncWebScraper() as scraper:
            # Scrape content
            content = await scraper.fetch_and_parse(str(request.url))
            
            # Index to RAG
            notes = [{
                "id": content["id"],
                "title": content["title"],
                "content": content["text"]
            }]
            chunks = await rag_engine.index_notes(notes)
            
            # Generate flashcards
            if request.provider == "openai":
                flashcards = await openai_service.generate_flashcards(
                    content["text"],
                    request.flashcard_count
                )
            elif request.provider == "gemini":
                flashcards = await gemini_service.generate_flashcards(
                    content["text"],
                    request.flashcard_count
                )
            else:
                raise HTTPException(status_code=400, detail="Invalid provider")
            
            return {
                "status": "success",
                "url": content["url"],
                "title": content["title"],
                "text_length": content["length"],
                "links_found": len(content["links"]),
                "chunks_indexed": chunks,
                "flashcards": flashcards,
                "flashcard_count": len(flashcards),
                "provider": request.provider,
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Operation failed: {str(e)}")


@app.post("/api/scrape-batch")
async def scrape_batch(request: BatchScrapeRequest):
    """Scrape multiple URLs concurrently"""
    try:
        urls = [str(url) for url in request.urls]
        
        async with AsyncWebScraper() as scraper:
            results = await scraper.fetch_and_parse_batch(urls[:request.max_concurrent])
            
            return {
                "status": "success",
                "total_urls": len(urls),
                "processed": len(results),
                "results": [
                    {
                        "url": r["url"],
                        "title": r["title"],
                        "text_length": r["length"],
                        "links_found": len(r["links"]),
                    }
                    for r in results
                ]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch scraping failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
