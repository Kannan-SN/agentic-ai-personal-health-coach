import google.generativeai as genai
from backend.config import main as config # Assuming this is how you get your API key

genai.configure(api_key=config.GEMINI_API_KEY)

for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(m.name)