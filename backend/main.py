from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
from dotenv import load_dotenv
import os
from google import genai
from google.genai import types
from pydantic import BaseModel


class ConfirmRequest(BaseModel):
    confirmed: bool


load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="ConneX AI Operator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = Path(__file__).parent / "mock_data.json"
pending_action = None


def load_data():
    with open(DATA_FILE, "r") as file:
        return json.load(file)


def search_leads(query: str):
    data = load_data()
    query = query.lower()

    return [
        lead for lead in data["leads"]
        if query in lead["name"].lower()
        or query in lead["company"].lower()
        or query in lead["status"].lower()
    ]


def create_task(title: str, due: str, related_to: str):
    data = load_data()

    task = {
        "id": len(data["tasks"]) + 1,
        "title": title,
        "due": due,
        "related_to": related_to
    }

    data["tasks"].append(task)

    with open(DATA_FILE, "w") as file:
        json.dump(data, file, indent=2)

    return task


search_leads_declaration = types.FunctionDeclaration(
    name="search_leads",
    description="Search CRM leads by name, company, or status. This is read-only.",
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "The name, company, or status to search for."
            }
        },
        "required": ["query"]
    }
)


create_task_declaration = types.FunctionDeclaration(
    name="create_task",
    description="Create a new CRM task. This changes data and requires user confirmation.",
    parameters={
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "due": {"type": "string"},
            "related_to": {"type": "string"}
        },
        "required": ["title", "due", "related_to"]
    }
)


tools = types.Tool(
    function_declarations=[
        search_leads_declaration,
        create_task_declaration
    ]
)


@app.get("/")
def home():
    return {"message": "ConneX AI Operator is running!"}


@app.post("/chat")
def chat(message: str):

    global pending_action

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=message,
        config=types.GenerateContentConfig(
            tools=[tools],
            automatic_function_calling={"disable": True},
            system_instruction="""
You are the ConneX AI Operator.

RULES:

1. For questions about leads, ALWAYS use the search_leads tool.

2. For requests to create a task, ALWAYS use the create_task tool.

3. NEVER simply describe or pretend to perform a tool action.

4. NEVER say a task was created unless the backend confirms it.

5. Never invent CRM data.

"""
        )
    )

    for part in response.candidates[0].content.parts:

        if part.function_call:

            function_call = part.function_call
            function_name = function_call.name
            arguments = dict(function_call.args)

            # READ-ONLY TOOL
            if function_name == "search_leads":

                results = search_leads(arguments["query"])

                tool_response = types.Part.from_function_response(
                    name=function_name,
                    response={"results": results}
                )

                final_response = client.models.generate_content(
                    model="gemini-3.5-flash-lite",
                    contents=[
                        message,
                        response.candidates[0].content,
                        tool_response
                    ],
                    config=types.GenerateContentConfig(
                        automatic_function_calling={"disable": True}
                    )
                )

                return {"reply": final_response.text}

            if function_name == "create_task":

                pending_action = {
                    "title": arguments["title"],
                    "due": arguments["due"],
                    "related_to": arguments["related_to"]
                }

                return {
                    "reply": (
                        f"I can create this task:\n\n"
                        f"Task: {arguments['title']}\n"
                        f"Due: {arguments['due']}\n"
                        f"Related to: {arguments['related_to']}\n\n"
                        f"Would you like me to create it?"
                    ),
                    "confirmation_required": True
                }

    return {"reply": response.text}


@app.post("/confirm")
def confirm(request: ConfirmRequest):

    global pending_action

    if pending_action is None:
        return {"reply": "There is no pending action."}

    if not request.confirmed:
        pending_action = None
        return {"reply": "Okay, I won't create the task."}

    task = create_task(
        pending_action["title"],
        pending_action["due"],
        pending_action["related_to"]
    )

    pending_action = None

    return {
        "reply": f"Done! Task '{task['title']}' has been created."
    }
