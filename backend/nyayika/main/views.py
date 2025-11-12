from django.shortcuts import render,redirect
from django.http import HttpResponse,JsonResponse

# Create your views here.

def index(request):
    return HttpResponse("Hello, world!")


def analyze(request):
    if request.method == 'POST':
        # Handle file analysis logic here
        return JsonResponse({"message": "File analyzed successfully.","ok": "true"})
    else:
        return JsonResponse({"message": "Invalid request method."}, status=400)