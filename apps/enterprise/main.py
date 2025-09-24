from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, Response, PlainTextResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
import io
import yaml
import os
import threading
import time
from typing import Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware
import requests
import subprocess
import shutil
from urllib.parse import urlparse
try:
    import mediapipe as mp  # type: ignore
except Exception:
    mp = None  # type: ignore

try:
    import cv2  # type: ignore
    import numpy as np  # type: ignore
except Exception:
    cv2 = None  # type: ignore
    np = None  # type: ignore

try:
    import onnxruntime as ort  # type: ignore
except Exception:
    ort = None  # type: ignore

try:
    from ultralytics import YOLO  # type: ignore
except Exception:
    YOLO = None  # type: ignore


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

# CORS for web app (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


static_dir = BASE_DIR / "static"
templates_dir = BASE_DIR / "templates"
static_dir.mkdir(parents=True, exist_ok=True)
templates_dir.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


#########################
# Prometheus /metrics    #
#########################
_process_start = time.time()
_request_count = 0

@app.middleware("http")
async def _metrics_middleware(request: Request, call_next):
    global _request_count
    _request_count += 1
    return await call_next(request)

@app.get("/metrics")
def metrics():
    uptime = time.time() - _process_start
    # Basic text exposition format
    content = []
    content.append("# HELP app_uptime_seconds Process uptime in seconds")
    content.append("# TYPE app_uptime_seconds counter")
    content.append(f"app_uptime_seconds {uptime:.0f}")
    content.append("# HELP app_requests_total Total HTTP requests")
    content.append("# TYPE app_requests_total counter")
    content.append(f"app_requests_total {_request_count}")
    return PlainTextResponse("\n".join(content) + "\n")


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


#########################
# Gujarati TTS & Voice   #
#########################
try:
    from gtts import gTTS  # type: ignore
except Exception:
    gTTS = None  # type: ignore


class TtsReq(BaseModel):
    text: str
    lang: str = "gu"


@app.post('/api/tts')
def tts(req: TtsReq):
    if gTTS is None:
        return JSONResponse({"error": "TTS not available"}, status_code=503)
    try:
        buf = io.BytesIO()
        gTTS(text=req.text, lang=req.lang).write_to_fp(buf)
        return Response(content=buf.getvalue(), media_type='audio/mpeg')
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


class VoiceCmdReq(BaseModel):
    enabled: bool = False


@app.post('/api/voice-cmd')
def voice_cmd_toggle(req: VoiceCmdReq):
    # stub: actual ASR integration not implemented yet
    return {"enabled": bool(req.enabled)}


class AutoSshConfig(BaseModel):
    mode: str
    remote_host: str
    remote_user: str
    remote_port: int
    local_port: int
    ssh_port: int = 22
    keepalive: int = 60
    retries: int = 3
    gateway_ports: bool = False
    key_path: str = "~/.ssh/mummycare_id_rsa"


def _build_autossh_command(cfg: dict) -> str:
    t = cfg.get('ssh_tunnel', {})
    if not t or not t.get('enabled'):
        return ''
    mode = t.get('mode', 'reverse')
    remote_host = str(t.get('remote_host', 'your.vps.example.com'))
    remote_user = str(t.get('remote_user', 'ubuntu'))
    remote_port = int(t.get('remote_port', 5000))
    local_port = int(t.get('local_port', 5000))
    ssh_port = int(t.get('ssh_port', 22))
    keepalive = int(t.get('keepalive', 60))
    retries = int(t.get('retries', 3))
    key_path = str(t.get('key_path', '~/.ssh/mummycare_id_rsa'))
    if mode == 'reverse':
        tunnel_flag = f"-R {remote_port}:localhost:{local_port}"
    else:
        tunnel_flag = f"-L {local_port}:localhost:{remote_port}"
    cmd = (
        f"autossh -M 0 -N {tunnel_flag} "
        f"-o ServerAliveInterval={keepalive} -o ServerAliveCountMax={retries} "
        f"-i {key_path} -p {ssh_port} {remote_user}@{remote_host}"
    )
    return cmd


@app.get('/api/ssh-tunnel/cmd')
def get_autossh_cmd():
    cfg = load_config()
    cmd = _build_autossh_command(cfg)
    if not cmd:
        return JSONResponse({"error": "ssh_tunnel disabled"}, status_code=400)
    return {"autossh": cmd}


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


class TestEventReq(BaseModel):
    cameraId: str = "testcam"
    type: str = "motion"
    details: Optional[Dict[str, Any]] = None


