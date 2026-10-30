#!/usr/bin/env bash
# Forwarding wrapper to scripts/update-backend-url.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "${SCRIPT_DIR}/../scripts/update-backend-url.sh" "$@"
