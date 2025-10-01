# Create a test file: test_gemini.py
from google.generativeai import GenerativeModel
import google.generativeai as genai

genai.configure(api_key="AIzaSyBeHk9-DVj3MBaCtCOqSMYdvTcJ0-FcDAo")

# List available models
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(model.name)