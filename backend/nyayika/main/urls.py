from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),  # Fixed the root path
    path('analyze/', views.analyze, name='analyze_file'),
]