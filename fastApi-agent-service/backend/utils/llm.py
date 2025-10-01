from langchain_google_genai import ChatGoogleGenerativeAI
from backend.config import main as config

print("config.GEMINI_API_KEY", config.GEMINI_API_KEY)

# Main LLM - Use gemini-2.0-flash (stable and available)
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",  # From your available models list
    google_api_key=config.GEMINI_API_KEY,
    temperature=0.3,
    # max_output_tokens=2048,
)

# Health-specific LLM
health_llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",  # From your available models list
    google_api_key=config.GEMINI_API_KEY,
    temperature=0.3,
    # max_output_tokens=4096,
)

print("LLMs initialized successfully with gemini-2.0-flash-001!")