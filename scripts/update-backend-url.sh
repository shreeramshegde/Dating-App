#!/usr/bin/env bash
set -e

# ==============================================================================
# Script: update-backend-url.sh
# Location: scripts/update-backend-url.sh
# Purpose: Dynamically update backend API and STOMP WebSocket endpoints in Frontend
# Usage:
#   ./scripts/update-backend-url.sh <backend-ip-or-url>
# Examples:
#   ./scripts/update-backend-url.sh 3.25.130.67
#   ./scripts/update-backend-url.sh 3.25.130.67:8080
#   ./scripts/update-backend-url.sh http://3.25.130.67:8080
#   ./scripts/update-backend-url.sh https://api.datingapp.com
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"

if [ ! -d "${FRONTEND_DIR}" ]; then
    # In case the repository was cloned as just the frontend folder
    FRONTEND_DIR="${ROOT_DIR}"
fi

ENV_LOCAL="${FRONTEND_DIR}/.env.local"
ENV_FILE="${FRONTEND_DIR}/.env"

RAW_INPUT="$1"
if [ -z "$RAW_INPUT" ]; then
    echo "========================================================"
    echo " MeaowMatch - Update Frontend Backend URL"
    echo "========================================================"
    read -rp "Enter Backend EC2 IP, Domain, or URL (e.g. 3.25.130.67 or http://3.25.130.67:8080): " RAW_INPUT
fi

if [ -z "$RAW_INPUT" ]; then
    echo "Error: No backend IP or URL provided. Configuration unchanged."
    exit 1
fi

# Trim whitespace
INPUT="$(echo "$RAW_INPUT" | xargs)"

# Strip trailing slashes
INPUT="${INPUT%/}"

# Strip trailing path segments if provided by mistake
INPUT="${INPUT%/api/v1}"
INPUT="${INPUT%/api}"
INPUT="${INPUT%/ws}"

# Determine protocol and port
if [[ "$INPUT" =~ ^https?:// ]]; then
    BASE_URL="$INPUT"
else
    # Does not start with http:// or https://
    if [[ "$INPUT" == *:* ]]; then
        # Already includes custom port (e.g. 3.25.130.67:8080)
        BASE_URL="http://${INPUT}"
    else
        # Raw IP or domain without port -> default Spring Boot port is 8080
        BASE_URL="http://${INPUT}:8080"
    fi
fi

API_BASE_URL="${BASE_URL}/api/v1"
WS_URL="${BASE_URL}/ws"

echo "Configuring Frontend Endpoints:"
echo "  - REST API Base:   ${API_BASE_URL}"
echo "  - STOMP WebSocket: ${WS_URL}"
echo ""

# Helper to update key=value in a file
update_env_var() {
    local file="$1"
    local key="$2"
    local value="$3"

    [ ! -f "$file" ] && touch "$file"

    if grep -q "^${key}=" "$file"; then
        sed -i.bak "s|^${key}=.*|${key}=${value}|" "$file" && rm -f "${file}.bak"
    else
        echo "${key}=${value}" >> "$file"
    fi
}

echo "Updating ${ENV_LOCAL}..."
update_env_var "$ENV_LOCAL" "VITE_API_BASE_URL" "$API_BASE_URL"
update_env_var "$ENV_LOCAL" "VITE_WS_URL" "$WS_URL"

if [ -f "$ENV_FILE" ]; then
    echo "Updating ${ENV_FILE}..."
    update_env_var "$ENV_FILE" "VITE_API_BASE_URL" "$API_BASE_URL"
    update_env_var "$ENV_FILE" "VITE_WS_URL" "$WS_URL"
fi

# Sync to root .env.local if present
if [ -f "${ROOT_DIR}/.env.local" ]; then
    update_env_var "${ROOT_DIR}/.env.local" "VITE_API_BASE_URL" "$API_BASE_URL"
    update_env_var "${ROOT_DIR}/.env.local" "VITE_WS_URL" "$WS_URL"
fi

echo "Successfully saved endpoint configuration to ${ENV_LOCAL}!"
echo ""

# Reload or rebuild Docker container if Docker is installed
if command -v docker >/dev/null 2>&1; then
    echo "Checking Docker containers..."

    # Crucial: remove any existing container named 'meaowmatch-frontend' or 'dating-frontend'
    # to completely prevent 'Conflict: container name is already in use' daemon error
    for cname in "meaowmatch-frontend" "dating-frontend"; do
        if docker ps -a --format '{{.Names}}' | grep -q "^${cname}$"; then
            echo "Clearing existing '${cname}' container to prevent Docker naming conflict..."
            docker rm -f "${cname}" >/dev/null 2>&1 || true
        fi
    done

    # Check if frontend docker-compose exists
    if [ -f "${FRONTEND_DIR}/docker-compose.yml" ]; then
        echo "Building and launching frontend via Docker Compose..."
        (cd "${FRONTEND_DIR}" && docker compose --env-file "${ENV_LOCAL}" up -d --build)
        echo "Frontend container restarted cleanly on port ${FRONTEND_PORT:-3000}!"
    elif [ -f "${ROOT_DIR}/docker-compose.yml" ]; then
        echo "Building and launching frontend via Root Docker Compose..."
        (cd "${ROOT_DIR}" && docker compose --env-file "${ENV_LOCAL}" up -d --build frontend)
        echo "Frontend container restarted cleanly on port ${FRONTEND_PORT:-3000}!"
    else
        echo "Building and launching standalone Docker container..."
        docker build \
            --build-arg VITE_API_BASE_URL="${API_BASE_URL}" \
            --build-arg VITE_WS_URL="${WS_URL}" \
            -t meaowmatch-frontend "${FRONTEND_DIR}"
        docker run -d --name meaowmatch-frontend -p "${FRONTEND_PORT:-3000}:80" --restart unless-stopped meaowmatch-frontend
        echo "meaowmatch-frontend container running on port ${FRONTEND_PORT:-3000}!"
    fi
fi

echo ""
echo "========================================================"
echo " IMPORTANT NEXT STEP FOR CORS:"
echo " Ensure your Backend EC2 instance allows requests from this Frontend!"
echo " On your Backend EC2, run:"
echo "   ./scripts/update-cors.sh <YOUR_FRONTEND_EC2_PUBLIC_IP>"
echo "========================================================"
