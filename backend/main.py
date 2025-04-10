# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sim.sim_state import simulator_state
from sim.background_updater import start_background_updater
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Start background thread on startup
@app.on_event("startup")
def startup_event():
    start_background_updater()

@app.get("/simulator-status")
def get_status():
    return simulator_state

@app.post("/set-initial-state")
async def set_state(request: Request):
    data = await request.json()
    print("Set initial aircraft state:", data)
    return {"ok": True}

@app.post("/complete-flight")
async def complete_flight(request: Request):
    data = await request.json()
    print("Received completed flight:", data)
    return {"ok": True}

@app.get("/status")
def ping():
    return {"message": "Python backend is live!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=False)
