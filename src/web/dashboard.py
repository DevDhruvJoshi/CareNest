from typing import Any, Dict
import os

from flask import Flask, jsonify, render_template


def create_app(config: Dict[str, Any]) -> Flask:
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
    template_dir = os.path.join(base_dir, 'templates')
    static_dir = os.path.join(base_dir, 'static')
    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
    # Debug: log resolved template/static directories
    try:
        print(f"[dashboard] template_dir={template_dir}")
        print(f"[dashboard] static_dir={static_dir}")
        if os.path.isdir(template_dir):
            print(f"[dashboard] templates entries={os.listdir(template_dir)}")
    except Exception:
        pass

    @app.get('/')
    def index():
        return render_template('dashboard.html')

    @app.get('/health')
    def health():
        return jsonify({
            'status': 'ok',
            'env': config.get('env', {}),
            'system': config.get('system', {}),
        })

    @app.get('/_debug')
    def _debug():
        return jsonify({
            'template_dir': template_dir,
            'static_dir': static_dir,
            'templates_list': os.listdir(template_dir) if os.path.isdir(template_dir) else None,
        })

    return app


