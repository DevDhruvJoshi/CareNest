#!/usr/bin/env bash
set -euo pipefail

# Non-interactive hardening per config.yaml

CONFIG_DIR="$(cd "$(dirname "$0")" && pwd)"
CONFIG_FILE="$CONFIG_DIR/config.yaml"

if ! command -v yq >/dev/null 2>&1; then
  echo "yq is required. Install with: sudo apt-get install -y jq && sudo snap install yq"
  exit 1
fi

SSH_ENABLED=$(yq '.ssh_tunnel.enabled' "$CONFIG_FILE" || echo 'false')
MODE=$(yq '.ssh_tunnel.mode' "$CONFIG_FILE" || echo 'reverse')
REMOTE_HOST=$(yq '.ssh_tunnel.remote_host' "$CONFIG_FILE" || echo '')
REMOTE_USER=$(yq '.ssh_tunnel.remote_user' "$CONFIG_FILE" || echo 'ubuntu')
REMOTE_PORT=$(yq '.ssh_tunnel.remote_port' "$CONFIG_FILE" || echo '5000')
LOCAL_PORT=$(yq '.ssh_tunnel.local_port' "$CONFIG_FILE" || echo '5000')
SSH_PORT=$(yq '.ssh_tunnel.ssh_port' "$CONFIG_FILE" || echo '22')
KEEPALIVE=$(yq '.ssh_tunnel.keepalive' "$CONFIG_FILE" || echo '60')
RETRIES=$(yq '.ssh_tunnel.retries' "$CONFIG_FILE" || echo '3')
KEY_PATH=$(yq '.ssh_tunnel.key_path' "$CONFIG_FILE" || echo '~/.ssh/mummycare_id_rsa')

SEC_UFW=$(yq '.security.ufw.enabled' "$CONFIG_FILE" || echo 'false')
SEC_FAIL2BAN=$(yq '.security.fail2ban.enabled' "$CONFIG_FILE" || echo 'false')

echo "[+] Installing packages"
sudo apt-get update -y
sudo apt-get install -y autossh ufw fail2ban

if [ "$SEC_UFW" = "true" ]; then
  echo "[+] Configuring UFW"
  sudo ufw --force reset
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow 22/tcp
  # Explicitly deny 5000 from WAN
  sudo ufw deny 5000/tcp || true
  sudo ufw --force enable
fi

if [ "$SEC_FAIL2BAN" = "true" ]; then
  echo "[+] Configuring Fail2Ban"
  sudo mkdir -p /etc/fail2ban/jail.d
  MAXRETRY=$(yq '.security.fail2ban.maxretry' "$CONFIG_FILE" || echo '5')
  BANTIME=$(yq '.security.fail2ban.bantime' "$CONFIG_FILE" || echo '3600')
  cat <<EOF | sudo tee /etc/fail2ban/jail.d/mummycare-ssh.conf >/dev/null
[sshd]
enabled = true
maxretry = $MAXRETRY
bantime = $BANTIME
EOF
  sudo systemctl restart fail2ban || true
fi

echo "[+] Creating systemd services"
APP_DIR="$CONFIG_DIR"
cat <<EOF | sudo tee /etc/systemd/system/mummycare.service >/dev/null
[Unit]
Description=CareNest Enterprise
After=network.target

[Service]
Type=simple
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/env python $APP_DIR/main.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

if [ "$SSH_ENABLED" = "true" ]; then
  echo "[+] Creating autossh service"
  if [ "$MODE" = "reverse" ]; then
    TUNNEL="-R $REMOTE_PORT:localhost:$LOCAL_PORT"
  else
    TUNNEL="-L $LOCAL_PORT:localhost:$REMOTE_PORT"
  fi
  cat <<EOF | sudo tee /etc/systemd/system/autossh-mummycare.service >/dev/null
[Unit]
Description=AutoSSH tunnel for CareNest
After=network-online.target
Wants=network-online.target

[Service]
Environment="AUTOSSH_GATETIME=0"
ExecStart=/usr/bin/autossh -M 0 -N $TUNNEL -o ServerAliveInterval=$KEEPALIVE -o ServerAliveCountMax=$RETRIES -i $KEY_PATH -p $SSH_PORT $REMOTE_USER@$REMOTE_HOST
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
fi

echo "[+] Enabling services"
sudo systemctl daemon-reload
sudo systemctl enable --now mummycare.service || true
if [ "$SSH_ENABLED" = "true" ]; then
  sudo systemctl enable --now autossh-mummycare.service || true
fi

echo "[+] Done"

