#!/bin/bash
# ==============================================================================
#   TOGETHER Music Bot — Pterodactyl & Linux Universal Launcher
#   Supports Pterodactyl panels, Docker containers, Ubuntu, Debian, Alpine
# ==============================================================================

echo "=================================================="
echo "   TOGETHER Music Bot — Linux / Pterodactyl Launcher"
echo "=================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAVALINK_DIR="$SCRIPT_DIR/lavalink"

# 1. Ensure permissions for standalone helper binaries
if [ -d "$SCRIPT_DIR/bin" ]; then
  chmod -R +x "$SCRIPT_DIR/bin" 2>/dev/null || true
fi

# 2. Check if external Java Lavalink node is present (Optional)
LAVALINK_JAR=""
if [ -f "$LAVALINK_DIR/Lavalink.jar" ]; then
  LAVALINK_JAR="$LAVALINK_DIR/Lavalink.jar"
elif [ -f "$LAVALINK_DIR/lavalink.jar" ]; then
  LAVALINK_JAR="$LAVALINK_DIR/lavalink.jar"
elif [ -f "/home/container/lavalink/Lavalink.jar" ]; then
  LAVALINK_JAR="/home/container/lavalink/Lavalink.jar"
elif [ -f "/home/container/lavalink/lavalink.jar" ]; then
  LAVALINK_JAR="/home/container/lavalink/lavalink.jar"
fi

LAVALINK_PID=""
if [ -n "$LAVALINK_JAR" ] && command -v java >/dev/null 2>&1; then
  echo "[1/2] Starting External Lavalink Node..."
  if [ -f "$SCRIPT_DIR/application.yml" ] && [ ! -f "$LAVALINK_DIR/application.yml" ]; then
    cp "$SCRIPT_DIR/application.yml" "$LAVALINK_DIR/application.yml"
  fi
  (cd "$LAVALINK_DIR" && java -jar "$LAVALINK_JAR") &
  LAVALINK_PID=$!
  echo "      Waiting 15 seconds for Lavalink to initialize..."
  sleep 15
else
  echo "[INFO] External Lavalink not configured — Utilizing Native TOGETHER Audio Engine (Pure JavaScript)."
fi

# 3. Start Discord Bot
echo "[2/2] Starting TOGETHER Discord Bot..."
node devrock.js

# Clean exit
if [ -n "$LAVALINK_PID" ]; then
  echo "[INFO] Bot stopped. Terminating background Lavalink..."
  kill "$LAVALINK_PID" 2>/dev/null
  wait "$LAVALINK_PID" 2>/dev/null
fi
echo "[INFO] Shutdown complete."