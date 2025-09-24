import importlib
from fastapi.testclient import TestClient


def test_imports():
    assert importlib.import_module('fastapi') is not None


def test_health_analytics_endpoint():
    app = importlib.import_module('apps.enterprise.main' if importlib.util.find_spec('apps.enterprise.main') else 'main').app  # type: ignore
    client = TestClient(app)
    r = client.get('/api/health-analytics')
    assert r.status_code == 200
    data = r.json()
    assert 'cameras' in data




