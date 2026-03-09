#!/bin/bash

# ============================================
# 🚀 SujetStore SvelteKit Deployment Script
# ============================================
# Deploys to: sujetstore.com (or your domain)
# Server: Contabo VPS
# ============================================

set -e

# Configuration
SERVER_IP="5.182.17.229"
SERVER_USER="root"
REMOTE_DIR="/var/www/sujetstore"
DOMAIN="sujetstore.com"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

SSH_CMD="ssh -i ./ssh_key -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP"
RSYNC_SSH="ssh -i ./ssh_key -o StrictHostKeyChecking=no"

echo ""
echo "============================================"
echo "  📚 SujetStore Deployment to $DOMAIN"
echo "============================================"
echo ""

# Check if IP is set correctly
if [ "$SERVER_IP" == "your_server_ip" ]; then
    error "Please edit this script and set your SERVER_IP."
fi

# Check SSH key exists
if [ ! -f "./ssh_key" ]; then
    error "SSH key not found. Place ssh_key in project root."
fi

chmod 600 ./ssh_key

# ============================================
# PHASE 1: SERVER SETUP (Run once)
# ============================================

setup_server() {
    log "Setting up server (first-time only)..."
    
    $SSH_CMD << 'ENDSSH'
# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl git unzip

# Install Bun
if ! command -v bun &> /dev/null; then
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
fi

# Install Caddy
if ! command -v caddy &> /dev/null; then
    apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt update
    apt install -y caddy
fi

echo "Server setup complete!"
ENDSSH
    
    success "Server setup complete!"
}

# ============================================
# PHASE 2: DEPLOY APPLICATION
# ============================================

deploy() {
    log "Creating remote directory..."
    $SSH_CMD "mkdir -p $REMOTE_DIR"

    log "Building application locally..."
    bun run build
    
    log "Syncing files to server..."
    rsync -avz --delete \
        -e "$RSYNC_SSH" \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '.svelte-kit' \
        --exclude 'ssh_key' \
        --exclude 'ssh_key.pub' \
        --exclude '*.log' \
        --exclude 'data' \
        --exclude '.env' \
        ./ $SERVER_USER@$SERVER_IP:$REMOTE_DIR

    log "Installing dependencies on server..."
    $SSH_CMD "cd $REMOTE_DIR && ~/.bun/bin/bun install --production"

    success "Files deployed!"
}

# ============================================
# PHASE 3: CONFIGURE SERVICES
# ============================================

configure_services() {
    log "Configuring systemd service..."
    
    $SSH_CMD << ENDSSH
# Create systemd service
cat > /etc/systemd/system/sujetstore.service << 'EOF'
[Unit]
Description=SujetStore SvelteKit Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/sujetstore
ExecStart=/root/.bun/bin/bun run build/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOST=0.0.0.0

[Install]
WantedBy=multi-user.target
EOF

# Configure Caddy
cat > /etc/caddy/Caddyfile << 'EOF'
$DOMAIN, www.$DOMAIN {
    reverse_proxy localhost:3000
    encode gzip zstd
    
    # Security headers
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
    }
    
    # Static files caching
    @static {
        path *.ico *.css *.js *.gif *.jpg *.jpeg *.png *.svg *.woff *.woff2 *.webp
    }
    header @static Cache-Control "public, max-age=31536000, immutable"
}
EOF

# Reload services
systemctl daemon-reload
systemctl enable sujetstore
systemctl restart caddy

ENDSSH

    success "Services configured!"
}

# ============================================
# PHASE 4: START APPLICATION
# ============================================

start_app() {
    log "Starting SujetStore application..."
    $SSH_CMD "systemctl restart sujetstore"
    
    sleep 3
    
    # Check status
    $SSH_CMD "systemctl status sujetstore --no-pager" || true
    
    success "Application started!"
    echo ""
    echo "============================================"
    echo "  🎉 Deployment Complete!"
    echo "  🌐 Visit: https://$DOMAIN"
    echo "============================================"
    echo ""
}

# ============================================
# HELPER COMMANDS
# ============================================

logs() {
    log "Showing application logs..."
    $SSH_CMD "journalctl -u sujetstore -f"
}

status() {
    log "Checking application status..."
    $SSH_CMD "systemctl status sujetstore --no-pager"
}

restart() {
    log "Restarting application..."
    $SSH_CMD "systemctl restart sujetstore"
    success "Application restarted!"
}

stop() {
    log "Stopping application..."
    $SSH_CMD "systemctl stop sujetstore"
    warn "Application stopped."
}

# ============================================
# MAIN
# ============================================

case "${1:-deploy}" in
    setup)
        setup_server
        ;;
    deploy)
        deploy
        start_app
        ;;
    full)
        setup_server
        deploy
        configure_services
        start_app
        ;;
    config)
        configure_services
        ;;
    logs)
        logs
        ;;
    status)
        status
        ;;
    restart)
        restart
        ;;
    stop)
        stop
        ;;
    *)
        echo "Usage: $0 {setup|deploy|full|config|logs|status|restart|stop}"
        echo ""
        echo "Commands:"
        echo "  setup   - First-time server setup (install Bun, Caddy)"
        echo "  deploy  - Deploy application (build + sync + restart)"
        echo "  full    - Complete deployment (setup + deploy + config)"
        echo "  config  - Configure systemd and Caddy"
        echo "  logs    - Show live application logs"
        echo "  status  - Check application status"
        echo "  restart - Restart application"
        echo "  stop    - Stop application"
        exit 1
        ;;
esac
