# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sim.sim_state import simulator_state
from sim.connection import start_connection_monitor, get_vr
from sim.background_updater import start_background_updater
import uvicorn
import random
import time
import socket

PORT = 5051

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_connection_monitor()
    start_background_updater()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        jitter = random.uniform(-0.001, 0.001)
        value_with_jitter = float(value) + jitter
        command = f"{value_with_jitter} (> {var})"
        vr.set(command)
        print(command)
        return { "status": "success", "var": var, "value": value_with_jitter }
    except Exception as e:
        return { "status": "error", "message": str(e) }

@app.get("/status")
def ping():
    return {"message": "Python backend is live!"}


def is_port_open(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) != 0  # True if port is free


if __name__ == "__main__":
    while True:
        if is_port_open("127.0.0.1", PORT):
            try:
                print(f"🟢 Starting server on port {PORT}...")
                uvicorn.run("main:app", host="127.0.0.1", port=PORT, reload=False)
                break  # Exit loop if server starts successfully
            except Exception as e:
                print(f"❌ Failed to start server: {e}")
        else:
            print(f"🔄 Port {PORT} in use, retrying in 3 seconds...")

        time.sleep(3)
