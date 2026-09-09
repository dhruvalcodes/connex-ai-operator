# ConneX AI Operator

**An AI-powered CRM operator prototype built for the NexCell Solutions AI Engineer probationary challenge.**

ConneX lets users interact with CRM data using natural language. A real Gemini model decides which operation is needed, while the backend tools perform the actual data operations against a safe, local mock CRM dataset.

> **Core principle:** The model talks. Code operates.

## Overview

This prototype demonstrates an AI-agent workflow where:

- Users interact with CRM data through natural language.
- Gemini selects the appropriate typed tool.
- Read operations retrieve information from mock CRM data.
- Write operations require explicit user confirmation.
- Backend code performs the actual data changes.
- Tool results are returned before the AI provides the final response.

No real customer, client, or production CRM data is used.

## Features

- Real Gemini-powered conversational AI
- Typed tool calling
- Read-only CRM lead search
- Task creation with explicit confirmation
- Local JSON mock CRM dataset
- React chat interface
- Markdown-formatted AI responses
- AI thinking/loading state
- Clear error handling
- Confirmation-first write operations

## Architecture

```text
User
  ↓
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
User Response
```

The AI decides what operation is required, but the backend code is responsible for actually reading or modifying the data.

## Tools

### `search_leads`

**Type:** Ask / Read-only

Searches the mock CRM dataset by:

- Lead name
- Company
- Status

This operation does not modify any data.

### `create_task`

**Type:** Run / Write

Creates a new task in the mock CRM dataset.

Write operations require explicit user confirmation before execution.

User request
↓
AI proposes action
↓
User confirms
↓
Backend executes tool
↓
Task is created

If the user cancels, no data is changed.

## Safety Principles

The prototype follows these principles:

1. **The model talks, code operates.**
2. **Write operations require explicit confirmation.**
3. **CRM information comes only from the mock dataset.**
4. **The system does not claim an action succeeded unless the backend confirms it.**
5. **Failures are surfaced clearly.**
6. **No real CRM or customer data is used.**

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | CSS |
| Markdown | React Markdown |
| Backend | Python + FastAPI |
| Validation | Pydantic |
| AI | Google Gemini API |
| Tool Calling | Gemini Function Calling |
| Data | Local JSON |

**Model:** `gemini-3.5-flash-lite`

```text
## Project Structure
connex-ai-operator/
│
├── backend/
│   ├── main.py
│   ├── mock_data.json
│   ├── requirements.txt
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── ...
│
├── README.md
└── .gitignore
```
The Gemini API key is stored locally in a `.env` file and excluded from Git.


## Running Locally

### 1. Clone the repository

    git clone https://github.com/dhruvalcodes/connex-ai-operator.git
    cd connex-ai-operator

### 2. Start the backend

    cd backend
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt

Create a `.env` file inside the `backend` folder:

    GEMINI_API_KEY=your_api_key_here

Start the backend:

    uvicorn main:app --reload

Backend:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 3. Start the frontend

Open a second terminal:

    cd frontend
    npm install
    npm run dev

Open the Vite URL shown in the terminal, normally:

`http://localhost:5173`

## Example Interaction

### Read Operation

**User:**

> How many new leads do we have?

**ConneX:**

> You have 2 new leads:
>
> 1. **Aisha Khan** — TechFlow
> 2. **Sofia Patel** — DataWorks

### Write Operation

**User:**

> Create a task to call Aisha Khan on Friday.

**ConneX:**

> I can create this task:
>
> **Task:** Call Aisha Khan  
> **Due:** Friday  
> **Related to:** Aisha Khan
>
> Would you like me to create it?

The task is only created after the user selects **Confirm**.

## Future Development

Potential next steps for a production implementation:

- Connect tools to real ConneX APIs
- Authentication and permission checks
- Audit logging
- Additional CRM tools
- Conversation and session management
- Streaming AI responses
- Automated testing
- Production deployment
- More robust tool validation and error handling

## Project Scope

This prototype uses an **invented mock CRM dataset** for demonstration purposes.

It is not connected to:

- Production ConneX systems
- Real customer information
- Client databases
- External CRM accounts

The purpose of this project is to demonstrate an AI operator architecture with typed tools and safe, confirmation-first actions.

## Author

**Dhruval Prajapati**

BSc Computer Science (Artificial Intelligence) — Brunel University London

Built for the **NexCell Solutions AI Engineer Intern Task-1 **.