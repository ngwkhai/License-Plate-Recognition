
from fastapi import FastAPI
from app.api.routes import router as api_router
from app.websocket.ws_server import websocket_endpoint
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine


app = FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

app.add_api_websocket_route("/ws", websocket_endpoint)

@app.get("/health")
def health_check():
    return {"status": "ok"}