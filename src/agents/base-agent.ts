import logger from '../utils/logger';
import { Task } from '../core/router';

export interface AgentConfig {
  name: string;
  description: string;
  version: string;
}

export interface ExecutionStep {
  stepId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: unknown;
  output?: unknown;
  error?: string;
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected steps: ExecutionStep[] = [];

  constructor(config: AgentConfig) {
    this.config = config;
    logger.info(`Agent initialized: ${config.name} v${config.version}`);
  }

  getName(): string {
    return this.config.name;
  }

  getDescription(): string {
    return this.config.description;
  }

  getVersion(): string {
    return this.config.version;
  }

  abstract execute(task: Task): Promise<unknown>;

  protected async executeStep(
    stepId: string,
    stepName: string,
    fn: () => Promise<unknown>
  ): Promise<unknown> {
    const step: ExecutionStep = {
      stepId,
      name: stepName,
      status: 'pending',
      input: null
    };

    this.steps.push(step);
    logger.info(`[${this.config.name}] Executing step: ${stepName}`);

    try {
      step.status = 'running';
      step.output = await fn();
      step.status = 'completed';
      logger.info(`[${this.config.name}] Step completed: ${stepName}`);
      return step.output;
    } catch (error) {
      step.status = 'failed';
      step.error = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`[${this.config.name}] Step failed: ${stepName}`, error);
      throw error;
    }
  }

  getSteps(): ExecutionStep[] {
    return this.steps;
  }
}
