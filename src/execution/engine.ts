import { BaseAgent } from '../agents/base-agent';
import { Task } from '../core/router';
import logger from '../utils/logger';

export interface ExecutionPlan {
  agentName: string;
  steps: string[];
  estimatedDuration: number;
}

export class ExecutionEngine {
  private executionHistory: Array<{
    agentName: string;
    taskId: string;
    startTime: number;
    endTime?: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
  }> = [];

  async execute(agent: BaseAgent, task: Task): Promise<unknown> {
    const executionId = `${agent.getName()}-${Date.now()}`;
    const startTime = Date.now();

    logger.info(`[ExecutionEngine] Starting execution: ${executionId}`);

    const execution: {
      agentName: string;
      taskId: string;
      startTime: number;
      endTime?: number;
      status: 'pending' | 'running' | 'completed' | 'failed';
    } = {
      agentName: agent.getName(),
      taskId: executionId,
      startTime,
      status: 'running'
    };

    this.executionHistory.push(execution);

    try {
      // Create execution plan
      const plan = this.createExecutionPlan(agent, task);
      logger.info(`[ExecutionEngine] Execution plan created with ${plan.steps.length} steps`);

      // Execute agent
      const result = await agent.execute(task);

      execution.status = 'completed';
      execution.endTime = Date.now();
      const duration = execution.endTime - startTime;

      logger.info(`[ExecutionEngine] Execution completed in ${duration}ms`);
      return result;
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = Date.now();
      logger.error(`[ExecutionEngine] Execution failed:`, error);
      throw error;
    }
  }

  private createExecutionPlan(agent: BaseAgent, _task: Task): ExecutionPlan {
    return {
      agentName: agent.getName(),
      steps: [
        'validate_input',
        'process_task',
        'generate_output',
        'cleanup'
      ],
      estimatedDuration: 1000
    };
  }

  getExecutionHistory(): Array<{ agentName: string; taskId: string; startTime: number; endTime?: number; status: string }> {
    return this.executionHistory;
  }
}
