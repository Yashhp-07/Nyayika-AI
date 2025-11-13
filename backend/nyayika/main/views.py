from django.shortcuts import render,redirect
from django.http import HttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# Create your views here.

def index(request):
    return HttpResponse("Hello, world!")

@csrf_exempt
def analyze(request):
    if request.method == 'POST':
        uploaded_file = request.FILES.get('file')
        language = request.POST.get('language', 'en')
        
        if not uploaded_file:
            return JsonResponse({"message": "No file uploaded."}, status=400)
        if uploaded_file.content_type != 'application/pdf':
            return JsonResponse({"message": "Invalid file type. Only PDFs are allowed."}, status=400)
        
        # Process the file here
        return JsonResponse({
            "message": "File analyzed successfully.", 
            "ok": True,
            "file_name": uploaded_file.name,
            "language": language
        })
    else:
        return JsonResponse({"message": "Invalid request method."}, status=405)