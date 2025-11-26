# Kubernetes Deployment Guide

## Prerequisites

1. Kubernetes cluster (minikube, kind, or cloud provider)
2. kubectl configured to access your cluster
3. Docker images built and available in your cluster

## Deployment Steps

### 1. Build Docker Images

```bash
cd /home/keerthi/mern-chat-app
chmod +x build-and-deploy.sh
./build-and-deploy.sh
```

### 2. Load Images to Cluster (for local clusters like kind/minikube)

**For kind:**
```bash
kind load docker-image chat-app-backend:latest
kind load docker-image chat-app-frontend:latest
```

**For minikube:**
```bash
eval $(minikube docker-env)
docker build -f backend/Dockerfile -t chat-app-backend:latest .
docker build -f frontend/Dockerfile -t chat-app-frontend:latest .
```

### 3. Update Image Names in Deployment Files

If using a container registry, update the image names in:
- `k8s/backend-deployment.yaml`
- `k8s/frontend-deployment.yaml`

Change:
```yaml
image: chat-app-backend:latest
```
To:
```yaml
image: your-registry/chat-app-backend:latest
```

### 4. Update Secrets

**IMPORTANT:** Update the JWT_SECRET in `k8s/secret.yaml` with a strong secret:

```bash
# Generate a secure secret
openssl rand -base64 32

# Update secret.yaml or create via kubectl:
kubectl create secret generic chat-app-secret \
  --from-literal=JWT_SECRET=your-generated-secret \
  --namespace=chat-app
```

### 5. Update ConfigMap

Update `k8s/configmap.yaml` with your actual MongoDB URI and frontend URL if different.

### 6. Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets and configmap
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml

# Deploy MongoDB
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/mongodb-service.yaml

# Wait for MongoDB to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n chat-app --timeout=120s

# Deploy Backend
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Deploy Frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# (Optional) Deploy Ingress
kubectl apply -f k8s/ingress.yaml
```

### 7. Check Deployment Status

```bash
# Check pods
kubectl get pods -n chat-app

# Check services
kubectl get svc -n chat-app

# Check logs
kubectl logs -f deployment/backend -n chat-app
kubectl logs -f deployment/frontend -n chat-app
kubectl logs -f deployment/mongodb -n chat-app
```

### 8. Access the Application

**Using LoadBalancer (if supported):**
```bash
kubectl get svc frontend-service -n chat-app
# Use the EXTERNAL-IP
```

**Using Port Forwarding:**
```bash
# Frontend
kubectl port-forward svc/frontend-service 3000:80 -n chat-app

# Backend
kubectl port-forward svc/backend-service 5000:5000 -n chat-app
```

**Using Ingress:**
```bash
# Add to /etc/hosts (or equivalent)
# <ingress-ip> chat-app.local

# Access at http://chat-app.local
```

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name> -n chat-app
kubectl logs <pod-name> -n chat-app
```

### MongoDB connection issues
```bash
# Check MongoDB service
kubectl get svc mongodb-service -n chat-app

# Test connection from backend pod
kubectl exec -it deployment/backend -n chat-app -- sh
# Inside pod: ping mongodb-service
```

### Image pull errors
- Ensure images are loaded/pushed correctly
- Check imagePullPolicy in deployment files
- Verify image names match

## Scaling

```bash
# Scale backend
kubectl scale deployment backend --replicas=3 -n chat-app

# Scale frontend
kubectl scale deployment frontend --replicas=3 -n chat-app
```

## Cleanup

```bash
# Delete all resources
kubectl delete namespace chat-app

# Or delete individually
kubectl delete -f k8s/
```

