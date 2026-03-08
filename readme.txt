RUN BACKEND AND FRONTEND ON SEPARATE TERMINALS:

FOR BACKEND GO IN THE TECHNICAL FOLDER RIGHT CLICK OPEN TERMINAL

Enter: py -m venv venv
       .\venv\Scripts\activate
       pip install fastapi uvicorn pydantic
       py -m backend.main

FOR FRONTEND GO IN THE FRONTEND FOLDER RIGHT CLICK OPEN TERMINAL

Enter: npm install
       npm run dev