ConneX AI Operator

A small working prototype of an AI-powered CRM operator built for the NexCell Solutions probationary challenge.

ConneX allows users to interact with a CRM through natural language. The AI can search mock CRM data and propose actions, while the backend code is responsible for actually reading and modifying the data.

Features

* Natural-language chat interface
* Real Gemini language model integration
* Typed tool calling
* Read-only CRM lead search
* Task creation with explicit user confirmation
* Mock CRM dataset stored locally as JSON
* Markdown-formatted AI responses
* Loading/thinking state
* Clear error handling
* Clean ConneX-style interface

Architecture

React Frontend
      ↓
FastAPI Backend
      ↓
Gemini AI Model
      ↓
Typed Tools
      ↓
Mock CRM Data
      ↓
Tool Result
      ↓
Gemini
      ↓
User

The model decides which tool is required, but the backend code performs the actual operation.

Tools

1. search_leads

Type: Ask / Read-only

Searches the mock CRM leads by:

* Name
* Company
* Status

This tool does not modify any data.

2. create_task

Type: Run / Write

Creates a new task in the mock CRM dataset.

Because this is a write operation, ConneX never executes it silently. The AI first presents the proposed task to the user and asks for explicit confirmation.

User request
     ↓
AI proposes task
     ↓
User confirms
     ↓
Backend creates task

If the user cancels, no data is changed.

Safety Rules

The prototype follows these principles:

1. The model talks, code operates.
2. Write actions require explicit confirmation.
3. The AI does not invent CRM data.
4. Tool failures are surfaced clearly.
5. Only mock data is used.

No real ConneX, client, or production CRM data is connected to this prototype.

Technology Stack

Frontend

* React
* Vite
* React Markdown
* CSS

Backend

* Python
* FastAPI
* Pydantic
* Google Gemini API

Data

* Local JSON mock dataset

Project Structure

connex-ai-operator/
│
├── backend/
│   ├── main.py
│   ├── mock_data.json
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── ...
│
└── README.md

Running Locally

1. Clone the repository

git clone <YOUR-GITHUB-REPOSITORY-URL>
cd connex-ai-operator

2. Start the backend

cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

Create a .env file:

GEMINI_API_KEY=your_api_key_here

Then start FastAPI:

uvicorn main:app --reload

The backend will run at:

http://127.0.0.1:8000

3. Start the frontend

Open another terminal:

cd frontend
npm install
npm run dev

Then open the local Vite URL shown in the terminal, normally:

http://localhost:5173

Example Interactions

Read operation

User:
How many new leads do we have?
ConneX:
You have 2 new leads:
1. Aisha Khan from TechFlow
2. Sofia Patel from DataWorks

Write operation

User:
Create a task to call Aisha Khan on Friday.
ConneX:
I can create this task:
Task: Call Aisha Khan
Due: Friday
Related to: Aisha Khan
Would you like me to create it?
User:
Confirm
ConneX:
Done! Task 'Call Aisha Khan' has been created.

Next Build Steps

If developed further, the next steps would include:

* Connecting the tools to real ConneX APIs
* Authentication and permission checks
* Audit logging
* More CRM tools such as updating leads and retrieving tasks
* Improved conversation/session management
* Streaming AI responses
* Production deployment
* More comprehensive automated testing

Disclaimer

This prototype is for demonstration purposes only and uses an invented mock CRM dataset. It is not connected to production systems or real customer data.
