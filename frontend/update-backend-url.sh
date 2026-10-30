#!/usr/bin/env bash
set -e

# ==============================================================================
# Script: update-backend-url.sh
# Purpose: Dynamically update the backend API and WebSocket endpoints in Frontend
# Usage:
#   ./update-backend-url.sh <backend-ip-or-url>
# Examples:
#   ./update-backend-url.sh 3.25.130.67
#   ./update-backend-url.sh 3.25.130.67:8080
#   ./update-backend-url.sh http://3.25.130.67:8080
#   ./update-backend-url.sh https://api.datingapp.com
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# If run from project root, locate frontend directory
if [ -d "${SCRIPT_DIR}/frontend" ]; then
    FRONTEND_DIR="${SCRIPT_DIR}/frontend"
    ROOT_DIR="${SCRIPT_DIR}"
else
    FRONTEND_DIR="${SCRIPT_DIR}"
    ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
fi

ENV_LOCAL="${FRONTEND_DIR}/.env.local"
ENV_FILE="${FRONTEND_DIR}/.env"

RAW_INPUT="$1"
if [ -z "$RAW_INPUT" ]; then
    echo "========================================================"
    echo " Dating App - Update Frontend Backend URL"
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

# Strip trailing /api/v1 or /api or /ws if provided by mistake
INPUT="${INPUT%/api/v1}"
INPUT="${INPUT%/api}"
INPUT="${INPUT%/ws}"

# Determine protocol and port
if [[ "$INPUT" =~ ^https?:// ]]; then
    BASE_URL="$INPUT"
else
    # Does not start with http:// or https://
    if [[ "$INPUT" == *:* ]]; then
        # Already includes a custom port (e.g. 3.25.130.67:8080)
        BASE_URL="http://${INPUT}"
    else
        # Raw IP or domain without port -> default Spring Boot port is 8080
        BASE_URL="http://${INPUT}:8080"
    fi
fi

API_BASE_URL="${BASE_URL}/api/v1"
WS_URL="${BASE_URL}/ws"

echo "Configuring Frontend Endpoints:"
echo "  - REST API Base:  ${API_BASE_URL}"
echo "  - STOMP WebSocket: ${WS_URL}"
echo ""

# Function to update or set key=value in a file
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

# Also sync to root .env.local if present so root compose shares it
if [ -f "${ROOT_DIR}/.env.local" ]; then
    update_env_var "${ROOT_DIR}/.env.local" "VITE_API_BASE_URL" "$API_BASE_URL"
    update_env_var "${ROOT_DIR}/.env.local" "VITE_WS_URL" "$WS_URL"
fi

echo "Successfully saved endpoint configuration to ${ENV_LOCAL}!"
echo ""

# Check Docker container status and rebuild/restart if needed
if command -v docker >/dev/null 2>&1; then
    IS_CONTAINER_RUNNING=false
    if docker ps --format '{{.Names}}' | grep -q "^dating-frontend$"; then
        IS_CONTAINER_RUNNING=true
    fi

    if [ "$IS_CONTAINER_RUNNING" = true ]; then
        echo "Active container 'dating-frontend' detected. Rebuilding bundle with new endpoints..."
        if [ -f "${FRONTEND_DIR}/docker-compose.yml" ]; then
            (cd "${FRONTEND_DIR}" && docker compose --env-file "${ENV_LOCAL}" up -d --build)
        elif [ -f "${ROOT_DIR}/docker-compose.yml" ]; then
            (cd "${ROOT_DIR}" && docker compose --env-file "${ENV_LOCAL}" up -d --build frontend)
        else
            docker build \
                --build-arg VITE_API_BASE_URL="${API_BASE_URL}" \
                --build-arg VITE_WS_URL="${WS_URL}" \
                -t dating-frontend "${FRONTEND_DIR}"
            docker stop dating-frontend >/dev/null 2>&1 || true
            docker rm dating-frontend >/dev/null 2>&1 || true
            docker run -d --name dating-frontend -p "${FRONTEND_PORT:-3000}:80" --restart unless-stopped dating-frontend
        fi
        echo "Frontend container reloaded with new backend endpoints!"
    else
        echo "To build and start the frontend container, run:"
        echo "  cd ${FRONTEND_DIR} && docker compose up -d --build"
        echo ""
        echo "Or run standalone with Dockerfile:"
        echo "  cd ${FRONTEND_DIR}"
        echo "  docker build --build-arg VITE_API_BASE_URL=\"${API_BASE_URL}\" --build-arg VITE_WS_URL=\"${WS_URL}\" -t dating-frontend ."
        echo "  docker run -d --name dating-frontend -p 3000:80 --restart unless-stopped dating-frontend"
    fi
fi

echo ""
echo "========================================================"
echo " IMPORTANT NEXT STEP FOR CORS:"
echo " Ensure your Backend EC2 instance allows requests from this Frontend!"
echo " On your Backend EC2, run:"
echo "   ./scripts/update-cors.sh <YOUR_FRONTEND_EC2_PUBLIC_IP>"
echo "========================================================"
