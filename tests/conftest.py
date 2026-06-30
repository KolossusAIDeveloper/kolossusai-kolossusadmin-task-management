import django
from django.conf import settings
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ['DJANGO_SETTINGS_MODULE'] = 'taskmanager.settings'
django.setup()
