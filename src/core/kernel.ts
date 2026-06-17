import { ExecutionEngine } from '../execution/engine';
import { AgentRegistry } from '../agents/registry';
import logger from '../utils/logger';
import { Task } from './router';

export interface ExecutionContext {
  taskId: string;
  agentName: string;
  task: Task;
  startTime: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export class Kernel {
  private engine: ExecutionEngine;
  private registry: AgentRegistry;
  private contexts: Map<string, ExecutionContext> = new Map();

  constructor() {
    this.engine = new ExecutionEngine();
    this.registry = new AgentRegistry();
    logger.info('Kernel initialized');
  }

  async execute(taskId: string, agentName: string, task: Task): Promise<unknown> {
    const context: ExecutionContext = {
      taskId,
      agentName,
      task,
      startTime: Date.now(),
      status: 'pending'
    };

    this.contexts.set(taskId, context);
    logger.info(`[Kernel] Starting execution context for task ${taskId}`);

    try {
      context.status = 'running';

      // Get agent from registry
      const agent = this.registry.getAgent(agentName);
      if (!agent) {
        throw new Error(`Agent not found: ${agentName}`);
      }

      logger.info(`[Kernel] Executing agent: ${agentName}`);

      // Execute through engine
      const result = await this.engine.execute(agent, task);

      context.status = 'completed';
      logger.info(`[Kernel] Task ${taskId} execution completed`);

      return result;
    } catch (error) {
      context.status = 'failed';
      logger.error(`[Kernel] Task ${taskId} execution failed:`, error);
      throw error;
    } finally {
      const duration = Date.now() - context.startTime;
      logger.info(`[Kernel] Task ${taskId} execution took ${duration}ms`);
    }
  }

  getContext(taskId: string): ExecutionContext | undefined {
    return this.contexts.get(taskId);
  }

  getAllContexts(): ExecutionContext[] {
    return Array.from(this.contexts.values());
  }
}
