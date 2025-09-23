# 🏥 CareNest Enterprise System - Complete IDE AI Implementation Prompt

## 🎯 PROJECT OVERVIEW
**CareNest Enterprise** is a 100-year durability AI-powered health monitoring ecosystem for elderly mother with special needs. This prompt will create a complete, production-ready system that can be deployed immediately.

## 📋 COMPLETE IMPLEMENTATION REQUIREMENTS

### 🎯 IMMEDIATE DEPLOYMENT GOALS
- **Ready to use**: System should work immediately after implementation
- **Next day deployment**: Can be installed at home tomorrow
- **100% complete**: Nothing missing, everything functional
- **Production ready**: Enterprise-grade quality
- **Zero configuration**: Works out of the box

### 🏠 HARDWARE REQUIREMENTS (READY TO BUY)
1. **Raspberry Pi 4B (8GB RAM)** - ₹8,000
2. **3x IP Cameras with RTSP** - ₹15,000 (₹5,000 each)
3. **256GB NVMe SSD** - ₹3,000
4. **1TB External HDD** - ₹4,000
5. **UPS 1000VA** - ₹8,000
6. **WiFi 6 Router** - ₹5,000
7. **IP67 Enclosure** - ₹2,000
8. **Cooling Fan Kit** - ₹1,000
9. **Power Supply & Cables** - ₹2,000
10. **MicroSD 512GB** - ₹3,000

**Total Cost: ₹51,000** (Complete system ready)

## 🚀 STEP-BY-STEP IMPLEMENTATION GUIDE

### PHASE 1: CORE SYSTEM SETUP (2 hours)

#### 1.1 Project Structure Creation
```
CareNest-Enterprise/
├── main.py                          # Main application entry point
├── main_enterprise.py               # Enterprise system manager
├── requirements.txt                  # Python dependencies
├── Dockerfile                       # Container configuration
├── docker-compose.yml               # Multi-service orchestration
├── docker-compose.test.yml          # Test environment
├── cicd_pipeline.py                 # CI/CD automation
├── deploy.py                        # One-click deployment
├── setup.py                         # Automated setup script
├── start_mummycare.sh               # Startup script
├── config.yaml                      # System configuration
├── .github/workflows/               # GitHub Actions CI/CD
├── k8s/                            # Kubernetes manifests
├── monitoring/                      # Prometheus & Grafana
├── tests/                          # Complete test suite
├── docs/                           # Documentation
├── scripts/                        # Utility scripts
├── src/
│   ├── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── system_manager.py        # Core system management
│   │   ├── config_manager.py        # Configuration management
│   │   └── enterprise_manager.py    # Enterprise features
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── ai_models.py             # AI model management
│   │   ├── camera_manager.py        # Camera management
│   │   ├── rtsp_camera_manager.py   # RTSP camera integration
│   │   ├── health_monitor.py         # Health monitoring
│   │   ├── communication_ai.py      # Communication AI
│   │   ├── fall_detection.py        # Advanced fall detection
│   │   ├── pose_analysis.py         # Pose analysis
│   │   ├── facial_analysis.py       # Facial analysis
│   │   └── gesture_recognition.py   # Gesture recognition
│   ├── alerts/
│   │   ├── __init__.py
│   │   ├── alert_manager.py         # Alert management
│   │   ├── sms_service.py           # SMS service
│   │   ├── email_service.py         # Email service
│   │   ├── phone_service.py         # Phone service
│   │   └── push_service.py          # Push notifications
│   ├── web/
│   │   ├── __init__.py
│   │   ├── dashboard.py             # Web dashboard
│   │   ├── api.py                   # REST API
│   │   ├── websocket.py             # WebSocket server
│   │   └── templates/               # HTML templates
│   ├── database/
│   │   ├── __init__.py
│   │   ├── data_manager.py          # Database management
│   │   ├── models.py                # Data models
│   │   └── migrations/              # Database migrations
│   ├── security/
│   │   ├── __init__.py
│   │   ├── privacy_manager.py       # Privacy management
│   │   ├── encryption.py            # Encryption services
│   │   ├── authentication.py        # Authentication
│   │   └── audit_logger.py          # Audit logging
│   ├── monitoring/
│   │   ├── __init__.py
│   │   ├── battery_monitor.py       # Battery monitoring
│   │   ├── power_monitor.py         # Power monitoring
│   │   ├── system_monitor.py        # System monitoring
│   │   ├── performance_monitor.py   # Performance monitoring
│   │   └── recovery_manager.py      # Auto-recovery system
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── gujarati_support.py      # Gujarati language support
│   │   ├── logger.py                # Logging system
│   │   ├── helpers.py               # Utility functions
│   │   └── validators.py            # Input validation
│   └── storage/
│       ├── __init__.py
│       ├── storage_manager.py        # Storage management
│       ├── video_manager.py         # Video storage
│       ├── image_manager.py         # Image storage
│       └── backup_manager.py        # Backup system
├── static/                          # Static web files
├── templates/                       # HTML templates
├── logs/                           # Log files
├── storage/                        # Data storage
├── models/                         # AI model files
├── config/                         # Configuration files
└── docs/                           # Documentation
```

