import math

def test_create_task(auth_client):
    resp = auth_client.post("/api/tasks/", {"title": "Primeira", "description": "Algo"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["title"] == "Primeira"
    assert data["is_completed"] is False

def test_list_tasks_pagination(auth_client, tasks_factory):
    tasks_factory(n=15)
    resp = auth_client.get("/api/tasks/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] == 15
    assert len(data["results"]) == 10  
    resp2 = auth_client.get("/api/tasks/?page=2")
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert len(data2["results"]) == 5

def test_filter_completed(auth_client, tasks_factory):
    tasks_factory(n=6, completed_every=2)  
    resp = auth_client.get("/api/tasks/?is_completed=true")
    assert resp.status_code == 200
    data = resp.json()
    returned_titles = {t["title"] for t in data["results"]}
    assert returned_titles.issuperset({"Tarefa 0", "Tarefa 2", "Tarefa 4"})
    for t in data["results"]:
        assert t["is_completed"] is True

def test_toggle_completion(auth_client):
    create = auth_client.post("/api/tasks/", {"title": "Toggle Test"})
    tid = create.json()["id"]
    patch = auth_client.patch(f"/api/tasks/{tid}/", {"is_completed": True}, format="json")
    assert patch.status_code == 200
    assert patch.json()["is_completed"] is True

def test_update_title_description(auth_client):
    create = auth_client.post("/api/tasks/", {"title": "Old", "description": "X"})
    tid = create.json()["id"]
    upd = auth_client.patch(f"/api/tasks/{tid}/", {"title": "New", "description": "Nova"})
    assert upd.status_code == 200
    assert upd.json()["title"] == "New"
    assert upd.json()["description"] == "Nova"

def test_delete_task(auth_client):
    create = auth_client.post("/api/tasks/", {"title": "Apagar"})
    tid = create.json()["id"]
    resp_del = auth_client.delete(f"/api/tasks/{tid}/")
    assert resp_del.status_code == 204
    list_resp = auth_client.get("/api/tasks/")
    assert all(t["id"] != tid for t in list_resp.json()["results"])