@app.post('/api/test-event')
def emit_test_event(req: TestEventReq):
    cfg = load_config()
    api = str(cfg.get('api', {}).get('base_url') or os.getenv('API_URL', 'http://localhost:4000'))
    ingest = str(cfg.get('api', {}).get('ingest_token') or os.getenv('INGEST_TOKEN', ''))
    try:
        r = requests.post(
            f"{api}/alerts/events",
            json={"cameraId": req.cameraId, "type": req.type, "details": req.details or {"source": "test"}},
            headers={"x-ingest-token": ingest},
            timeout=3,
        )
        return {"ok": r.ok, "status": r.status_code}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

############################
# RTSP ingest minimal stub #
############################

class CameraState(BaseModel):
    url: str
    last_frame_ts: Optional[float] = None
    motion: bool = False
    fall: bool = False

_camera_threads: Dict[str, threading.Thread] = {}
_camera_state: Dict[str, CameraState] = {}
_stop_flags: Dict[str, bool] = {}
_last_frames: Dict[str, Any] = {}
_last_health: Dict[str, float] = {}
_hls_procs: Dict[str, subprocess.Popen] = {}


def _process_stream(cam_id: str, url: str, fps: int = 10):
    if cv2 is None:
        return
    cap = None
    prev_gray = None
    interval = 1.0 / max(fps, 1)
    backoff = 1.0
    pose = None
    onnx_session = None
    onnx_input_name = None
    onnx_last_fire = 0.0
    onnx_debounce = 3.0
    yolo_model = None
    yolo_last_infer = 0.0
    yolo_interval = 0.5  # seconds between YOLO inferences
    yolo_person_conf = 0.0
    if mp is not None:
        try:
            pose = mp.solutions.pose.Pose(static_image_mode=False, model_complexity=0, enable_segmentation=False)
        except Exception:
            pose = None
    # Optional ONNX fall model
    model_path = os.getenv('FALL_ONNX_MODEL')
    if model_path and ort is not None and Path(model_path).exists():
        try:
            providers = ['CPUExecutionProvider']
            onnx_session = ort.InferenceSession(model_path, providers=providers)
            onnx_input_name = onnx_session.get_inputs()[0].name
        except Exception:
            onnx_session = None

    # Optional YOLO person detector (requires ultralytics + weights available)
    yolo_weights = os.getenv('YOLO_MODEL', 'yolov8n.pt')
    yolo_enabled = (os.getenv('YOLO_ENABLED', 'false').lower() in ('1', 'true', 'yes'))
    yolo_min_conf = float(os.getenv('YOLO_MIN_CONF', '0.25'))
    if yolo_enabled and YOLO is not None:
        try:
            yolo_model = YOLO(yolo_weights)
        except Exception:
            yolo_model = None
    frame_count = 0
    motion_threshold = 12000  # pixels
    fall_nose_hip_delta = 0.03  # normalized y distance threshold
    fall_debounce_sec = 3.0
    last_fall_ts = 0.0
    while not _stop_flags.get(cam_id, False):
        if cap is None or not cap.isOpened():
            try:
                cap = cv2.VideoCapture(url)
            except Exception:
                cap = None
            if cap is None or not cap.isOpened():
                time.sleep(backoff)
                backoff = min(backoff * 2, 30.0)
                continue
            backoff = 1.0
        ok, frame = cap.read()
        now = time.time()
        st = _camera_state.get(cam_id)
        if not ok:
            # try reopen stream
            if cap is not None:
                cap.release()
            cap = None
            time.sleep(backoff)
            backoff = min(backoff * 2, 30.0)
            continue
        # Face blurring if enabled
        try:
            cfg = load_config()
            blur_enabled = bool(cfg.get('privacy', {}).get('face_blur', False))
        except Exception:
            blur_enabled = False
        if blur_enabled and cv2 is not None:
            try:
                gray_face = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                # Use default haarcascade if available in cv2 data
                cascade_path = getattr(cv2, 'data', None)
                if cascade_path and hasattr(cascade_path, 'haarcascades'):
                    cascade_file = cascade_path.haarcascades + 'haarcascade_frontalface_default.xml'
                else:
                    cascade_file = (Path(cv2.__file__).resolve().parent / 'data' / 'haarcascade_frontalface_default.xml').as_posix()  # type: ignore
                face_cascade = cv2.CascadeClassifier(cascade_file)
                faces = face_cascade.detectMultiScale(gray_face, 1.2, 5)
                for (x, y, w, h) in faces:
                    roi = frame[y:y+h, x:x+w]
                    roi = cv2.GaussianBlur(roi, (31, 31), 0)
                    frame[y:y+h, x:x+w] = roi
            except Exception:
                pass
        _last_frames[cam_id] = frame
        if st:
            st.last_frame_ts = now
            _last_health[cam_id] = now
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray = cv2.GaussianBlur(gray, (9, 9), 0)
            motion = False
            if prev_gray is not None:
                diff = cv2.absdiff(prev_gray, gray)
                _, th = cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)
                motion_pixels = int(np.sum(th > 0)) if np is not None else 0
                motion = motion_pixels > motion_threshold
            prev_gray = gray
            if st:
                st.motion = motion
                # naive baseline: motion suggests activity; fall decided via pose/onnx below
                st.fall = False

                # ONNX fall model inference (very minimal stub): resize grayscale to 224x224 and run
                if onnx_session is not None and np is not None and (now - onnx_last_fire) > onnx_debounce:
                    try:
                        resized = cv2.resize(gray, (224, 224))
                        # normalize to 0..1 and add batch/channel dims: [1,1,224,224]
                        inp = (resized.astype('float32') / 255.0)[None, None, :, :]
                        out = onnx_session.run(None, {onnx_input_name: inp})
                        score = float(out[0].ravel()[0]) if out and len(out[0].shape) >= 1 else 0.0
                        # threshold; if score>0.5 treat as fall
                        if score > 0.5:
                            st.fall = True
                            onnx_last_fire = now
                    except Exception:
                        pass

                # MediaPipe pose enhancement: consider nose-to-hip delta + shoulder angle for fall
                # and combine with motion
                pose_fall = False
                if pose is not None and frame_count % 5 == 0:
                    try:
                        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        res = pose.process(rgb)
                        if res and res.pose_landmarks:
                            lm = res.pose_landmarks.landmark
                            nose = lm[0]
                            left_hip = lm[23]
                            right_hip = lm[24]
                            left_shoulder = lm[11]
                            right_shoulder = lm[12]
                            cy = (left_hip.y + right_hip.y) / 2.0
                            shoulder_angle = abs(left_shoulder.y - right_shoulder.y)
                            nose_delta = cy - nose.y
                            # If nose below hip (negative delta) or shoulders nearly horizontal but body low → possible fall
                            pose_fall = motion and ((nose_delta < 0.02) or (shoulder_angle < 0.02 and nose_delta < 0.04))
                            if pose_fall and (now - last_fall_ts) > 2.0:
                                st.fall = True
                                last_fall_ts = now
                    except Exception:
                        pass

                # YOLO person detection (event emission with confidence)
                person_event_emitted = False
                if yolo_model is not None and (now - yolo_last_infer) > yolo_interval:
                    try:
                        yolo_last_infer = now
                        img = frame
                        results = yolo_model.predict(source=img, imgsz=320, verbose=False)
                        conf = 0.0
                        if results and len(results) > 0:
                            r = results[0]
                            # class 0 is 'person' for COCO
                            for b in r.boxes:
                                cls_id = int(getattr(b, 'cls', [0])[0]) if hasattr(b, 'cls') else 0
                                score = float(getattr(b, 'conf', [0.0])[0]) if hasattr(b, 'conf') else 0.0
                                if cls_id == 0 and score > conf:
                                    conf = score
                        yolo_person_conf = conf
                        if conf >= yolo_min_conf:
                            # emit person event with confidence
                            try:
                                cfg = load_config()
                                api = str(cfg.get('api', {}).get('base_url') or os.getenv('API_URL', 'http://localhost:4000'))
                                ingest = str(cfg.get('api', {}).get('ingest_token') or os.getenv('INGEST_TOKEN', ''))
                                requests.post(
                                    f"{api}/alerts/events",
                                    json={
                                        "cameraId": cam_id,
                                        "type": "person",
                                        "details": {"confidence": float(conf)},
                                    },
                                    headers={"x-ingest-token": ingest},
                                    timeout=1.5,
                                )
                                person_event_emitted = True
                            except Exception:
                                pass
                    except Exception:
                        pass

                # mediapipe pose heuristic (if available) every 5th frame
                frame_count += 1
                if pose is not None and frame_count % 5 == 0:
                    try:
                        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        res = pose.process(rgb)
                        if res and res.pose_landmarks:
                            lm = res.pose_landmarks.landmark
                            # landmarks indices
                            nose = lm[0]
                            left_hip = lm[23]
                            right_hip = lm[24]
                            cx = (left_hip.x + right_hip.x) / 2.0
                            cy = (left_hip.y + right_hip.y) / 2.0
                            # Compute body tilt using shoulders if available
                            left_shoulder = lm[11]
                            right_shoulder = lm[12]
                            shoulder_angle = abs(left_shoulder.y - right_shoulder.y)
                            # if nose is close to hips (vertical collapse) and recent motion
                            nose_delta = cy - nose.y  # positive if nose below hips
                            likely_fall = motion and (nose_delta < fall_nose_hip_delta)
                            if likely_fall:
                                # debounce to reduce duplicates
                                if (now - last_fall_ts) > fall_debounce_sec:
                                    st.fall = True
                                    last_fall_ts = now
                    except Exception:
                        pass
                # post events to API
                try:
                    cfg = load_config()
                    api = str(cfg.get('api', {}).get('base_url') or os.getenv('API_URL', 'http://localhost:4000'))
                    ingest = str(cfg.get('api', {}).get('ingest_token') or os.getenv('INGEST_TOKEN', ''))
                    if motion:
                        requests.post(
                            f"{api}/alerts/events",
                            json={
                                "cameraId": cam_id,
                                "type": "motion",
                                "details": {"motionPixels": motion_pixels},
                            },
                            headers={"x-ingest-token": ingest},
                            timeout=1.5,
                        )
                    if st.fall:
                        requests.post(
                            f"{api}/alerts/events",
                            json={
                                "cameraId": cam_id,
                                "type": "fall",
                                "details": {
                                    "noseHipDelta": float(nose_delta) if 'nose_delta' in locals() else None,
                                    "shoulderAngle": float(shoulder_angle) if 'shoulder_angle' in locals() else None,
                                    "onnx": bool(onnx_session is not None),
                                    "yoloPersonConfidence": float(yolo_person_conf),
                                },
                            },
                            headers={"x-ingest-token": ingest},
                            timeout=1.5,
                        )
                except Exception:
                    pass
        except Exception:
            pass
        time.sleep(interval)
    cap.release()