#### 1.2 Core Files Implementation
Create these files with complete implementation:

**main.py** - Main application entry point
**main_enterprise.py** - Enterprise system manager
**requirements.txt** - All Python dependencies
**Dockerfile** - Multi-stage Docker build
**docker-compose.yml** - Complete service orchestration
**config.yaml** - Complete system configuration
**deploy.py** - One-click deployment script
**setup.py** - Automated setup script

### PHASE 2: AI MODELS & COMPUTER VISION (3 hours)

#### 2.1 AI Model Implementation
- **YOLOv8 Integration**: Object detection with custom training
- **MediaPipe Integration**: Pose detection and gesture recognition
- **Custom Fall Detection**: CNN-based fall detection model
- **Health Analysis**: Transformer-based health monitoring
- **Facial Recognition**: FaceNet integration
- **Lip Reading**: Custom Gujarati lip reading model
- **Gesture Recognition**: Advanced hand gesture detection

#### 2.2 RTSP Camera Integration
- **Multi-camera Support**: Unlimited RTSP cameras
- **Real-time Streaming**: Low-latency video streaming
- **AI Processing**: Real-time AI analysis
- **Auto-recovery**: Automatic camera reconnection
- **Load Balancing**: Smart camera load distribution

### PHASE 3: HEALTH MONITORING SYSTEM (2 hours)

#### 3.1 Advanced Health Monitoring
- **24/7 Monitoring**: Continuous health tracking
- **Fall Detection**: 99.5% accuracy fall detection
- **Vital Signs**: Heart rate, blood pressure estimation
- **Breathing Analysis**: Real-time breathing pattern analysis
- **Posture Analysis**: 3D pose estimation
- **Activity Tracking**: Comprehensive movement analysis
- **Sleep Monitoring**: Advanced sleep quality analysis
- **Medication Reminders**: AI-powered medication tracking

#### 3.2 Health Analytics
- **Pattern Recognition**: Health trend analysis
- **Predictive Analytics**: Health issue prediction
- **Risk Assessment**: Health risk evaluation
- **Daily Reports**: Automated health summaries
- **Family Notifications**: Real-time health updates

### PHASE 4: COMMUNICATION SYSTEM (2 hours)

#### 4.1 Gujarati Language Support
- **Complete Gujarati Interface**: All text in Gujarati
- **Lip Reading AI**: Understand Gujarati speech
- **Text-to-Speech**: Gujarati voice output
- **Gesture Recognition**: Gujarati sign language
- **Visual Communication**: Large text display
- **Voice Commands**: Gujarati voice control

#### 4.2 Communication Features
- **Family Dashboard**: Real-time communication
- **Emergency Alerts**: Instant family notifications
- **Health Updates**: Regular health reports
- **Video Calls**: Integrated video calling
- **Message System**: Family messaging system

### PHASE 5: ALERT SYSTEM (1 hour)

#### 5.1 Multi-Channel Alerts
- **SMS Alerts**: Twilio integration
- **Email Alerts**: SMTP integration
- **Phone Calls**: Automated phone calls
- **Push Notifications**: Mobile app notifications
- **Visual Alerts**: Dashboard notifications
- **Gujarati Messages**: All alerts in Gujarati

#### 5.2 Alert Management
- **Smart Filtering**: Reduce false positives
- **Escalation**: Automatic alert escalation
- **Rate Limiting**: Prevent alert spam
- **Emergency Contacts**: Multiple contact support
- **Alert History**: Complete alert tracking

### PHASE 6: WEB DASHBOARD (2 hours)

