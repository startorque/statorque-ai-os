# Deployment Guide - StarTorque AI OS

## Prerequisites

- Node.js 20+ or Docker
- npm 10+
- Git

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm install --omit=dev
npm run build
npm start
```

## Docker Deployment

### Build Image

```bash
docker build -t startorque-ai-os:latest .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e LOG_LEVEL=info \
  startorque-ai-os:latest
```

## Platform-Specific Deployment

### Vercel

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Configure build command**
   ```
   npm run build
   ```

3. **Configure start command**
   ```
   npm start
   ```

4. **Set Environment Variables**
   - NODE_ENV=production
   - PORT=3000

5. **Deploy**
   ```bash
   vercel deploy --prod
   ```

**Vercel Limitations**: Serverless functions have 10-second timeout. Use hobby tier for persistent execution.

### Railway

1. **Create Project**
   ```bash
   railway init
   ```

2. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=$PORT (auto-set by Railway)
   LOG_LEVEL=info
   ```

3. **Deploy**
   ```bash
   railway up
   ```

**Railway Benefits**: Native Node.js support, persistent processes, easy scaling.

### Render

1. **Connect Repository**
   - Go to https://dashboard.render.com
   - New + Web Service
   - Connect GitHub repo

2. **Configure**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node
   - Plan: Paid (free tier will sleep)

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   LOG_LEVEL=info
   ```

**Render Features**: Auto-deploys, SSL included, good for production.

### Docker / Container

#### Docker Compose

```yaml
version: '3.8'

services:
  statorque:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      LOG_LEVEL: info
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 5s
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

#### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: statorque-ai-os
spec:
  replicas: 3
  selector:
    matchLabels:
      app: statorque-ai-os
  template:
    metadata:
      labels:
        app: statorque-ai-os
    spec:
      containers:
      - name: statorque
        image: startorque/statorque-ai-os:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: LOG_LEVEL
          value: "info"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
```

Deploy:
```bash
kubectl apply -f deployment.yaml
```

## Monitoring

### Health Checks

```bash
curl http://localhost:3000/api/health
```

### Status Endpoint

```bash
curl http://localhost:3000/api/status
```

### Metrics

```bash
curl http://localhost:3000/api/metrics
```

## Scaling

### Horizontal Scaling

- Use Docker/Kubernetes for load balancing
- Railway and Render auto-scale based on traffic

### Vertical Scaling

- Increase instance size
- Optimize Node.js memory: `--max-old-space-size=2048`

## Rollback

### Docker

```bash
docker run -p 3000:3000 startorque-ai-os:v1.0.0
```

### Vercel

```bash
vercel rollback
```

### Render / Railway

Both platforms maintain deployment history for easy rollback.

## Performance Tuning

### Environment Variables

```
NODE_ENV=production
LOG_LEVEL=warn (reduce logging overhead)
```

### Node.js Options

```bash
node --max-old-space-size=2048 dist/index.js
```

### Compression

Built-in via Express middleware (enable in production)

## Security Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS/TLS
- [ ] Rotate secrets regularly
- [ ] Enable rate limiting
- [ ] Run as non-root user (Docker)
- [ ] Use security headers
- [ ] Scan dependencies: `npm audit`

## Troubleshooting

### Port Already in Use

```bash
lsof -i :3000
kill -9 <PID>
```

### Memory Issues

Monitor with:
```bash
ps aux | grep node
```

### Database Connection Errors

Check environment variables and network connectivity.

## Support

See HEALTHCHECK.md for detailed health monitoring.
