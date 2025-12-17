from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from services.openai_service import OpenAIService
from services.gemini_service import GeminiService
from services.rag_engine import RAGEngine

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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
