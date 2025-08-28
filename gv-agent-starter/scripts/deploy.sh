#!/usr/bin/env bash
set -euo pipefail
IMAGE="${DOCKER_IMAGE:-guestsvalencia/web:latest}"
docker build -f docker/Dockerfile.backend -t "${IMAGE}-backend" backend
docker build -f docker/Dockerfile.frontend -t "${IMAGE}-frontend" frontend
echo "Built images: ${IMAGE}-backend and ${IMAGE}-frontend"
