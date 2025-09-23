from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
import yaml
import os


BASE_DIR = Path(__file__).resolve().parent


def load_config() -> dict:
    config_path = BASE_DIR / "config.yaml"
    data: dict = {}
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
    # env overrides (simple flat for demo)
    app_env = os.getenv("APP_ENV", "local")
    data.setdefault("system", {})
    data["system"].setdefault("env", app_env)
    return data


app = FastAPI(title="CareNest Enterprise")


static_dir = BASE_DIR / "static"
templates_dir = BASE_DIR / "templates"
static_dir.mkdir(parents=True, exist_ok=True)
templates_dir.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/", response_class=HTMLResponse)
def dashboard_home(request: Request):
    cfg = load_config()
    html = f"""
    <!DOCTYPE html>
    <html lang=\"gu\">
      <head>
        <meta charset=\"utf-8\" />
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
        <title>CareNest ડેશબોર્ડ</title>
        <style>
          body {{ background:#000; color:#fff; font-family:Arial,sans-serif; }}
          .wrap {{ max-width: 900px; margin: 40px auto; padding: 16px; }}
          h1 {{ font-size: 32px; margin-bottom: 8px; }}
          .card {{ background:#111; border:1px solid #222; border-radius:8px; padding:16px; margin-top:16px; }}
          .kpi {{ font-size: 24px; }}
        </style>
      </head>
      <body>
        <div class=\"wrap\">
          <h1>CareNest — કુટુંબ ડેશબોર્ડ</h1>
          <div class=\"card\">
            <div class=\"kpi\">સ્થિતિ: સુરક્ષિત</div>
            <div>પર્યાવરણ: {cfg.get('system', {}).get('env')}</div>
          </div>
        </div>
      </body>
    </html>
    """
    return HTMLResponse(content=html)


class Alert(BaseModel):
    level: str
    message: str


@app.get("/api/health-status")
def get_health_status():
    # placeholder values
    return {
        "status": "ok",
        "fallDetection": False,
        "breathingRate": 16,
        "postureScore": 0.8,
    }


@app.get("/api/system-status")
def get_system_status():
    cfg = load_config()
    return {"uptime": "unknown", "env": cfg.get("system", {}).get("env")}


@app.post("/api/alerts")
def post_alert(alert: Alert):
    # stub: log or enqueue alert
    return {"accepted": True, "level": alert.level}


