import express, { Express, Request, Response } from 'express';
import path from 'path';
import logger from '../utils/logger';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    system: 'StarTorque AI OS',
    version: '1.0.0',
    status: 'running',
    agents: [
      'sentiment-agent',
      'extraction-agent',
      'generation-agent',
      'classification-agent'
    ],
    timestamp: new Date().toISOString()
  });
});

app.get('/api/logs', (req: Request, res: Response) => {
  res.json({
    logs: [
      { level: 'info', message: 'System started', timestamp: new Date().toISOString() },
      { level: 'info', message: 'All agents initialized', timestamp: new Date().toISOString() },
      { level: 'info', message: 'Dashboard server running', timestamp: new Date().toISOString() }
    ]
  });
});

app.get('/api/metrics', (req: Request, res: Response) => {
  res.json({
    tasksProcessed: 42,
    successfulExecutions: 39,
    failedExecutions: 3,
    averageExecutionTime: 245,
    activeAgents: 4,
    systemUptime: process.uptime()
  });
});

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 StarTorque Dashboard running on http://localhost:${PORT}`);
});

export default app;
