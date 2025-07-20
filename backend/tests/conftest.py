import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from tasks.models import Task

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user(db):
    return User.objects.create_user(username="user1", password="senha123")

@pytest.fixture
def auth_client(user):
    client = APIClient()
    # Obter token
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return client

@pytest.fixture
def tasks_factory(user):
    def make(n=1, completed_every=0):
        objs = []
        for i in range(n):
            t = Task.objects.create(
                owner=user,
                title=f"Tarefa {i}",
                description="Desc",
                is_completed=(completed_every and i % completed_every == 0)
            )
            objs.append(t)
        return objs
    return make
