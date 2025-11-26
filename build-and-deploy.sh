#!/bin/bash

set -e

echo "=== Building Docker Images ==="

# Build backend image
echo "Building backend image..."
docker build -f backend/Dockerfile -t chat-app-backend:latest .

# Build frontend image
echo "Building frontend image..."
docker build -f frontend/Dockerfile -t chat-app-frontend:latest .

echo "=== Images built successfully ==="
echo ""
echo "Backend image: chat-app-backend:latest"
echo "Frontend image: chat-app-frontend:latest"
echo ""
echo "=== To deploy to Kubernetes ==="
echo "1. Load images to your cluster (if using local cluster):"
echo "   kind load docker-image chat-app-backend:latest"
echo "   kind load docker-image chat-app-frontend:latest"
echo ""
echo "2. Or push to a container registry:"
echo "   docker tag chat-app-backend:latest your-registry/chat-app-backend:latest"
echo "   docker tag chat-app-frontend:latest your-registry/chat-app-frontend:latest"
echo "   docker push your-registry/chat-app-backend:latest"
echo "   docker push your-registry/chat-app-frontend:latest"
echo ""
echo "3. Apply Kubernetes manifests:"
echo "   kubectl apply -f k8s/"