def _start_hls(cam_id: str, url: str):
    # Requires ffmpeg in PATH
    if _hls_procs.get(cam_id) and _hls_procs[cam_id].poll() is None:
        return True
    hls_root = BASE_DIR / 'static' / 'hls' / cam_id
    hls_root.mkdir(parents=True, exist_ok=True)
    # clean old segments
    for p in list(hls_root.glob('*')):
        try:
            p.unlink(missing_ok=True)  # type: ignore
        except Exception:
            pass
    playlist = hls_root / 'index.m3u8'
    # Basic ffmpeg HLS; tune as needed
    cmd = [
        'ffmpeg', '-y',
        '-rtsp_transport', 'tcp',
        '-i', url,
        '-an',
        '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'zerolatency', '-pix_fmt', 'yuv420p',
        '-max_muxing_queue_size', '1024',
        '-f', 'hls', '-hls_time', '2', '-hls_list_size', '6', '-hls_flags', 'delete_segments+append_list',
        str(playlist)
    ]
    try:
        proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        _hls_procs[cam_id] = proc
        return True
    except Exception:
        return False


def _stop_hls(cam_id: str):
    proc = _hls_procs.get(cam_id)
    if proc and proc.poll() is None:
        try:
            proc.terminate()
        except Exception:
            pass
    _hls_procs.pop(cam_id, None)


