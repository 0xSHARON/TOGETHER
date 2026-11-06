#!/bin/bash
set -e

echo "============================================="
echo " Deploying Nginx & SSL for help.together.dpdns.org"
echo "============================================="

CONF_SRC="/home/imadmin/app/together-helper/nginx.help.together.dpdns.org.conf"
CONF_DEST="/etc/nginx/sites-available/help.together.dpdns.org"
LINK_DEST="/etc/nginx/sites-enabled/help.together.dpdns.org"

if [ ! -f "$CONF_SRC" ]; then
    echo "Error: $CONF_SRC not found!"
    exit 1
fi

echo "[1/4] Copying site configuration..."
cp "$CONF_SRC" "$CONF_DEST"

echo "[2/4] Enabling site symlink..."
ln -sf "$CONF_DEST" "$LINK_DEST"

echo "[3/4] Testing and reloading Nginx..."
nginx -t
systemctl reload nginx

echo "[4/4] Generating SSL Certificate with Certbot..."
certbot --nginx -d help.together.dpdns.org --non-interactive --agree-tos --redirect -m admin@together.dpdns.org || certbot --nginx -d help.together.dpdns.org

echo "============================================="
echo " 🎉 Successfully deployed: https://help.together.dpdns.org/"
echo "============================================="

