from fastapi import APIRouter, Body

from schemas import ChatRequest, ChatResponse
from core.langchain_agent import LangchainAgent


router = APIRouter()
agent = LangchainAgent()  # Initialize your Langchain agent here


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest = Body(...)):
    response = agent.handle_message(request.message)
    return ChatResponse(message=response)
