from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from fpdf import FPDF
from datetime import datetime
from typing import List, Dict, Any
import os
import multiprocessing
import uvicorn

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

@api_router.post("/scan")
def run_scan(request: ScanRequest):
    scanner = PortScanner()
    results = scanner.scan_target(
        request.target, 
        request.start_port, 
        request.end_port,
        request.scan_tcp,
        request.scan_udp,
        request.common_ports_only
    )
    
    scanned_range = "Common Ports" if request.common_ports_only else f"{request.start_port}-{request.end_port}"

    return {
        "target": request.target,
        "scanned_range": scanned_range,
        "results": results
    }

@api_router.post("/download/pdf")
def download_pdf(data: ReportData):
    try:
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

                pdf.set_font("Arial", "B", 12)
                pdf.cell(0, 10, f"Port {port} - {service}", 0, 1)
                
                pdf.set_font("Arial", "", 10)
                pdf.multi_cell(0, 5, f"    Attack Vector: {attack_vector}", 0, 1)
                pdf.multi_cell(0, 5, f"    Vulnerability: {vulnerability_check}", 0, 1)
                pdf.ln(5)


        # Save PDF to a temporary file
        temp_pdf_path = "report.pdf"
        pdf.output(temp_pdf_path)

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
frontend_path = os.path.join(os.path.dirname(__file__), "dist")

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
        return {"message": "Frontend build not found. Run 'npm run build' and move 'dist' to the backend folder."}

if __name__ == "__main__":
    # Required for Windows EXE support when using PyInstaller
    multiprocessing.freeze_support()
    
    # Run server on port 8000
    # Set reload=False when running as a packaged application
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)