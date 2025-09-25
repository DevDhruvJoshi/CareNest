import os
from src.web.dashboard import create_app
from src.core.config_manager import load_runtime_config


def main() -> None:
    config = load_runtime_config()
    app = create_app(config)

    host = config.get('system', {}).get('host', '0.0.0.0')
    port = int(str(config.get('system', {}).get('port', 5000)))
    debug = bool(config.get('system', {}).get('debug', False))

    app.run(host=host, port=port, debug=debug)


if __name__ == '__main__':
    main()



