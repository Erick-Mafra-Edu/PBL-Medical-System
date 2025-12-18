---
tags:
  - deployment
  - docker
  - kubernetes
  - production
created: 2025-12-18
type: documentation
---

# 🚀 Deployment Guide

> [!INFO]
> Complete guide for deploying the PBL Medical System to production environments

---

## 📍 Deployment Targets

- **Development**: Local Docker Compose
- **Staging**: Docker Compose on server
- **Production**: Kubernetes or managed container services

---

## 🐳 Local Development Deployment

### Prerequisites

```bash
# Required software
- Docker Desktop (v20.10+)
- Docker Compose (v2.0+)
- Node.js 18+
- Python 3.10+
```

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/PBL-Medical-System.git
cd PBL-Medical-System

# Create environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Initialize database
npm run migrate

# Seed test data (optional)
npm run seed

# Access applications
- Frontend: http://localhost:3000
- API Gateway: http://localhost:3001
- MinIO Console: http://localhost:9001
```

### Environment Configuration

**`.env` file**:
```bash
# Database
DATABASE_URL=postgresql://pbl_user:pbl_password@postgres:5432/pbl_medical

# Redis
REDIS_URL=redis://redis:6379

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=pbl-medical-system

# AI Service
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

---

## 🐙 Kubernetes Deployment

### Prerequisites

```bash
# Required tools
- kubectl (v1.24+)
- helm (v3.0+)
- Docker registry access
```

### Deployment Steps

#### 1. Build and Push Images

```bash
# Build images
docker build -t pbl-medical/frontend:1.0 ./frontend
docker build -t pbl-medical/api-gateway:1.0 ./backend/api-gateway
docker build -t pbl-medical/flashcard-engine:1.0 ./backend/flashcard-engine
docker build -t pbl-medical/obsidian-sync:1.0 ./backend/obsidian-sync
docker build -t pbl-medical/ai-service:1.0 ./backend/ai-service

# Push to registry
docker push pbl-medical/frontend:1.0
docker push pbl-medical/api-gateway:1.0
docker push pbl-medical/flashcard-engine:1.0
docker push pbl-medical/obsidian-sync:1.0
docker push pbl-medical/ai-service:1.0
```

#### 2. Create Kubernetes Manifests

**`k8s/namespace.yaml`**:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: pbl-medical
```

**`k8s/secrets.yaml`**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: pbl-medical
type: Opaque
stringData:
  DATABASE_URL: postgresql://user:pass@postgres:5432/pbl_medical
  REDIS_URL: redis://redis:6379
  OPENAI_API_KEY: your-key
  NEXTAUTH_SECRET: your-secret
```

**`k8s/deployments.yaml`** (Example - Frontend):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: pbl-medical
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: pbl-medical/frontend:1.0
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.example.com"
        - name: NEXTAUTH_URL
          value: "https://example.com"
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: NEXTAUTH_SECRET
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
```

**`k8s/services.yaml`**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: pbl-medical
spec:
  selector:
    app: frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

**`k8s/ingress.yaml`**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: pbl-medical
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - example.com
    secretName: app-tls
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-gateway-service
            port:
              number: 3001
```

#### 3. Deploy to Cluster

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets
kubectl apply -f k8s/secrets.yaml

# Deploy PostgreSQL
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgres bitnami/postgresql \
  --namespace pbl-medical \
  --values k8s/postgres-values.yaml

# Deploy Redis
helm install redis bitnami/redis \
  --namespace pbl-medical \
  --values k8s/redis-values.yaml

# Deploy MinIO
helm install minio bitnami/minio \
  --namespace pbl-medical \
  --values k8s/minio-values.yaml

# Deploy application services
kubectl apply -f k8s/deployments.yaml
kubectl apply -f k8s/services.yaml
kubectl apply -f k8s/ingress.yaml

