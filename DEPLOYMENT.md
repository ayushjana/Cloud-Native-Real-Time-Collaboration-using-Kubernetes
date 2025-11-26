# Deployment Guide

## ✅ Pre-Deployment Verification

All services have been verified and are working:
- ✅ MongoDB: Running on port 27017
- ✅ Backend API: Running on port 5000
- ✅ Frontend: Running on port 3000
- ✅ API endpoints tested and working
- ✅ Authentication working correctly

## 📦 Containerization

### Docker Images Created

1. **Backend Dockerfile** (`backend/Dockerfile`)
   - Node.js 18 Alpine base image
   - Optimized for production
   - Exposes port 5000

2. **Frontend Dockerfile** (`frontend/Dockerfile`)
   - Multi-stage build (Node.js builder + Nginx production)
   - Static files served via Nginx
   - Exposes port 80

### Build Docker Images

```bash
cd /home/keerthi/mern-chat-app

# Build backend
docker build -f backend/Dockerfile -t chat-app-backend:latest .

# Build frontend
docker build -f frontend/Dockerfile -t chat-app-frontend:latest .

# Or use the build script
chmod +x build-and-deploy.sh
./build-and-deploy.sh
```

### Test with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☸️ Kubernetes Deployment

### Prerequisites

1. Kubernetes cluster (minikube, kind, or cloud provider)
2. kubectl configured
3. Docker images built and available

### Quick Deploy

```bash
cd /home/keerthi/mern-chat-app/k8s

# 1. Create namespace
kubectl apply -f namespace.yaml

# 2. Create secrets and config
kubectl apply -f secret.yaml
kubectl apply -f configmap.yaml

# 3. Deploy MongoDB
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f mongodb-service.yaml

# 4. Wait for MongoDB
kubectl wait --for=condition=ready pod -l app=mongodb -n chat-app --timeout=120s

# 5. Deploy Backend
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# 6. Deploy Frontend
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# 7. (Optional) Deploy Ingress
kubectl apply -f ingress.yaml
```

### For Local Clusters (kind/minikube)

**kind:**
```bash
# Load images
kind load docker-image chat-app-backend:latest
kind load docker-image chat-app-frontend:latest
```

**minikube:**
```bash
eval $(minikube docker-env)
docker build -f backend/Dockerfile -t chat-app-backend:latest .
docker build -f frontend/Dockerfile -t chat-app-frontend:latest .
```

### Access the Application

**Port Forwarding:**
```bash
# Frontend
kubectl port-forward svc/frontend-service 3000:80 -n chat-app

# Backend
kubectl port-forward svc/backend-service 5000:5000 -n chat-app
```

**LoadBalancer (if supported):**
```bash
kubectl get svc frontend-service -n chat-app
# Use EXTERNAL-IP
```

### Check Status

```bash
# All resources
kubectl get all -n chat-app

# Pods
kubectl get pods -n chat-app

# Services
kubectl get svc -n chat-app

# Logs
kubectl logs -f deployment/backend -n chat-app
kubectl logs -f deployment/frontend -n chat-app
kubectl logs -f deployment/mongodb -n chat-app
```

## 🔧 Configuration

### Environment Variables

**Backend:**
- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens
- `FRONTEND_URL`: Frontend URL for CORS
- `NODE_ENV`: Environment (production/development)

**Frontend:**
- `REACT_APP_API_URL`: Backend API URL

### Secrets

**IMPORTANT:** Update JWT_SECRET before deploying:

```bash
# Generate secure secret
openssl rand -base64 32

# Update secret
kubectl create secret generic chat-app-secret \
  --from-literal=JWT_SECRET=your-secret-here \
  --namespace=chat-app \
  --dry-run=client -o yaml | kubectl apply -f -
```

## 📊 Scaling

```bash
# Scale backend
kubectl scale deployment backend --replicas=3 -n chat-app

# Scale frontend
kubectl scale deployment frontend --replicas=3 -n chat-app
```

## 🧹 Cleanup

```bash
# Delete all resources
kubectl delete namespace chat-app

# Or delete individually
kubectl delete -f k8s/
```

## 📝 Files Created

### Docker
- `backend/Dockerfile` - Backend container image
- `frontend/Dockerfile` - Frontend container image
- `frontend/nginx.conf` - Nginx configuration
- `.dockerignore` - Docker ignore file
- `docker-compose.yml` - Docker Compose configuration

### Kubernetes
- `k8s/namespace.yaml` - Namespace definition
- `k8s/configmap.yaml` - Configuration values
- `k8s/secret.yaml` - Secrets (JWT_SECRET)
- `k8s/mongodb-deployment.yaml` - MongoDB deployment
- `k8s/mongodb-service.yaml` - MongoDB service
- `k8s/backend-deployment.yaml` - Backend deployment
- `k8s/backend-service.yaml` - Backend service
- `k8s/frontend-deployment.yaml` - Frontend deployment
- `k8s/frontend-service.yaml` - Frontend service
- `k8s/ingress.yaml` - Ingress configuration
- `k8s/README.md` - Detailed deployment guide

### Scripts
- `build-and-deploy.sh` - Build and deployment script

## 🚀 Next Steps

1. **Build images** using `build-and-deploy.sh`
2. **Load/push images** to your cluster/registry
3. **Update secrets** with secure JWT_SECRET
4. **Deploy** using kubectl apply commands
5. **Verify** deployment status and access the app

For detailed instructions, see `k8s/README.md`

