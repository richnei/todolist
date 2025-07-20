import pytest

pytestmark = pytest.mark.django_db

def test_register_returns_tokens(api_client):
    payload = {
        "username": "novo_user",
        "password": "senha123",
        "email": "novo@example.com"
    }
    resp = api_client.post("/api/register/", payload, format="json")
    assert resp.status_code == 201
    data = resp.json()
    assert "access" in data
    assert "refresh" in data
    assert data["user"]["username"] == "novo_user"

def test_login_obtain_token(api_client, user):
    resp = api_client.post("/api/token/", {"username": "user1", "password": "senha123"})
    assert resp.status_code == 200
    assert "access" in resp.json()
