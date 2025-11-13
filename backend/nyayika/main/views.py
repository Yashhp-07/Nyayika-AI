import os
import pdfplumber
import pytesseract
from PIL import Image
from deep_translator import GoogleTranslator
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render,redirect
from django.http import HttpResponse,JsonResponse
import google.generativeai as genai

def index(request):
    if request.method == 'GET':
        return HttpResponse("Home Page")

@csrf_exempt
def analyze_file(request):
    if request.method == 'GET':
        return HttpResponse("Analyze page")
    
    if request.method != 'POST':
        return JsonResponse({"error": "Only Post method allowed"}, status = 450)
    
    uploaded_file = request.FILES.get("file")
    language = request.POST.get("language", "en")

    if not uploaded_file:
        return JsonResponse({"error": "No File uploaded"}, status = 400)
    
    os.makedirs("media", exist_ok = True)
    
    temp_path = os.path.join("media", uploaded_file.name)
    with open(temp_path, "wb+") as dest:
        for chunk in uploaded_file.chunks():
            dest.write(chunk)

    text = extract_text(temp_path)
    print("Extracted Text: ", text[:500])
    os.remove(temp_path)

    return JsonResponse({
        "message" : "File Uploaded successfully",
        "file_name" : uploaded_file.name,
        "language": language,
        "extracted_text": text
    })

def extract_text(path):
    try:
        if path.endswith(".pdf"):
            with pdfplumber.open(path) as pdf:
                return "\n".join([page.extract_text() or "" for page in pdf.pages])
        
        elif path.endswith((".jpg", ".jpeg", ".png")):
            image = Image.open(path)
            return pytesseract.image_to_string(image)
        else:
            return "Unsupported File type"
    except Exception as e:
        return f"Error reading file: {str(e)}"
        
