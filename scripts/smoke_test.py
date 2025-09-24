from src.web.dashboard import create_app
from src.core.config_manager import load_runtime_config


def main() -> None:
    app = create_app(load_runtime_config())
    print('template searchpath:', getattr(app.jinja_loader, 'searchpath', None))
    with app.test_client() as client:
        r = client.get('/')
        print('GET / ->', r.status_code)
        print('HTML head:', r.data[:120])
        r2 = client.get('/health')
        print('GET /health ->', r2.status_code, r2.json)


if __name__ == '__main__':
    main()


