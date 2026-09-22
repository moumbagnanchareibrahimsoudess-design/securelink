import os
from fastapi import FastAPI, Header, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
from analyzer import analyze_content
from advisor_engine import answer_question
from db import save_analysis, init_db, close_pool

load_dotenv()

API_KEY = os.getenv("SECURELINK_API_KEY")

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()
    except Exception as e:
        print(f"Avertissement BDD au démarrage : {e}")
    yield
    close_pool()


app = FastAPI(title="SecureLink API", version="1.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    content: str


class AskRequest(BaseModel):
    question: str
    context: dict = {}


def verify_api_key(x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Clé API invalide ou manquante.")


@app.post("/analyze", dependencies=[Depends(verify_api_key)])
@limiter.limit("10/minute")
def analyze(request: Request, body: AnalyzeRequest):
    result = analyze_content(body.content)

    try:
        save_analysis(body.content, result["url"], result)
    except Exception:
        pass

    return result


@app.post("/ask", dependencies=[Depends(verify_api_key)])
@limiter.limit("20/minute")
def ask(request: Request, body: AskRequest):
    reply = answer_question(body.question, body.context)
    return {"reply": reply}


@app.get("/")
def root():
    return {"status": "ok", "service": "securelink-api"}