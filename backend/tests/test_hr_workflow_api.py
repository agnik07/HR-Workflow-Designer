"""
Backend API tests for HR Workflow Designer.
Covers: automations, validate, simulate, workflows CRUD.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://hrflow-designer.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _valid_graph():
    s = {"id": "n1", "type": "start", "data": {"title": "Start"}, "position": {"x": 0, "y": 0}}
    t = {"id": "n2", "type": "task", "data": {"title": "Do thing", "assignee": "HR"}, "position": {"x": 200, "y": 0}}
    e = {"id": "n3", "type": "end", "data": {"title": "End", "endMessage": "Done"}, "position": {"x": 400, "y": 0}}
    edges = [
        {"id": "e1", "source": "n1", "target": "n2"},
        {"id": "e2", "source": "n2", "target": "n3"},
    ]
    return {"nodes": [s, t, e], "edges": edges}


# ---------- Automations ----------
class TestAutomations:
    def test_list_automations(self, client):
        r = client.get(f"{API}/automations")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 5
        ids = [a["id"] for a in data]
        for expected in ["send_email", "generate_doc", "notify_hr", "create_ticket", "provision_access"]:
            assert expected in ids
        for a in data:
            assert "label" in a and "params" in a and isinstance(a["params"], list)


# ---------- Validate ----------
class TestValidate:
    def test_valid_graph(self, client):
        r = client.post(f"{API}/validate", json=_valid_graph())
        assert r.status_code == 200
        body = r.json()
        assert body["valid"] == True
        assert body["errors"] == []

    def test_invalid_no_start(self, client):
        g = _valid_graph()
        g["nodes"] = [n for n in g["nodes"] if n["type"] != "start"]
        r = client.post(f"{API}/validate", json=g)
        assert r.status_code == 200
        body = r.json()
        assert body["valid"] == False
        assert any("Start" in e for e in body["errors"])

    def test_empty(self, client):
        r = client.post(f"{API}/validate", json={"nodes": [], "edges": []})
        assert r.status_code == 200
        assert r.json()["valid"] == False


# ---------- Simulate ----------
class TestSimulate:
    def test_simulate_success(self, client):
        r = client.post(f"{API}/simulate", json=_valid_graph())
        assert r.status_code == 200
        body = r.json()
        assert body["success"] == True
        assert isinstance(body["logs"], list)
        assert len(body["logs"]) > 0
        for log in body["logs"]:
            assert "level" in log and "message" in log and "timestamp" in log

    def test_simulate_invalid_returns_400(self, client):
        r = client.post(f"{API}/simulate", json={"nodes": [], "edges": []})
        assert r.status_code == 400
        body = r.json()
        assert body["success"] == False
        assert isinstance(body["errors"], list) and len(body["errors"]) > 0


# ---------- Workflow CRUD ----------
class TestWorkflowsCRUD:
    created_ids = []

    def test_create_workflow(self, client):
        payload = {
            "name": f"TEST_wf_{uuid.uuid4().hex[:8]}",
            "description": "Test workflow",
            **_valid_graph(),
        }
        r = client.post(f"{API}/workflows", json=payload)
        assert r.status_code == 201, r.text
        data = r.json()
        assert "id" in data
        assert "_id" not in data  # Ensure no Mongo ObjectId leaked
        assert "__v" not in data
        assert data["name"] == payload["name"]
        assert len(data["nodes"]) == 3
        TestWorkflowsCRUD.created_ids.append(data["id"])

    def test_create_workflow_missing_name(self, client):
        r = client.post(f"{API}/workflows", json={"description": "no name"})
        assert r.status_code == 400
        assert "error" in r.json()

    def test_list_workflows(self, client):
        r = client.get(f"{API}/workflows")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        for wf in data:
            assert "_id" not in wf
            assert "id" in wf

    def test_get_workflow_by_id(self, client):
        assert TestWorkflowsCRUD.created_ids, "no workflow created"
        wf_id = TestWorkflowsCRUD.created_ids[0]
        r = client.get(f"{API}/workflows/{wf_id}")
        assert r.status_code == 200
        assert r.json()["id"] == wf_id

    def test_get_missing_workflow_returns_404(self, client):
        r = client.get(f"{API}/workflows/does-not-exist-{uuid.uuid4()}")
        assert r.status_code == 404

    def test_update_workflow(self, client):
        assert TestWorkflowsCRUD.created_ids
        wf_id = TestWorkflowsCRUD.created_ids[0]
        new_name = f"TEST_updated_{uuid.uuid4().hex[:6]}"
        r = client.put(f"{API}/workflows/{wf_id}", json={"name": new_name})
        assert r.status_code == 200
        assert r.json()["name"] == new_name
        # Verify persistence
        g = client.get(f"{API}/workflows/{wf_id}").json()
        assert g["name"] == new_name

    def test_delete_workflow(self, client):
        assert TestWorkflowsCRUD.created_ids
        wf_id = TestWorkflowsCRUD.created_ids[0]
        r = client.delete(f"{API}/workflows/{wf_id}")
        assert r.status_code == 200
        assert r.json().get("deleted") == True
        # Verify gone
        g = client.get(f"{API}/workflows/{wf_id}")
        assert g.status_code == 404

    def test_delete_missing_returns_404(self, client):
        r = client.delete(f"{API}/workflows/missing-{uuid.uuid4()}")
        assert r.status_code == 404
