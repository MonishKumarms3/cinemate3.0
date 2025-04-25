"""movie_recommender URL Configuration"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.contrib.staticfiles.views import serve
from django.conf import settings
from django.views.static import serve as static_serve
from django.urls import re_path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
     
   
]