#### 6.1 Family Dashboard
- **Real-time Camera Feeds**: Live video streaming
- **Health Status**: Current health display
- **Activity Timeline**: Daily activity tracking
- **Alert Center**: Alert management
- **Settings Panel**: System configuration
- **Mobile Responsive**: Works on all devices

#### 6.2 Dashboard Features
- **WebSocket Integration**: Real-time updates
- **Gujarati Interface**: Complete Gujarati support
- **Large Text**: Accessibility features
- **High Contrast**: Easy to read
- **Touch Friendly**: Mobile optimized
- **Offline Support**: Works without internet

### PHASE 7: SECURITY & PRIVACY (1 hour)

#### 7.1 Enterprise Security
- **Zero-Trust Architecture**: Complete security model
- **End-to-End Encryption**: Military-grade encryption
- **Local Processing**: No cloud dependency
- **Data Anonymization**: Privacy protection
- **Access Control**: Role-based access
- **Audit Logging**: Complete activity tracking

#### 7.2 Privacy Protection
- **Face Blurring**: Automatic privacy protection
- **Data Encryption**: All data encrypted
- **Secure Deletion**: Safe data removal
- **No Internet**: Local operation only
- **Discreet Operation**: Silent monitoring
- **GDPR Compliance**: Privacy regulation compliance

### PHASE 8: MONITORING & RECOVERY (1 hour)

#### 8.1 System Monitoring
- **Battery Monitoring**: Real-time battery tracking
- **Power Monitoring**: Power failure detection
- **Performance Monitoring**: System performance tracking
- **Health Monitoring**: System health checks
- **Resource Monitoring**: CPU, memory, disk usage
- **Network Monitoring**: Network status tracking

#### 8.2 Auto-Recovery System
- **Memory Card Recovery**: Automatic storage recovery
- **Service Restart**: Automatic service recovery
- **Network Failover**: Backup network switching
- **Camera Failover**: Backup camera switching
- **Power Failover**: UPS integration
- **Data Backup**: Automatic data backup

### PHASE 9: CI/CD & DEPLOYMENT (1 hour)

#### 9.1 CI/CD Pipeline
- **GitHub Actions**: Automated CI/CD
- **Docker Integration**: Container deployment
- **Kubernetes**: Production deployment
- **Automated Testing**: Complete test suite
- **Code Quality**: Automated quality checks
- **Security Scanning**: Automated security checks

#### 9.2 Deployment Automation
- **One-Click Deploy**: Single command deployment
- **Blue-Green Deployment**: Zero-downtime deployment
- **Rollback Capability**: Automatic rollback
- **Health Checks**: Deployment validation
- **Monitoring Setup**: Automated monitoring
- **Backup Setup**: Automated backup

### PHASE 10: TESTING & VALIDATION (1 hour)

#### 10.1 Complete Test Suite
- **Unit Tests**: 100% code coverage
- **Integration Tests**: End-to-end testing
- **Performance Tests**: Load testing
- **Security Tests**: Security validation
- **User Acceptance Tests**: User validation
- **Regression Tests**: Change validation

#### 10.2 Quality Assurance
- **Code Quality**: High-quality code
- **Documentation**: Complete documentation
- **Error Handling**: Robust error handling
- **Performance**: Optimized performance
- **Security**: Enterprise security
- **Reliability**: High reliability

## 🛠️ IMPLEMENTATION CHECKLIST

### ✅ CORE SYSTEM
- [ ] Project structure created
- [ ] Main application implemented
- [ ] Configuration system working
- [ ] Logging system implemented
- [ ] Error handling complete
- [ ] Database system working
- [ ] API endpoints functional
- [ ] WebSocket server running

### ✅ AI MODELS
- [ ] YOLOv8 integration complete
- [ ] MediaPipe integration complete
- [ ] Custom fall detection model
- [ ] Health analysis model
- [ ] Facial recognition model
- [ ] Lip reading model
- [ ] Gesture recognition model
- [ ] All models optimized

### ✅ CAMERA SYSTEM
- [ ] RTSP camera integration
- [ ] Multi-camera support
- [ ] Real-time streaming
- [ ] AI processing pipeline
- [ ] Auto-recovery system
- [ ] Load balancing
- [ ] Performance optimization
- [ ] Error handling

### ✅ HEALTH MONITORING
- [ ] 24/7 monitoring active
- [ ] Fall detection working
- [ ] Vital signs monitoring
- [ ] Breathing analysis
- [ ] Posture analysis
- [ ] Activity tracking
- [ ] Sleep monitoring
- [ ] Medication reminders

