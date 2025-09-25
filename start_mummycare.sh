#!/usr/bin/env bash
set -euo pipefail

if [[ -d .venv ]]; then
  source .venv/bin/activate || source .venv/Scripts/activate
fi

exec python main.py




