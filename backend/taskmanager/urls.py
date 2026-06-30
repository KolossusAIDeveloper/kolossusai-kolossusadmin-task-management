from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse
from django.conf import settings
import os


def index(request):
    index_path = os.path.join(settings.BASE_DIR, 'react_index.html')
    if os.path.exists(index_path):
        with open(index_path, 'r') as f:
            return HttpResponse(f.read(), content_type='text/html')
    return HttpResponse('<h1>Task Management API</h1><p>API available at /api/</p>')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')),
    # Catch-all for SPA routing — must be last
    re_path(r'^(?!static|admin|api).*$', index),
]