### ✅ COMMUNICATION
- [ ] Gujarati language support
- [ ] Lip reading AI
- [ ] Text-to-speech
- [ ] Gesture recognition
- [ ] Visual communication
- [ ] Voice commands
- [ ] Family dashboard
- [ ] Emergency alerts

### ✅ ALERT SYSTEM
- [ ] SMS alerts working
- [ ] Email alerts working
- [ ] Phone call alerts
- [ ] Push notifications
- [ ] Visual alerts
- [ ] Gujarati messages
- [ ] Smart filtering
- [ ] Rate limiting

### ✅ WEB DASHBOARD
- [ ] Real-time camera feeds
- [ ] Health status display
- [ ] Activity timeline
- [ ] Alert center
- [ ] Settings panel
- [ ] Mobile responsive
- [ ] WebSocket integration
- [ ] Offline support

### ✅ SECURITY
- [ ] Zero-trust architecture
- [ ] End-to-end encryption
- [ ] Local processing
- [ ] Data anonymization
- [ ] Access control
- [ ] Audit logging
- [ ] Face blurring
- [ ] Secure deletion

### ✅ MONITORING
- [ ] Battery monitoring
- [ ] Power monitoring
- [ ] Performance monitoring
- [ ] Health monitoring
- [ ] Resource monitoring
- [ ] Network monitoring
- [ ] Auto-recovery
- [ ] Data backup

### ✅ CI/CD
- [ ] GitHub Actions setup
- [ ] Docker integration
- [ ] Kubernetes deployment
- [ ] Automated testing
- [ ] Code quality checks
- [ ] Security scanning
- [ ] One-click deploy
- [ ] Rollback capability

### ✅ ENVIRONMENT & SECRETS
- [ ] .env.example बनाया और versioned
- [ ] .env.local, .env.development, .env.staging, .env.production तैयार
- [ ] Secrets repo में नहीं—ENV vars / CI Secrets / K8s Secrets में
- [ ] config.yaml + env overrides (ConfigManager merge order documented)
- [ ] docker-compose profiles: local, development, production
- [ ] GitHub Actions secrets mapped to runtime env
- [ ] .gitignore में .env* शामिल

### ✅ TESTING
- [ ] Unit tests complete
- [ ] Integration tests complete
- [ ] Performance tests
- [ ] Security tests
- [ ] User acceptance tests
- [ ] Regression tests
- [ ] Code quality
- [ ] Documentation

## 🚀 DEPLOYMENT INSTRUCTIONS

### IMMEDIATE DEPLOYMENT (Next Day Ready)

#### Step 1: Hardware Setup (30 minutes)
1. Install Raspberry Pi 4B in IP67 enclosure
2. Connect cooling fan kit
3. Install NVMe SSD and external HDD
4. Connect UPS system
5. Setup WiFi 6 router
6. Install IP cameras with RTSP support
7. Connect all power supplies

#### Step 2: Software Installation (30 minutes)
1. Flash Raspberry Pi OS to MicroSD
2. Enable SSH and WiFi
3. Clone CareNest repository
4. Run automated setup script
5. Configure system settings
6. Start all services
7. Verify system health

#### Step 3: Configuration (30 minutes)
1. Configure camera RTSP URLs
2. Setup emergency contacts
3. Configure alert settings
4. Setup family dashboard access
5. Configure Gujarati language
6. Setup battery monitoring
7. Configure power monitoring

#### Step 4: Testing (30 minutes)
1. Test all camera feeds
2. Test health monitoring
3. Test alert system
4. Test family dashboard
5. Test Gujarati interface
6. Test battery monitoring
7. Test power failure detection

#### Step 5: Go Live (Immediate)
1. System is ready for production use
2. Family can access dashboard
3. Health monitoring is active
4. Alerts are configured
5. All features are functional
6. System is monitoring mother
7. Ready for 24/7 operation

## 📱 FAMILY DASHBOARD ACCESS

### Web Access
- **URL**: http://[raspberry-pi-ip]:5000
- **Mobile**: Responsive design works on all devices
- **Features**: Live camera feeds, health status, alerts
- **Language**: Complete Gujarati interface
- **Updates**: Real-time WebSocket updates

### Mobile App (Optional)
- **Platform**: Android/iOS
- **Features**: Push notifications, offline support
- **Security**: End-to-end encryption
- **Sync**: Real-time data synchronization

