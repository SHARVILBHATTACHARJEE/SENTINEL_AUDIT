# 🛡️ Sentinel Audit

> **Professional Port Scanner & Vulnerability Analyzer**

Sentinel Audit is a robust, web-based port scanning and vulnerability analysis tool. Built with a high-performance **FastAPI backend** and a sleek, modern **React (Vite) frontend**, it provides real-time scanning capabilities over TCP and UDP protocols and automatically generates downloadable PDF reports for security audits.

![Sentinel Audit UI UI](https://img.shields.io/badge/Status-Active-brightgreen) ![React](https://img.shields.io/badge/frontend-React_%2B_Vite-61DAFB?logo=react&logoColor=black) ![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688?logo=fastapi&logoColor=white) 

---

## ✨ Features

- **Custom Target Profiling:** Configure scanning targets with specific IP addresses or domain names.
- **Granular Port Selection:** Choose to scan specific port ranges or focus solely on common ports for faster audits.
- **Protocol Flexibility:** Support for both **TCP** and **UDP** port scanning.
- **Hacker/Cyber Aesthetic UI:** Beautiful glassmorphism UI with real-time status logging, built using Tailwind CSS and Framer Motion.
- **PDF Report Generation:** Instantly download a comprehensive, formatted PDF containing scan analysis results, open ports, and potential vulnerabilities.

## 🛠️ Technology Stack

**Frontend:**
- **[React](https://reactjs.org/)** (powered by Vite)
- **Tailwind CSS** (for utility-first, responsive styling)
- **Framer Motion** (for smooth UI animations)
- **Lucide React** (for modern, crisp iconography)

**Backend:**
- **[FastAPI](https://fastapi.tiangolo.com/)** (High-performance web framework)
- **Uvicorn** (ASGI web server)
- **FPDF** (for PDF report creation)
- **Pydantic** (for data validation)

---

## 🚀 Getting Started

You can run the frontend and backend on separate terminals during development.

### Prerequisites

- Node.js (v18+ recommended)
- Python 3.8+

### 1. Backend Setup

Open a terminal and navigate to the project directory:

```bash
# Create and activate a Virtual Environment
python -m venv venv
# On Windows
.\venv\Scripts\activate
# On Linux/macOS
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic fpdf

# Run the FastAPI server
python -m backend.main
```

*The backend server will start on `http://localhost:8000`.*

### 2. Frontend Setup

Open a separate terminal and navigate to the `frontend` folder:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

*The frontend will typically run on `http://localhost:5173`. Open this URL in your browser to access Sentinel Audit.*

## 📦 Production / Exe Mode

The backend `main.py` is configured to serve static frontend files if a `dist` build is provided. 

1. Simply run `npm run build` inside the `frontend` directory.
2. Move the output `dist` folder into the `backend` folder directory.
3. Access the complete app directly via `http://localhost:8000/`.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
