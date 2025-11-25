import os
import pdfplumber
import pytesseract
import json
from PIL import Image
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render,redirect
from django.http import HttpResponse,JsonResponse, StreamingHttpResponse
from .utils import generate_summary, generate_summary_stream
from .utils import translate_text, translate_text_stream


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
    print("Extracting text")
    os.remove(temp_path)

    # Translation will be streamed separately from frontend
    # translated = translate_text(text, language)
    # print("Translated text: ",translated)

    # Summary will be streamed separately from frontend
    # summary = generate_summary(text)
    # print("Generated Summary: ", summary)
    
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

@csrf_exempt
def stream_summary(request):
    """Endpoint to stream summary in chunks"""
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST method allowed"}, status=405)
    
    text = request.POST.get('text')
    
    if not text:
        return JsonResponse({"error": "No text provided"}, status=400)

    def event_stream():
        try:
            for chunk in generate_summary_stream(text):
                # Send as server-sent events
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'  # Disable buffering for Nginx
    return response

@csrf_exempt
def stream_translation(request):
    """Endpoint to stream translation in chunks"""
    if request.method != 'POST':
        return JsonResponse({"error": "Only POST method allowed"}, status=405)
    
    text = request.POST.get('text')
    language = request.POST.get('language', 'en')
    
    if not text:
        return JsonResponse({"error": "No text provided"}, status=400)

    def event_stream():
        try:
            for chunk in translate_text_stream(text, language):
                # Send as server-sent events
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'  # Disable buffering for Nginx
    return response