## 🔧 MAINTENANCE & SUPPORT

### Daily Maintenance (Automatic)
- System health checks
- Performance monitoring
- Security scanning
- Data backup
- Log rotation
- Error monitoring

### Weekly Maintenance (Automatic)
- System updates
- Security patches
- Performance optimization
- Storage cleanup
- Health report generation
- Family notifications

### Monthly Maintenance (Automatic)
- Complete system health check
- Security audit
- Performance analysis
- Data archiving
- Model updates
- Feature updates

## 🎯 SUCCESS CRITERIA

### Technical Success
- ✅ 99.9% system uptime
- ✅ <30 second alert response time
- ✅ 99.5% fall detection accuracy
- ✅ Real-time video streaming
- ✅ Complete Gujarati support
- ✅ Enterprise-grade security
- ✅ Automatic recovery
- ✅ Zero configuration

### User Success
- ✅ Mother feels safe and independent
- ✅ Family has peace of mind
- ✅ Easy to use interface
- ✅ Reliable monitoring
- ✅ Instant alerts
- ✅ Complete privacy
- ✅ No technical knowledge required
- ✅ Works immediately

### Business Success
- ✅ Production-ready system
- ✅ Scalable architecture
- ✅ Maintainable code
- ✅ Complete documentation
- ✅ Automated deployment
- ✅ Enterprise security
- ✅ 100-year durability
- ✅ Future-proof design

## 🏆 FINAL DELIVERABLES

### Complete System
1. **Fully functional CareNest Enterprise system**
2. **Ready for immediate deployment**
3. **Complete source code with documentation**
4. **Automated deployment scripts**
5. **Complete test suite**
6. **CI/CD pipeline**
7. **Monitoring and alerting**
8. **Security and privacy protection**

### Documentation
1. **Complete user manual**
2. **Technical documentation**
3. **API documentation**
4. **Deployment guide**
5. **Maintenance guide**
6. **Troubleshooting guide**
7. **Security guide**
8. **Family guide**

### Support
1. **24/7 system monitoring**
2. **Automatic error recovery**
3. **Remote support capability**
4. **Update mechanism**
5. **Backup and restore**
6. **Performance optimization**
7. **Security updates**
8. **Feature enhancements**

## 🎉 READY FOR DEPLOYMENT

This complete prompt will create a **production-ready CareNest Enterprise system** that can be deployed immediately. The system includes:

- ✅ **Complete implementation** - Nothing missing
- ✅ **Ready to use** - Works immediately
- ✅ **Next day deployment** - Can be installed tomorrow
- ✅ **100% functional** - All features working
- ✅ **Enterprise quality** - Production-grade system
- ✅ **Zero configuration** - Works out of the box
- ✅ **Complete security** - Enterprise-grade protection
- ✅ **Automatic recovery** - Self-healing system
- ✅ **Family ready** - Complete family dashboard
- ✅ **Mother safe** - 24/7 health monitoring

**Give this prompt to any IDE AI and get a complete, ready-to-deploy CareNest Enterprise system!** 🚀

---

**🏥 CareNest Enterprise - Protecting your mother's health with AI-powered monitoring**

*Complete, production-ready, next-day deployment system*



## 🧠 ONE‑SHOT SETUP MASTER PROMPT (AI IDE के लिए कॉपी‑पेस्ट)



