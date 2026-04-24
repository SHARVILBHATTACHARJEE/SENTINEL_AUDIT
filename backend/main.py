from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from fpdf import FPDF
from datetime import datetime
from typing import List, Dict, Any
import os
import sys
import multiprocessing
import threading
import uvicorn
import asyncio

# Import your custom logic
# Ensure backend folder has an __init__.py file
from backend.scanner import PortScanner

app = FastAPI(title="Sentinel Audit")
api_router = APIRouter(prefix="/api")

# Configure CORS
# In production/EXE mode, this allows the frontend to communicate with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    target: str
    start_port: int
    end_port: int
    scan_tcp: bool
    scan_udp: bool
    common_ports_only: bool

class ReportData(BaseModel):
    target: str
    scanned_range: str
    results: List[Dict[str, Any]]

# --- API Endpoints ---

@api_router.get("/status")
def read_root():
    return {"status": "Scanner API is running"}

# --- Global Progress State ---
scan_progress = {
    "current": 0,
    "total": 0
}

@api_router.get("/progress")
def get_progress():
    return scan_progress

cancel_scan_flag = False

@api_router.post("/cancel")
def cancel_scan():
    global cancel_scan_flag
    cancel_scan_flag = True
    return {"status": "Cancellation requested"}

@api_router.post("/scan")
async def run_scan(request: ScanRequest):
    global scan_progress
    global cancel_scan_flag
    scan_progress["current"] = 0
    scan_progress["total"] = 0
    cancel_scan_flag = False
    
    def progress_callback(current, total):
        scan_progress["current"] = current
        scan_progress["total"] = total

    def check_cancel():
        return cancel_scan_flag

    scanner = PortScanner()
    results = await scanner.scan_target(
        request.target, 
        request.start_port, 
        request.end_port,
        request.scan_tcp,
        request.scan_udp,
        request.common_ports_only,
        progress_callback=progress_callback,
        check_cancel=check_cancel
    )
    
    scanned_range = "Common Ports" if request.common_ports_only else f"{request.start_port}-{request.end_port}"


    return {
        "target": request.target,
        "scanned_range": scanned_range,
        "results": results
    }

from backend.pingsweep import NetworkScanner

class PingSweepRequest(BaseModel):
    subnet: str

@api_router.post("/ping-sweep")
async def run_ping_sweep(request: PingSweepRequest):
    global scan_progress
    global cancel_scan_flag
    scan_progress["current"] = 0
    scan_progress["total"] = 0
    cancel_scan_flag = False
    
    def progress_callback(current, total):
        scan_progress["current"] = current
        scan_progress["total"] = total
        
    def check_cancel():
        return cancel_scan_flag

    scanner = NetworkScanner()
    alive_hosts = await scanner.scan_subnet(request.subnet, progress_callback, check_cancel)
    
    return {
        "subnet": request.subnet,
        "alive_hosts": alive_hosts
    }

def generate_pdf_sync(data: ReportData) -> str:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)

    pdf.cell(0, 10, "Sentinel Audit Report", 0, 1, "C")
    pdf.ln(10)

    pdf.set_font("Arial", "", 12)
    pdf.cell(0, 10, f"Target IP: {data.target}", 0, 1)
    pdf.cell(0, 10, f"Scan Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", 0, 1)
    pdf.cell(0, 10, f"Scanned Ports: {data.scanned_range}", 0, 1)
    pdf.ln(10)

    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Open Ports & Vulnerabilities", 0, 1)
    pdf.ln(5)

    pdf.set_font("Arial", "", 10)
    
    if data.results:
        # Sort results by port number
        sorted_results = sorted(data.results, key=lambda x: x['port'])

        for port_info in sorted_results:
            port = port_info.get('port', 'N/A')
            service = port_info.get('service', 'N/A')
            attack_vector = port_info.get('attack_vector', 'N/A')
            vulnerability_check = port_info.get('vulnerability_check', 'N/A')
            cve_data = port_info.get('cve_data', [])

            pdf.set_font("Arial", "B", 12)
            pdf.cell(0, 10, f"Port {port} - {service}", 0, 1)
            
            pdf.set_font("Arial", "", 10)
            pdf.multi_cell(0, 5, f"    Attack Vector: {attack_vector}", 0, 1)
            pdf.multi_cell(0, 5, f"    Vulnerability: {vulnerability_check}", 0, 1)
            
            if cve_data:
                pdf.set_font("Arial", "B", 10)
                pdf.cell(0, 8, "    Live CVE Data (NIST NVD):", 0, 1)
                pdf.set_font("Arial", "", 9)
                for cve in cve_data:
                    cve_id = cve.get('id', '')
                    desc = cve.get('description', '')
                    pdf.multi_cell(0, 5, f"      - [{cve_id}]: {desc}", 0, 1)

            pdf.ln(5)

    # Save PDF to a temporary file
    temp_pdf_path = "report.pdf"
    pdf.output(temp_pdf_path)
    return temp_pdf_path

@api_router.post("/download/pdf")
async def download_pdf(data: ReportData):
    try:
        temp_pdf_path = await asyncio.to_thread(generate_pdf_sync, data)

        return FileResponse(
            temp_pdf_path,
            media_type="application/pdf",
            filename=f"sentinel_audit_report_{data.target}.pdf"
        )
    except Exception as e:
        print(f"Error generating PDF: {e}")
        return JSONResponse(status_code=500, content={"detail": "Failed to generate PDF report."})

app.include_router(api_router)


# --- Static File Serving (For PC EXE Mode) ---

# Define the path to your frontend build folder (dist)
# Change this path to where your 'dist' folder is located relative to main.py
if getattr(sys, 'frozen', False):
    # PyInstaller extracts bundled files to sys._MEIPASS
    base_dir = sys._MEIPASS
else:
    # Normal execution path (relative from backend/main.py upwards)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

frontend_path = os.path.join(base_dir, "dist")

if os.path.exists(frontend_path):
    # Mount the 'assets' folder specifically for CSS/JS files
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

    # Catch-all route to serve index.html for any frontend navigation
    @app.get("/{rest_of_path:path}")
    async def serve_frontend(rest_of_path: str):
        return FileResponse(os.path.join(frontend_path, "index.html"))
else:
    # If dist doesn't exist yet, show a reminder during development
    @app.get("/")
    def dev_mode():
        return {"message": "Frontend build not found. Run 'npm run build' from the project root."}

import sys
import multiprocessing
import uvicorn
import socket

# ... rest of the imports ...
def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

if __name__ == "__main__":
    # Required for Windows EXE support when using PyInstaller wrapping python multiprocessing
    multiprocessing.freeze_support()
    
    # Run the FastAPI web server
    # Get a dynamic free port or use a specific one
    port = 8000 # Keep fixed for now so Electron knows where to look
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="error")