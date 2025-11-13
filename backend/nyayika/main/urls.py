from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze_file, name='analyze'),
    path('', views.index, name= 'index'),    
]