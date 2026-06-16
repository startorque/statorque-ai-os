import { v4 as uuidv4 } from 'uuid';
import { Kernel } from './kernel';
import { AgentRegistry } from '../agents/registry';
import logger from '../utils/logger';

export interface Task {
  goal: string;
  data: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high';
}

export interface TaskResult {
  taskId: string;
  status: 'success' | 'error' | 'pending';
  result?: unknown;
  error?: string;
}

export class Router {
  private kernel: Kernel;
  private registry: AgentRegistry;

  constructor(kernel: Kernel) {
    this.kernel = kernel;
    this.registry = new AgentRegistry();
    logger.info('Router initialized with kernel and agent registry');
  }

  async route(task: Task): Promise<TaskResult> {
    const taskId = uuidv4();
    logger.info(`[Router] Processing task: ${taskId}`);
    logger.info(`[Router] Goal: ${task.goal}`);
    logger.info(`[Router] Priority: ${task.priority}`);

    try {
      // Select agent based on goal
      const agent = this.selectAgent(task.goal);
      logger.info(`[Router] Selected agent: ${agent}`);

      // Execute task through kernel
      const result = await this.kernel.execute(taskId, agent, task);

      logger.info(`[Router] Task ${taskId} completed successfully`);
      return {
        taskId,
        status: 'success',
        result
      };
    } catch (error) {
      logger.error(`[Router] Task ${taskId} failed:`, error);
      return {
        taskId,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

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
}
