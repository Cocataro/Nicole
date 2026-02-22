#!/bin/bash
# OpenClaw Dashboard — start script

cd "$(dirname "$0")"

# Check if already running
if lsof -ti:4200 > /dev/null 2>&1; then
  echo "Dashboard already running on port 4200"
  TSIP=$(tailscale ip -4 2>/dev/null)
  echo "  Local:     http://localhost:4200"
  [ -n "$TSIP" ] && echo "  Tailscale: http://$TSIP:4200"
  exit 0
fi

echo "Starting OpenClaw Dashboard..."
node server.js
