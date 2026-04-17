# 🛡️ Sentinel Audit

![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge) ![React](https://img.shields.io/badge/frontend-React_%2B_Vite-61DAFB?logo=react&logoColor=black&style=for-the-badge) ![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688?logo=fastapi&logoColor=white&style=for-the-badge) [![license: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](./LICENSE)

Sentinel Audit is a robust, web-based port scanning and vulnerability analysis tool. Built with a high-performance **FastAPI backend** and a sleek, modern **React (Vite) frontend**, it provides real-time scanning capabilities over TCP and UDP protocols and automatically generates downloadable PDF reports for security audits.

## License

Distributed under the MIT License. See [LICENSE](./LICENSE) for details.

## Installation

Prerequisites

- Node.js (v18+ recommended)
- Python 3.8+

Backend Setup

```bash
# Create and activate a Virtual Environment
python -m venv venv

# On Windows
.\venv\Scripts\activate
# On Linux/macOS
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn pydantic fpdf
```

Frontend Setup

```bash
# Install dependencies
npm install
```

## Usage / Examples

You can run the frontend and backend concurrently during development:

```bash
# Start both frontend and backend development servers
npm run dev

# Alternatively, run them separately:
npm run dev:frontend
npm run dev:backend
```

Production / Exe Mode

The backend `main.py` is configured to serve static frontend files if a `dist` build is provided.

```bash
# Build the frontend
npm run build
```

1. Move the output `dist` folder into the `backend` folder directory.
2. Run the FastAPI server: `python -m backend.main`
3. Access the complete app directly via `http://localhost:8000/`.

## Features

- **Custom Target Profiling:** Configure scanning targets with specific IP addresses or domain names.
- **Granular Port Selection:** Choose to scan specific port ranges or focus solely on common ports for faster audits.
- **Protocol Flexibility:** Support for both **TCP** and **UDP** port scanning.
- **Hacker/Cyber Aesthetic UI:** Beautiful glassmorphism UI with real-time status logging, built using Tailwind CSS and Framer Motion.
- **PDF Report Generation:** Instantly download a comprehensive, formatted PDF containing scan analysis results, open ports, and potential vulnerabilities.

## Development

Run the development servers:

```bash
# Start concurrently
npm run dev
```

## Acknowledgements

- React, Vite, Tailwind CSS, and Framer Motion for the frontend
- FastAPI, Uvicorn, and FPDF for the backend