# Verify deployment
kubectl get pods -n pbl-medical
kubectl get services -n pbl-medical
```

---

## ☁️ Cloud Deployment (AWS Example)

### Using AWS ECS

#### 1. Create ECR Repositories

```bash
aws ecr create-repository --repository-name pbl-medical/frontend
aws ecr create-repository --repository-name pbl-medical/api-gateway
aws ecr create-repository --repository-name pbl-medical/flashcard-engine
aws ecr create-repository --repository-name pbl-medical/obsidian-sync
aws ecr create-repository --repository-name pbl-medical/ai-service
```

#### 2. Push Images to ECR

```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag pbl-medical/frontend:1.0 <account>.dkr.ecr.us-east-1.amazonaws.com/pbl-medical/frontend:1.0
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/pbl-medical/frontend:1.0
```

#### 3. Create ECS Task Definitions

```bash
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json
```

**`task-definition.json`**:
```json
{
  "family": "pbl-medical-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "<account>.dkr.ecr.us-east-1.amazonaws.com/pbl-medical/frontend:1.0",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NEXT_PUBLIC_API_URL",
          "value": "https://api.example.com"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/pbl-medical-frontend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

---

## 📊 Health Checks & Monitoring

### Health Check Endpoints

```bash
# Frontend
GET http://localhost:3000/health

# API Gateway
GET http://localhost:3001/health

# Flashcard Engine
GET http://localhost:3002/health

# AI Service
GET http://localhost:8000/health
```

### Monitoring with Prometheus

**`prometheus.yml`**:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/metrics'

  - job_name: 'flashcard-engine'
    static_configs:
      - targets: ['localhost:3002']
    metrics_path: '/metrics'
```

### Logging with ELK Stack

```bash
# Deploy Elasticsearch
docker run -d \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  docker.elastic.co/elasticsearch/elasticsearch:7.14.0

# Deploy Kibana
docker run -d \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  docker.elastic.co/kibana/kibana:7.14.0
```

---

## 🔐 Security Checklist

- ✅ Enable HTTPS/TLS
- ✅ Configure firewall rules
- ✅ Set up API authentication
- ✅ Enable database encryption
- ✅ Configure backup strategy
- ✅ Enable audit logging
- ✅ Set up secrets management
- ✅ Configure rate limiting
- ✅ Enable WAF (Web Application Firewall)
- ✅ Regular security scanning

---

## 🔄 CI/CD Integration

### GitHub Actions Deployment

```yaml
name: Deploy to Production
on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Kubernetes
        env:
          KUBECONFIG: ${{ secrets.KUBECONFIG }}
        run: |
          kubectl apply -f k8s/
          kubectl set image deployment/frontend \
            frontend=pbl-medical/frontend:${{ github.ref_name }}
```

---

## 📈 Scaling Strategies

### Horizontal Scaling

```bash
# Scale frontend to 3 replicas
kubectl scale deployment frontend --replicas=3 -n pbl-medical

# Auto-scaling based on CPU
kubectl autoscale deployment frontend \
  --min=2 \
  --max=10 \
  --cpu-percent=80 \
  -n pbl-medical
```

### Load Balancing

- **Frontend**: Nginx reverse proxy
- **Backend**: HAProxy or cloud load balancer
- **Database**: Connection pooling with PgBouncer

---

## 🔙 Backup & Recovery

### Database Backups

```bash
# Manual backup
pg_dump pbl_medical > backup.sql

# Automated daily backups
0 2 * * * pg_dump pbl_medical > /backups/pbl_$(date +\%Y-\%m-\%d).sql

# Restore from backup
psql pbl_medical < backup.sql
```

### File Storage Backups

```bash
# MinIO backup
mc mirror minio/pbl-medical-system /backup/pbl-medical-system

# S3 sync backup
aws s3 sync s3://my-bucket /backup/bucket
```

---

## 🔗 Related Documentation

- [[CI-CD Pipeline]] - Automated workflows
- [[Architecture Overview]] - System design
- [[Docker Configuration]] - Docker setup
- [[Database Schema]] - Data management

---

**Last Updated**: 2025-12-18  
**Status**: ✅ Production Ready  
**Supported Platforms**: Docker, Kubernetes, AWS, Azure, GCP
