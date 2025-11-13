import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_KEY:
    print("Api key not found")
else:
    try:
        genai.configure(api_key=GEMINI_KEY)
    except Exception as e:
        print("Gemini Configuration Error:",e)


def call_gemini(prompt: str, model: str = "gemini-2.5-flash") -> str:
    try:
        model = genai.GenerativeModel(model)
        response = model.generate_content(prompt)
        return response.text
    
    except Exception as e:
        return f"Failed connecting to Gemini : {e}"

def translate_text(text: str, target_language: str, model: str = "gemini-2.5-flash") -> str:
    prompt = f"""
    You are a highly accurate multilingual translator specializing in legal documents.

    Translate the following text into **{target_language}**.
    - Preserve legal meaning
    - Preserve tone
    - Preserve structure
    - Do not rewrite or summarize

    Text to translate:
    {text}
    """
    return call_gemini(prompt)



