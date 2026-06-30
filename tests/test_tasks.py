import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taskmanager.settings')

import django
django.setup()

from django.test import TestCase, Client
from tasks.models import Task, Comment
import json


@pytest.mark.django_db
def test_task_creation():
    task = Task.objects.create(title='Test Task', priority='high', status='todo')
    assert task.id is not None
    assert task.title == 'Test Task'
    assert task.priority == 'high'
    assert task.status == 'todo'


@pytest.mark.django_db
def test_task_status_choices():
    task = Task.objects.create(title='Task 2', status='inprogress')
    assert task.status == 'inprogress'
    task.status = 'done'
    task.save()
    assert Task.objects.get(pk=task.id).status == 'done'


@pytest.mark.django_db
def test_task_with_due_date():
    from datetime import date
    task = Task.objects.create(title='Due Task', due_date=date(2024, 12, 31))
    assert task.due_date == date(2024, 12, 31)


@pytest.mark.django_db
def test_comment_creation():
    task = Task.objects.create(title='Task with comment')
    comment = Comment.objects.create(task=task, author='Alice', text='This is a comment')
    assert comment.id is not None
    assert comment.task == task
    assert comment.author == 'Alice'


@pytest.mark.django_db
def test_api_list_tasks():
    client = Client()
    Task.objects.create(title='API Task 1', status='todo')
    Task.objects.create(title='API Task 2', status='done')
    response = client.get('/api/tasks/')
    assert response.status_code == 200
    data = json.loads(response.content)
    assert len(data) >= 2


@pytest.mark.django_db
def test_api_create_task():
    client = Client()
    payload = json.dumps({'title': 'New API Task', 'priority': 'medium', 'status': 'todo'})
    response = client.post('/api/tasks/', payload, content_type='application/json')
    assert response.status_code == 201
    data = json.loads(response.content)
    assert data['title'] == 'New API Task'


@pytest.mark.django_db
def test_api_filter_by_status():
    client = Client()
    Task.objects.create(title='Todo Task', status='todo')
    Task.objects.create(title='Done Task', status='done')
    response = client.get('/api/tasks/?status=todo')
    assert response.status_code == 200
    data = json.loads(response.content)
    assert all(t['status'] == 'todo' for t in data)


@pytest.mark.django_db
def test_api_delete_task():
    client = Client()
    task = Task.objects.create(title='To Delete')
    response = client.delete(f'/api/tasks/{task.id}/')
    assert response.status_code == 204
    assert not Task.objects.filter(pk=task.id).exists()
