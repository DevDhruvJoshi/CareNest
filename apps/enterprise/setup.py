#!/usr/bin/env python3
"""
CareNest Enterprise one-shot setup script (idempotent).

Goals (non-interactive):
- Ensure Python venv, install deps
- Write systemd unit templates to /etc/systemd/system (if sudo/root)
- Configure basic UFW and Fail2Ban if available (safe no-op otherwise)
- Prepare directories (static/, templates/, storage/)

This script is safe to run multiple times. It avoids prompting the user.
"""

from __future__ import annotations
import os
import sys
import subprocess
from pathlib import Path
import yaml
from typing import List

BASE_DIR = Path(__file__).resolve().parent


def run(cmd: List[str], check: bool = False) -> int:
    try:
        print("$", " ".join(cmd))
        return subprocess.run(cmd, check=check).returncode
    except FileNotFoundError:
        return 127


def ensure_dirs() -> None:
    for p in [
        BASE_DIR / "static",
        BASE_DIR / "templates",
        BASE_DIR / "storage",
        BASE_DIR / "static" / "hls",
        BASE_DIR / "storage" / "snapshots",
    ]:
        p.mkdir(parents=True, exist_ok=True)


def ensure_venv() -> None:
    venv_dir = BASE_DIR / ".venv"
    if not venv_dir.exists():
        run([sys.executable, "-m", "venv", str(venv_dir)])
    pip = venv_dir / ("Scripts/pip.exe" if os.name == "nt" else "bin/pip")
    run([str(pip), "install", "--upgrade", "pip", "wheel", "setuptools"])
    req = BASE_DIR / "requirements.txt"
    if req.exists():
        run([str(pip), "install", "-r", str(req)])


def maybe_install_systemd() -> None:
    # Only attempt on Linux with systemd writable
    if os.name != "posix":
        print("Skipping systemd install: non-posix")
        return
    systemd_dir = Path("/etc/systemd/system")
    if not systemd_dir.exists() or not os.access(systemd_dir, os.W_OK):
        print("Skipping systemd install: insufficient permissions (run with sudo to install services)")
        return

    templates_dir = BASE_DIR / "scripts" / "systemd"
    units = {
        "mummycare.service": (templates_dir / "mummycare.service").read_text(encoding="utf-8") if (templates_dir / "mummycare.service").exists() else "",
        "autossh-mummycare.service": (templates_dir / "autossh-mummycare.service").read_text(encoding="utf-8") if (templates_dir / "autossh-mummycare.service").exists() else "",
    }
    for name, content in units.items():
        if not content:
            continue
        target = systemd_dir / name
        current = target.read_text(encoding="utf-8") if target.exists() else ""
        if current.strip() != content.strip():
            print(f"Installing systemd unit: {name}")
            target.write_text(content, encoding="utf-8")
    # daemon-reload and enable do not fail if units already enabled
    run(["systemctl", "daemon-reload"])  # best-effort
    run(["systemctl", "enable", "--now", "mummycare"], check=False)
    run(["systemctl", "enable", "--now", "autossh-mummycare"], check=False)


def _load_cfg() -> dict:
    cfg_path = BASE_DIR / 'config.yaml'
    if cfg_path.exists():
        try:
            return yaml.safe_load(cfg_path.read_text(encoding='utf-8')) or {}
        except Exception:
            return {}
    return {}


def maybe_configure_ufw_fail2ban() -> None:
    cfg = _load_cfg()
    security = cfg.get('security', {}) if isinstance(cfg, dict) else {}
    ufw_cfg = (security or {}).get('ufw', {})
    f2b_cfg = (security or {}).get('fail2ban', {})
    # Best-effort hardening, safe no-ops if ufw/fail2ban not present
    # UFW: allow 22, deny 5000 from WAN; enable
    if run(["ufw", "status"], check=False) != 127 and bool(ufw_cfg.get('enabled', True)):
        run(["ufw", "--force", "default", "deny", "incoming"], check=False)
        run(["ufw", "--force", "default", "allow", "outgoing"], check=False)
        # Allow SSH port(s) from config or default 22
        allow_ports = ufw_cfg.get('allow_inbound_ports', [22])
        if isinstance(allow_ports, list):
            for p in allow_ports:
                run(["ufw", "allow", str(p)], check=False)
        # Dashboard local only (reverse tunnel for remote); explicit deny 5000
        run(["ufw", "deny", "5000"], check=False)
        run(["ufw", "--force", "enable"], check=False)

    # Fail2Ban minimal enable if installed
    jail_d = Path("/etc/fail2ban/jail.d")
    if jail_d.exists() and os.access(jail_d, os.W_OK) and bool(f2b_cfg.get('enabled', True)):
        maxretry = int(f2b_cfg.get('maxretry', 5))
        bantime = int(f2b_cfg.get('bantime', 3600))
        cfg_txt = f"""[sshd]
enabled = true
maxretry = {maxretry}
bantime = {bantime}
"""
        (jail_d / "mummycare-ssh.conf").write_text(cfg_txt, encoding="utf-8")
        run(["systemctl", "enable", "--now", "fail2ban"], check=False)


def main() -> int:
    print("== CareNest Enterprise Setup ==")
    ensure_dirs()
    ensure_venv()
    maybe_install_systemd()
    maybe_configure_ufw_fail2ban()
    print("Setup complete.")
    print("Next:")
    print("  - If you ran without sudo, re-run with sudo to install services")
    print("  - Verify services: systemctl status mummycare autossh-mummycare")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


