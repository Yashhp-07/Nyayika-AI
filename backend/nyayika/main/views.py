import os
import pdfplumber
import pytesseract
from PIL import Image
from docx import Document
from googletrans import Translator
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import render,redirect
from django.http import HttpResponse
import google.generativeai as genai

