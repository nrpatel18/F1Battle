from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="F1 Telemetry Battle API",
    description="API for F1 telemetry comparison and visualization",
    version="1.0.0"
)

# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api", tags=["api"])


@app.get("/")
async def root():
    return {"message": "F1 Telemetry Battle API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

