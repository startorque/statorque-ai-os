# Health Check & Monitoring - StarTorque AI OS

## Endpoints

### Health Check

```bash
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

**Status Codes:**
- `200 OK` - Service is healthy
- `503 Service Unavailable` - Service is degraded

### System Status

```bash
GET /api/status
```

**Response:**
```json
{
  "system": "StarTorque AI OS",
  "version": "1.0.0",
  "status": "running",
  "agents": [
    "sentiment-agent",
    "extraction-agent",
    "generation-agent",
    "classification-agent"
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Metrics

```bash
GET /api/metrics
```

**Response:**
```json
{
  "tasksProcessed": 1234,
  "successfulExecutions": 1200,
  "failedExecutions": 34,
  "averageExecutionTime": 245,
  "activeAgents": 4,
  "systemUptime": 86400
}
```

### Logs

```bash
GET /api/logs
```

**Response:**
```json
{
  "logs": [
    {
      "level": "info",
      "message": "System started",
      "timestamp": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

## Docker Health Check

### Built-in Health Check

Dockerfile includes health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/health')" || exit 1
```

Check status:
```bash
docker ps
docker inspect <container-id>
```

### Manual Health Check

```bash
curl -f http://localhost:3000/api/health || echo "unhealthy"
```

## Monitoring Setup

### Prometheus Metrics

Create `/src/utils/prometheus.ts`:

```typescript
// Metrics collection setup for Prometheus
// Expose on /metrics endpoint
```

### Logs Aggregation

Enable structured logging:

```bash
NODE_ENV=production LOG_FORMAT=json npm start
```

Integrate with:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **CloudWatch** (AWS)
- **StackDriver** (Google Cloud)
- **Azure Monitor** (Azure)

### Alerting Rules

| Metric | Threshold | Action |
|--------|-----------|--------|
| Error Rate | > 5% | Page on-call |
| Response Time P95 | > 1000ms | Warn |
| Memory Usage | > 80% | Scale up |
| Uptime | < 99.9% | Investigate |

## Performance Monitoring

### Node.js Inspector

```bash
node --inspect dist/index.js
# Navigate to chrome://inspect in Chrome DevTools
```

### Memory Profiling

```javascript
// Add to src/utils/profiler.ts
const heapdump = require('heapdump');
heapdump.writeSnapshot('./heap-${Date.now()}.heapsnapshot');
```

### APM Integration

**New Relic:**
```bash
npm install newrelic
# Add: require('newrelic'); to top of entry point
```

**Datadog:**
```bash
DD_AGENT_HOST=localhost DD_TRACE_ENABLED=true npm start
```

## Load Testing

### Using Apache Bench

```bash
ab -n 1000 -c 10 http://localhost:3000/api/health
```

### Using k6

```javascript
// loadtest.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function() {
  let res = http.get('http://localhost:3000/api/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}
```

Run:
```bash
k6 run loadtest.js
```

## Diagnostic Commands

### Check if Running

```bash
curl http://localhost:3000/api/health
lsof -i :3000
ps aux | grep node
```

### View Logs

```bash
docker logs <container-id>
docker logs -f <container-id>  # Follow
```

### Check Resources

```bash
docker stats
# or
ps aux | grep node | grep -v grep
top -p <pid>
```

## Troubleshooting

### Service Not Responding

1. Check if running: `ps aux | grep node`
2. Check port: `netstat -tuln | grep 3000`
3. Check logs: `docker logs <container-id>`
4. Restart: `docker restart <container-id>`

### High Memory Usage

1. Check for memory leaks in agent implementation
2. Monitor heap dump: `node --inspect dist/index.js`
3. Reduce log level to `warn`
4. Scale horizontally

### High CPU Usage

1. Profile with Inspector
2. Check for infinite loops
3. Reduce task concurrency
4. Monitor agent execution times

### Connection Refused

1. Verify port is exposed
2. Check firewall rules
3. Verify application started: `curl http://localhost:3000/api/health`

## SLA Targets

- **Availability**: 99.9% uptime
- **Response Time P95**: < 1000ms
- **Error Rate**: < 1%
- **Mean Time to Recovery**: < 5 minutes
- **Mean Time Between Failures**: > 7 days
