from langchain_google_genai import ChatGoogleGenerativeAI
from backend.config import main as config

# Safety settings using integer values
# HarmCategory enum: HARASSMENT=0, HATE_SPEECH=1, SEXUALLY_EXPLICIT=2, DANGEROUS_CONTENT=3
# HarmBlockThreshold enum: BLOCK_NONE=0, BLOCK_ONLY_HIGH=1, BLOCK_MEDIUM_AND_ABOVE=2, BLOCK_LOW_AND_ABOVE=3

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash-latest", 
    google_api_key=config.GEMINI_API_KEY,
    temperature=0.3,  
    max_output_tokens=2048,
    safety_settings={
        0: 0,  # HARM_CATEGORY_HARASSMENT: BLOCK_NONE
        1: 0,  # HARM_CATEGORY_HATE_SPEECH: BLOCK_NONE
        2: 0,  # HARM_CATEGORY_SEXUALLY_EXPLICIT: BLOCK_NONE
        3: 2   # HARM_CATEGORY_DANGEROUS_CONTENT: BLOCK_MEDIUM_AND_ABOVE
    }
)

health_llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash-latest",
    google_api_key=config.GEMINI_API_KEY,
    temperature=0.1,  
    max_output_tokens=1024,
    safety_settings={
        0: 0,  # HARM_CATEGORY_HARASSMENT: BLOCK_NONE
        1: 0,  # HARM_CATEGORY_HATE_SPEECH: BLOCK_NONE
        2: 0,  # HARM_CATEGORY_SEXUALLY_EXPLICIT: BLOCK_NONE
        3: 3   # HARM_CATEGORY_DANGEROUS_CONTENT: BLOCK_LOW_AND_ABOVE
    }
)