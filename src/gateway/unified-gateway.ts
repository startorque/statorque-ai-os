/**
 * 🌉 Unified StarTorque Gateway
 * 
 * Single entry point for all system actions:
 * - AI core execution (Kernel + Router + Agents)
 * - Deployment orchestration (Vercel, GitHub, DNS)
 * - Health and monitoring
 * 
 * Request Format:
 * POST /run { action, payload }
 * 
 * Response Format:
 * { success, action, result, timestamp, executionId }
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { Router, Task, TaskResult } from '../core/router';
import { Kernel } from '../core/kernel';
import { ValidationError, isValidationError } from '../utils/error-handler';
import { RequestValidator } from '../utils/request-validator';

// ============================================
// GATEWAY REQUEST/RESPONSE TYPES
// ============================================

export interface GatewayRequest {
  action: string;
  payload: Record<string, unknown>;
}

export interface GatewayResponse {
  success: boolean;
  action: string;
  result?: unknown;
  error?: string;
  executionId: string;
  timestamp: string;
  duration: number;
}

export interface DeploymentResult {
  status: 'queued' | 'in_progress' | 'success' | 'failed';
  platform: string;
  details: Record<string, unknown>;
  executionId: string;
}

// ============================================
// GATEWAY SERVICE
// ============================================

export class UnifiedGateway {
  private kernel: Kernel;
  private router: Router;
  private executionHistory: Map<string, { action: string; startTime: number; status: string }> = new Map();

  constructor() {
    this.kernel = new Kernel();
    this.router = new Router(this.kernel);
  }

  /**
   * Main gateway handler
   */
  async handle(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const executionId = uuidv4();
    const { action, payload } = req.body;

    logger.info(`[Gateway] Incoming request: ${action} (${executionId})`);

    try {
      // Validate request
      if (!action || typeof action !== 'string') {
        throw new ValidationError('action is required and must be a string', 400);
      }

      if (!payload || typeof payload !== 'object') {
        throw new ValidationError('payload is required and must be an object', 400);
      }

      // Track execution
      this.executionHistory.set(executionId, {
        action,
        startTime,
        status: 'pending',
      });

      let result: unknown;

      // Route to handler
      switch (action) {
        // ==========================================
        // AI CORE EXECUTION
        // ==========================================
        case 'ai.execute':
          result = await this.handleAIExecute(payload, executionId);
          break;

        case 'ai.route':
          result = await this.handleAIRoute(payload, executionId);
          break;

        // ==========================================
        // DEPLOYMENT ORCHESTRATION
        // ==========================================
        case 'vercel.deploy':
          result = await this.handleVercelDeploy(payload, executionId);
          break;

        case 'github.push':
          result = await this.handleGitHubPush(payload, executionId);
          break;

        case 'dns.update':
          result = await this.handleDNSUpdate(payload, executionId);
          break;

        // ==========================================
        // MONITORING & HEALTH
        // ==========================================
        case 'health.check':
          result = await this.handleHealthCheck(executionId);
          break;

        case 'system.status':
          result = await this.handleSystemStatus(executionId);
          break;

        case 'execution.history':
          result = this.getExecutionHistory();
          break;

        default:
          throw new ValidationError(`Unknown action: ${action}`, 400);
      }

      // Update execution status
      const execution = this.executionHistory.get(executionId);
      if (execution) {
        execution.status = 'completed';
      }

      const duration = Date.now() - startTime;

      const response: GatewayResponse = {
        success: true,
        action,
        result,
        executionId,
        timestamp: new Date().toISOString(),
        duration,
      };

      logger.info(`[Gateway] Request completed: ${action} in ${duration}ms`);
      res.json(response);
    } catch (error) {
      const duration = Date.now() - startTime;

      // Update execution status
      const execution = this.executionHistory.get(executionId);
      if (execution) {
        execution.status = 'failed';
      }

      logger.error(`[Gateway] Request failed: ${action} - ${error instanceof Error ? error.message : String(error)}`);

      const statusCode = isValidationError(error) ? error.statusCode : 500;
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';

      const response: GatewayResponse = {
        success: false,
        action,
        error: errorMessage,
        executionId,
        timestamp: new Date().toISOString(),
        duration,
      };

      res.status(statusCode).json(response);
    }
  }

  // ============================================
  // AI CORE HANDLERS
  // ============================================

  /**
   * Execute task through AI kernel
   */
  private async handleAIExecute(payload: Record<string, unknown>, executionId: string): Promise<TaskResult> {
    logger.info(`[Gateway.AI] Executing task via kernel: ${executionId}`);

    const goal = payload.goal as string;
    const data = payload.data as Record<string, unknown> || {};
    const priority = (payload.priority as 'low' | 'medium' | 'high') || 'medium';

    if (!goal) {
      throw new ValidationError('ai.execute requires goal field', 400);
    }

    const task: Task = {
      goal,
      data,
      priority,
    };

    const result = await this.router.route(task);

    return {
      ...result,
      executionId,
    };
  }

  /**
   * Route task intelligently based on goal
   */
  private async handleAIRoute(payload: Record<string, unknown>, executionId: string): Promise<unknown> {
    logger.info(`[Gateway.AI] Routing task: ${executionId}`);

    const goal = payload.goal as string;

    if (!goal) {
      throw new ValidationError('ai.route requires goal field', 400);
    }

    // Use router's internal selectAgent logic
    const selectedAgent = this.selectAgent(goal);

    return {
      goal,
      selectedAgent,
      executionId,
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================
  // DEPLOYMENT HANDLERS
  // ============================================

  /**
   * Queue deployment to Vercel
   */
  private async handleVercelDeploy(payload: Record<string, unknown>, executionId: string): Promise<DeploymentResult> {
    logger.info(`[Gateway.Deploy] Vercel deployment queued: ${executionId}`);

    const project = payload.project as string || 'unknown';
    const branch = payload.branch as string || 'main';
    const env = payload.env as Record<string, string> || {};

    // TODO: Integrate with actual Vercel API
    // For now, simulate queue acceptance
    logger.info(`[Vercel] Queuing deployment: project=${project}, branch=${branch}`);

    return {
      status: 'queued',
      platform: 'vercel',
      details: {
        project,
        branch,
        environment: env,
        vercelProjectId: process.env.VERCEL_PROJECT_ID || 'demo',
        timestamp: new Date().toISOString(),
      },
      executionId,
    };
  }

  /**
   * Push changes to GitHub
   */
  private async handleGitHubPush(payload: Record<string, unknown>, executionId: string): Promise<DeploymentResult> {
    logger.info(`[Gateway.Deploy] GitHub push initiated: ${executionId}`);

    const repo = payload.repo as string || 'unknown';
    const message = payload.message as string || 'StarTorque automated push';
    const files = payload.files as Record<string, string> || {};

    // TODO: Integrate with actual GitHub API
    logger.info(`[GitHub] Pushing to repo: ${repo} with ${Object.keys(files).length} files`);

    return {
      status: 'queued',
      platform: 'github',
      details: {
        repo,
        message,
        filesCount: Object.keys(files).length,
        timestamp: new Date().toISOString(),
      },
      executionId,
    };
  }

  /**
   * Update DNS records (Cloudflare)
   */
  private async handleDNSUpdate(payload: Record<string, unknown>, executionId: string): Promise<DeploymentResult> {
    logger.info(`[Gateway.Deploy] DNS update initiated: ${executionId}`);

    const domain = payload.domain as string || 'unknown';
    const records = payload.records as Array<{ type: string; name: string; value: string }> || [];

    // TODO: Integrate with actual Cloudflare API
    logger.info(`[Cloudflare] Updating DNS for domain: ${domain} (${records.length} records)`);

    return {
      status: 'queued',
      platform: 'cloudflare',
      details: {
        domain,
        recordsCount: records.length,
        timestamp: new Date().toISOString(),
      },
      executionId,
    };
  }

  // ============================================
  // MONITORING HANDLERS
  // ============================================

  /**
   * Health check endpoint
   */
  private async handleHealthCheck(executionId: string): Promise<unknown> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      executionId,
    };
  }

  /**
   * System status overview
   */
  private async handleSystemStatus(executionId: string): Promise<unknown> {
    const contexts = this.kernel.getAllContexts();

    return {
      system: 'StarTorque AI OS',
      version: '1.0.0',
      status: 'running',
      agents: [
        'sentiment-agent',
        'extraction-agent',
        'generation-agent',
        'classification-agent',
      ],
      activeExecutions: contexts.length,
      recentExecutions: contexts.slice(-5).map((ctx) => ({
        taskId: ctx.taskId,
        agent: ctx.agentName,
        status: ctx.status,
      })),
      timestamp: new Date().toISOString(),
      executionId,
    };
  }

  // ============================================
  // UTILITIES
  // ============================================

  /**
   * Select agent based on goal (mirrors Router logic)
   */
  private selectAgent(goal: string): string {
    const lowerGoal = goal.toLowerCase();

    if (lowerGoal.includes('sentiment') || lowerGoal.includes('emotion')) {
      return 'sentiment-agent';
    }
    if (lowerGoal.includes('extract') || lowerGoal.includes('parse')) {
      return 'extraction-agent';
    }
    if (lowerGoal.includes('generate') || lowerGoal.includes('create')) {
      return 'generation-agent';
    }
    if (lowerGoal.includes('classify') || lowerGoal.includes('categorize')) {
      return 'classification-agent';
    }

    return 'general-agent';
  }

  /**
   * Get execution history
   */
  private getExecutionHistory(): unknown {
    const history = Array.from(this.executionHistory.entries()).slice(-20).map(([id, data]) => ({
      executionId: id,
      ...data,
    }));

    return {
      count: history.length,
      executions: history,
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================
// EXPORTS
// ============================================

export default UnifiedGateway;
