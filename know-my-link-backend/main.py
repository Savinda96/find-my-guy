from fastapi import FastAPI

from api.v1.chat import app as chat_app

app = FastAPI()
app.mount("/api/v1", chat_app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
