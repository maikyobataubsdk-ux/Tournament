#!/usr/bin/env bash
set -e

echo "=================================================="
echo "    BOOYAHESPORTS DOMAIN & CLOUDFLARE SETUP       "
echo "=================================================="

# 1. Detect public IP
SERVER_IP=$(curl -s https://api.ipify.org || curl -s https://ifconfig.me || echo "COULD_NOT_DETECT")
echo "Detected VPS Public IPv4: $SERVER_IP"
echo ""

# 2. Domain prompt
read -p "Enter your primary domain (default: Booyahesports.in): " USER_DOMAIN
USER_DOMAIN=${USER_DOMAIN:-Booyahesports.in}
echo "Configuring domain: $USER_DOMAIN"
echo ""

# 3. Choose Cloudflare Method
echo "Select Cloudflare Connection Method:"
echo "  1) Method A: Cloudflare DNS (A Record / CNAME) [Recommended with public IP]"
echo "  2) Method B: Cloudflare Tunnel (cloudflared)   [Ideal for firewalled/NAT VPS]"
read -p "Enter selection [1 or 2] (default: 1): " METHOD_CHOICE
METHOD_CHOICE=${METHOD_CHOICE:-1}

if [ "$METHOD_CHOICE" == "1" ]; then
    echo ""
    echo "--------------------------------------------------"
    echo "  METHOD A: CLOUDFLARE DNS CONFIGURATION STEPS    "
    echo "--------------------------------------------------"
    echo "1. Log into your Cloudflare Dashboard (dash.cloudflare.com)."
    echo "2. Select your domain: $USER_DOMAIN"
    echo "3. Go to DNS -> Records -> Add Record:"
    echo "   - Type: A"
    echo "   - Name: @"
    echo "   - IPv4 Address: $SERVER_IP"
    echo "   - Proxy Status: Proxied (Orange Cloud ON)"
    echo ""
    echo "   - Type: CNAME"
    echo "   - Name: www"
    echo "   - Target: $USER_DOMAIN"
    echo "   - Proxy Status: Proxied (Orange Cloud ON)"
    echo ""
    echo "4. In Cloudflare SSL/TLS -> Overview, set encryption to: Full (Strict)"
    echo "--------------------------------------------------"
    CLOUDFLARE_METHOD="dns"
else
    echo ""
    echo "--------------------------------------------------"
    echo "  METHOD B: CLOUDFLARE TUNNEL CONFIGURATION STEPS "
    echo "--------------------------------------------------"
    echo "1. Go to Cloudflare Zero Trust -> Networks -> Tunnels."
    echo "2. Create a new tunnel named 'booyahesports-tunnel'."
    echo "3. Copy your Cloudflare Tunnel Token."
    read -p "Enter your Cloudflare Tunnel Token: " TUNNEL_TOKEN
    CLOUDFLARE_METHOD="tunnel"
    CLOUDFLARE_TUNNEL_TOKEN="$TUNNEL_TOKEN"
    echo "--------------------------------------------------"
fi

# 4. Generate or update .env
cat <<EOF > .env
DOMAIN=$USER_DOMAIN
PUBLIC_BASE_URL=https://$USER_DOMAIN
API_BASE_URL=https://$USER_DOMAIN/api
ADMIN_BASE_URL=https://$USER_DOMAIN/admin
DOWNLOAD_BASE_URL=https://$USER_DOMAIN/download
JWT_SECRET=$(head -c 32 /dev/urandom | base64)
ADMIN_EMAIL=admin@booyahesports.in
ADMIN_INITIAL_PASSWORD=12345678
DATA_DIR=/app/data
RELEASES_DIR=/app/releases
UPLOADS_DIR=/app/uploads
CLOUDFLARE_METHOD=$CLOUDFLARE_METHOD
CLOUDFLARE_TUNNEL_TOKEN=$CLOUDFLARE_TUNNEL_TOKEN
EOF

echo ""
echo "✅ Environment configured in .env!"
echo ""
echo "Final Service URLs:"
echo "  - Public Website:    https://$USER_DOMAIN"
echo "  - Android Download:  https://$USER_DOMAIN/download"
echo "  - Admin Panel:       https://$USER_DOMAIN/admin"
echo "  - API Documentation: https://$USER_DOMAIN/api/docs"
echo "  - System Health:     https://$USER_DOMAIN/api/v1/app/health"
echo "=================================================="
