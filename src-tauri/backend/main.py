# main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sim.sim_state import simulator_state
from sim.logger import start_logging, stop_logging, get_logged_data
from sim.connection import start_connection_monitor, get_vr
from supabase import create_client
from sim.background_updater import start_background_updater
from dotenv import load_dotenv
import uvicorn
import random
import time
import json
import socket
import os
import threading
import psutil
import uuid

PORT = 5051

load_dotenv()

SUPABASE_URL = "https://pkoaihoyqzogymvgriaz.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrb2FpaG95cXpvZ3ltdmdyaWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMjMwMzIsImV4cCI6MjA1OTY5OTAzMn0.fQiEv3OnlV5JUbdJnDWOSKPCY45zSfWZZE2XPhUv2ms"

def exit_if_parent_dies():
    try:
        parent = psutil.Process(os.getppid())
        parent.wait()
        print("🔌 Parent process exited. Shutting down backend.")
        os._exit(1)
    except Exception as e:
        print(f"⚠️ Failed to track parent process: {e}")

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

@app.get("/start-logging")
def start():
    thread = threading.Thread(target=start_logging, daemon=True)
    thread.start()
    return {"status": "logging started"}

@app.get("/flight-data")
def flight_data():
    return get_logged_data()

@app.get("/stop-and-upload")
def stop_and_upload():
    stop_logging()
    data = get_logged_data()

    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    payload = "\n".join([json.dumps(entry) for entry in data])

    # Generate unique hash-based filename
    file_id = str(uuid.uuid4())
    file_path = f"logs/session_{file_id}.jsonl"

    client.storage.from_("flightlogs").upload(file_path, payload.encode("utf-8"))

    data.clear()

    return {
        "status": "uploaded",
        "path": file_path
    }


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
    threading.Thread(target=exit_if_parent_dies, daemon=True).start()

    while True:
        if is_port_open("127.0.0.1", PORT):
            try:
                print(f"🟢 Starting server on port {PORT}...")
                uvicorn.run(app, host="127.0.0.1", port=PORT, reload=False)
                break
            except Exception as e:
                print(f"❌ Failed to start server: {e}")
        else:
            print(f"🔄 Port {PORT} in use, retrying in 3 seconds...")

        time.sleep(3)