class StartCameraReq(BaseModel):
    id: str
    url: str


@app.post("/api/camera/start")
def start_camera(req: StartCameraReq):
    cam_id = req.id
    if cam_id in _camera_threads and _camera_threads[cam_id].is_alive():
        return {"running": True}
    _stop_flags[cam_id] = False
    _camera_state[cam_id] = CameraState(url=req.url)
    t = threading.Thread(target=_process_stream, args=(cam_id, req.url), daemon=True)
    _camera_threads[cam_id] = t
    t.start()
    # Try to start HLS alongside processing
    _start_hls(cam_id, req.url)
    return {"started": True}


class StopCameraReq(BaseModel):
    id: str


@app.post("/api/camera/stop")
def stop_camera(req: StopCameraReq):
    cam_id = req.id
    _stop_flags[cam_id] = True
    _stop_hls(cam_id)
    return {"stopping": True}


@app.get("/api/camera/{cam_id}/state")
def camera_state(cam_id: str):
    st = _camera_state.get(cam_id)
    if not st:
        return JSONResponse({"error": "not found"}, status_code=404)
    return st.model_dump()


@app.get("/api/camera/{cam_id}/snapshot")
def camera_snapshot(cam_id: str):
    if cv2 is None:
        return JSONResponse({"error": "cv2 not available"}, status_code=503)
    frame = _last_frames.get(cam_id)
    if frame is None:
        return JSONResponse({"error": "no frame"}, status_code=404)
    ok, buf = cv2.imencode('.jpg', frame)
    if not ok:
        return JSONResponse({"error": "encode failed"}, status_code=500)
    return Response(content=buf.tobytes(), media_type='image/jpeg')


