from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze_file, name='analyze'),
    path('', views.index, name= 'index'),    
    path('stream_summary/', views.stream_summary, name='stream_summary'),
    path('stream_translation/', views.stream_translation, name='stream_translation'),
    path('chatbot/', views.chatbot, name='chatbot'),
]