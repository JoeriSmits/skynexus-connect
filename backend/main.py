# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sim.sim_state import simulator_state
from sim.connection import start_connection_monitor, get_vr
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
    start_connection_monitor()
    start_background_updater()

@app.get("/simulator-status")
def get_status():
    return simulator_state

@app.post("/abort-flight")
def abort_flight():
    simulator_state.last_completed_aircraft = None
    return {"message": "Flight aborted"}

@app.post("/set-simvar")
async def set_simvar(request: Request):
    vr = get_vr()
    
    if vr is None:
        return { "status": "error", "message": "SimConnect not initialized." }

    body = await request.json()
    var = body.get("var")
    value = body.get("value")

    if not var or value is None:
        return { "status": "error", "message": "Missing 'var' or 'value'" }

    try:
        vr.set(f"{value} (> {var})")
        return { "status": "success", "var": var, "value": value }
    except Exception as e:
        return { "status": "error", "message": str(e) }

@app.get("/status")
def ping():
    return {"message": "Python backend is live!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=5000, reload=False)