@app.get('/api/camera/{cam_id}/hls')
def camera_hls(cam_id: str):
    # Return the HLS playlist path for the client
    playlist = BASE_DIR / 'static' / 'hls' / cam_id / 'index.m3u8'
    if not playlist.exists():
        return JSONResponse({"error": "hls not ready"}, status_code=404)
    return JSONResponse({"m3u8": f"/static/hls/{cam_id}/index.m3u8"})


#########################
# Health analytics basic #
#########################

@app.get("/api/health-analytics")
def health_analytics():
    # Aggregate simple signals from camera states; extend later with ML
    cams = []
    for cam_id, st in _camera_state.items():
        cams.append({
            "id": cam_id,
            "motion": st.motion,
            "fall": st.fall,
            "lastFrameAgoSec": (time.time() - st.last_frame_ts) if st.last_frame_ts else None,
        })
    summary = {
        "cameras": cams,
        "anyMotion": any(c.get("motion") for c in cams) if cams else False,
        "anyFall": any(c.get("fall") for c in cams) if cams else False,
        "ts": time.time(),
    }
    return summary


#########################
# Watchdog, Power & Backups    #
#########################

def _watchdog_loop():
    while True:
        now = time.time()
        for cam_id, st in list(_camera_state.items()):
            last = st.last_frame_ts or 0
            if now - last > 10:  # stale >10s → restart
                try:
                    _stop_flags[cam_id] = True
                    time.sleep(0.5)
                    _stop_flags[cam_id] = False
                    t = threading.Thread(target=_process_stream, args=(cam_id, st.url), daemon=True)
                    _camera_threads[cam_id] = t
                    t.start()
                except Exception:
                    pass
        time.sleep(5)

def _snapshot_backup_loop():
    backup_dir = BASE_DIR / 'storage' / 'snapshots'
    backup_dir.mkdir(parents=True, exist_ok=True)
    retention = 100
    while True:
        for cam_id, frame in list(_last_frames.items()):
            try:
                if cv2 is None:
                    continue
                ok, buf = cv2.imencode('.jpg', frame)
                if not ok:
                    continue
                ts = int(time.time())
                path = backup_dir / f"{cam_id}-{ts}.jpg"
                with open(path, 'wb') as f:
                    f.write(buf.tobytes())
            except Exception:
                pass
        # retention
        try:
            files = sorted([p for p in backup_dir.glob('*.jpg')], key=lambda p: p.stat().st_mtime, reverse=True)
            for p in files[retention:]:
                try:
                    p.unlink(missing_ok=True)  # type: ignore
                except Exception:
                    pass
        except Exception:
            pass
        time.sleep(60)

_watchdog_thread = threading.Thread(target=_watchdog_loop, daemon=True)
_watchdog_thread.start()
_backup_thread = threading.Thread(target=_snapshot_backup_loop, daemon=True)
_backup_thread.start()


#########################
# Battery/Power monitor #
#########################
try:
    import psutil  # type: ignore
except Exception:
    psutil = None  # type: ignore


@app.get('/api/power')
def power_status():
    data: Dict[str, Any] = {"ts": time.time(), "power": {}}
    try:
        if psutil and hasattr(psutil, 'sensors_battery'):
            b = psutil.sensors_battery()
            if b:
                data["power"] = {
                    "percent": getattr(b, 'percent', None),
                    "secsleft": getattr(b, 'secsleft', None),
                    "power_plugged": getattr(b, 'power_plugged', None),
                }
    except Exception:
        pass
    data.setdefault("power", {}).setdefault("source", "unknown")
    return data

@app.get('/api/camera')
def list_cameras():
    out = []
    now = time.time()
    for cam_id, st in _camera_state.items():
        out.append({
            'id': cam_id,
            'url': st.url,
            'lastFrameAgoSec': (now - (st.last_frame_ts or 0)) if st.last_frame_ts else None,
        })
    return {'items': out}