```text
SYSTEM GOAL:
- Prepare CareNest Enterprise repo for production on Raspberry Pi (or Linux), with secure remote access (autossh), UFW hardening, Fail2Ban, and a running web dashboard. All steps must be idempotent. Do not expose port 5000 to WAN. Ensure clean environment separation (local/development/staging/production) and centralized config/secrets handling.

YOUR CONSTRAINTS:
- Non‑interactive execution only; pass all non‑interactive flags.
- Use config.yaml as source of truth; if fields missing, add them with safe defaults.
- Create/enable systemd services atomically.
- Use SSH keys only; disable password SSH auth.
- Keep logs readable; fail fast on critical errors.

INPUTS TO FILL (REPLACE):
- RPI_HOSTNAME: <raspberrypi.local या IP>
- VPS_HOST: <your.vps.example.com>
- VPS_USER: <ubuntu>
- REMOTE_PORT: 5000 (या आपका चुना हुआ)
- LOCAL_PORT: 5000
- SSH_PORT: 22

HIGH‑LEVEL STEPS (execute in order):
1) Repo sanity
   - Verify folder structure matches project layout; create missing dirs (logs/, templates/, static/, models/ etc.).
   - Ensure Python 3.10+ and pip available.

2) Python setup
   - python -m venv .venv && source .venv/bin/activate (Windows में venv\Scripts\activate)
   - pip install --upgrade pip wheel setuptools
   - pip install -r requirements.txt

3) Environment & secrets
   - Create .env.example with all required keys (without secrets). Add .env to .gitignore.
   - Create per-env files: .env.local, .env.development, .env.staging, .env.production.
   - Load order (low to high): config.yaml -> .env.example defaults -> .env.<APP_ENV> -> process env.
   - APP_ENV (default: local) decides which .env.* to load via python-dotenv.
   - CI (GitHub Actions): map Secrets to ENV; do not commit secrets. For k8s: create Secret manifests.

4) config.yaml hardening/update
   - Ensure sections exist: camera, health_monitoring, communication, alert, privacy, system.
   - Ensure new sections exist (if absent then add):
     ssh_tunnel:
       enabled: true
       mode: "reverse"
       remote_host: "VPS_HOST"
       remote_user: "VPS_USER"
       remote_port: REMOTE_PORT
       local_port: LOCAL_PORT
       ssh_port: SSH_PORT
       keepalive: 60
       retries: 3
       gateway_ports: false
       key_path: "~/.ssh/mummycare_id_rsa"
     security:
       enforce_ssh_keys: true
       ufw:
         enabled: true
         allow_inbound_ports: [22]
       fail2ban:
         enabled: true
         maxretry: 5
         bantime: 3600
   - Persist config.yaml to disk.

5) SSH keys
   - Generate keypair at ~/.ssh/mummycare_id_rsa if missing (no passphrase).
   - Print public key for user to add on VPS (~/.ssh/authorized_keys).

6) OS packages (Debian/Ubuntu/RPi)
   - sudo apt-get update
   - sudo apt-get install -y autossh ufw fail2ban

7) Secure SSHD
   - Edit /etc/ssh/sshd_config: PasswordAuthentication no, PubkeyAuthentication yes, PermitRootLogin no
   - sudo systemctl restart ssh

8) UFW rules (principle of least privilege)
   - Default: deny incoming, allow outgoing
   - Allow inbound: 22
   - Explicitly deny 5000 from WAN (dashboard only via tunnel/VPN)
   - sudo ufw --force enable

9) Fail2Ban
   - Create /etc/fail2ban/jail.d/mummycare-ssh.conf for [sshd] with maxretry and bantime from config
   - Enable+restart fail2ban

10) Systemd services
   - Create/enable mummycare.service (ExecStart: python main.py in project dir)
   - Create/enable autossh-mummycare.service using config.yaml to build autossh command:
     reverse: -R REMOTE_PORT:localhost:LOCAL_PORT
     local:   -L LOCAL_PORT:localhost:REMOTE_PORT
     Include: -M 0 -N -o ServerAliveInterval=KEEPALIVE -o ServerAliveCountMax=RETRIES -i KEY_PATH -p SSH_PORT VPS_USER@VPS_HOST
   - sudo systemctl daemon-reload && sudo systemctl enable --now mummycare autossh-mummycare

11) App assets
   - Ensure templates/dashboard.html and static/dashboard.css/js exist (dashboard.py can autogenerate; call its initialize if required) or create empty dirs so runtime can write.

12) Docker & CI profiles (optional)
   - docker-compose.yml with profiles: [local, development, production].
   - docker-compose.override.yml for local overrides.
   - GitHub Actions workflows with env matrix and safe secrets usage.

13) Run & verify
   - Start services; check status and journal logs.
   - Confirm dashboard listening on localhost:5000.
   - Confirm reverse tunnel established to VPS and REMOTE_PORT open locally on VPS.
   - DO NOT open 5000 on WAN; access via VPS: http://localhost:REMOTE_PORT

OUTPUTS:
- Print: SSH public key path and contents.
- Print: VPS test command to verify: curl -I http://localhost:REMOTE_PORT
- Print: Local dashboard test: curl -I http://localhost:5000
- Print: systemctl status summaries for mummycare and autossh-mummycare
- Print: Next steps if VPS needs GatewayPorts yes.

VALIDATION GATES (fail if not met):
- autossh-mummycare.service active (running)
- mummycare.service active (running)
- UFW enabled; 22 allowed; 5000 denied
- Fail2Ban active
```