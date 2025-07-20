from tasks.models import Task

def test_task_str(user):
    t = Task.objects.create(owner=user, title="Teste", description="Desc")
    assert str(t) == "Teste"
    assert t.is_completed is False
