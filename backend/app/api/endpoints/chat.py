from fastapi import APIRouter, Depends
from backend.app.schemas import schemas
from backend.app.agents import rag_agent
from backend.app.auth import auth
from backend.app.models import models

router = APIRouter()

@router.post("/", response_model=schemas.ChatResponse)
def ask_ai_chatbot(
    payload: schemas.ChatMessage,
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = payload.message
    lang = payload.language or "en"
    
    # Query RAG bot
    res = rag_agent.query_rag_bot(query, language=lang)
    
    return schemas.ChatResponse(
        response=res["response"],
        sources=res["sources"]
    )
