from django.shortcuts import render,redirect
from django.http import HttpResponse,JsonResponse
from django.views.decorators.csrf import csrf_exempt
import fitz  # PyMuPDF


def extract_text_from_pdf_bytes(pdf_bytes):
    text = ""
    with fitz.open(stream=pdf_bytes, filetype="pdf") as pdf_document:
        for page in pdf_document:
            text += page.get_text()
    return text


# Create your views here.

def index(request):
    return HttpResponse("Hello, world!")

@csrf_exempt
def analyze(request):
    if request.method == 'POST':
        file = request.FILES.get('file')
        language = request.POST.get('language')

        if not file:
            return JsonResponse({"message": "No file uploaded."}, status=400)

        try:
            # Extract text from the uploaded PDF
            pdf_bytes = file.read()
            extracted_text = extract_text_from_pdf_bytes(pdf_bytes)

            # Return the extracted text along with the language
            return JsonResponse({
                "message": "File analyzed successfully.",
                "ok": "true",
                "language": language,
                "extracted_text": extracted_text
            })
        except Exception as e:
            return JsonResponse({"message": f"Error analyzing file: {str(e)}"}, status=500)
    else:
        return JsonResponse({"message": "Invalid request method."}, status=400)