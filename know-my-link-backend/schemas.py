from fastapi import Body
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str = Body(..., description="The user's message to the chatbot.")

class ChatResponse(BaseModel):
    message: str = Body(..., description="The chatbot's response to the user.")
