import os
import json
import time
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import openai
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")
AI_MODEL = os.getenv("AI_MODEL", "gpt-4")

app = FastAPI(title="Chatbot AI Service", description="API for processing chatbot messages with custom knowledge bases")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CLIENT_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    user_id: str
    conversation_id: str
    message: str
    knowledge_base_id: Optional[str] = None
    history: List[Message] = []
    settings: Dict[str, Any] = Field(default_factory=lambda: {"temperature": 0.7})

class ChatResponse(BaseModel):
    message: str
    conversation_id: str
    metadata: Dict[str, Any] = {}

# Routes
@app.get("/")
async def read_root():
    return {"status": "ok", "message": "Chatbot AI Service is running"}

@app.post("/process", response_model=ChatResponse)
async def process_message(request: ChatRequest, background_tasks: BackgroundTasks):
    start_time = time.time()
    
    try:
        # Prepare messages for OpenAI
        messages = [{"role": msg.role, "content": msg.content} for msg in request.history]
        messages.append({"role": "user", "content": request.message})
        
        # If knowledge base is specified, we would query it here
        # For now, just use OpenAI directly
        
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model=AI_MODEL,
            messages=messages,
            temperature=request.settings.get("temperature", 0.7),
        )
        
        # Extract response
        assistant_message = response.choices[0].message.content
        
        # Calculate tokens used
        prompt_tokens = response.usage.prompt_tokens
        completion_tokens = response.usage.completion_tokens
        total_tokens = response.usage.total_tokens
        
        # Calculate processing time
        processing_time = time.time() - start_time
        
        # Background task to save message and analytics
        # This would interact with your MongoDB in a real implementation
        background_tasks.add_task(
            save_message_and_analytics,
            request.user_id,
            request.conversation_id,
            request.message,
            assistant_message,
            prompt_tokens,
            completion_tokens,
            total_tokens,
            processing_time,
        )
        
        return ChatResponse(
            message=assistant_message,
            conversation_id=request.conversation_id,
            metadata={
                "tokens": {
                    "prompt": prompt_tokens,
                    "completion": completion_tokens,
                    "total": total_tokens
                },
                "processingTime": processing_time,
                "model": AI_MODEL
            }
        )
    
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Background task function (mock implementation)
async def save_message_and_analytics(
    user_id: str,
    conversation_id: str,
    user_message: str,
    assistant_message: str,
    prompt_tokens: int,
    completion_tokens: int,
    total_tokens: int,
    processing_time: float,
):
    # In a real implementation, this would:
    # 1. Save the user and assistant messages to MongoDB
    # 2. Update conversation with new message count and last message
    # 3. Update analytics for the user
    # 4. Increment messages used for subscription limits
    
    logger.info(f"Saved message for user {user_id} in conversation {conversation_id}")
    logger.info(f"Tokens used: {total_tokens} (prompt: {prompt_tokens}, completion: {completion_tokens})")
    
    # Mock implementation ends here

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 