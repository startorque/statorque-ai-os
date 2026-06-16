import { BaseAgent } from '../base-agent';
import { Task } from '../../core/router';
import logger from '../../utils/logger';

export class GenerationAgent extends BaseAgent {
  constructor() {
    super({
      name: 'generation-agent',
      description: 'Generates content based on input parameters',
      version: '1.0.0'
    });
  }

  async execute(task: Task): Promise<unknown> {
    logger.info(`[GenerationAgent] Executing task: ${task.goal}`);

    return this.executeStep('content-generation', 'Generate content', async () => {
      const generated = this.generateContent(task.data);
      logger.info(`[GenerationAgent] Generation complete`);
      return generated;
    });
  }

  private generateContent(data: Record<string, unknown>): { generated: string } {
    const prompt = (data.prompt as string) || 'Default content';
    const length = (data.length as number) || 100;

    const templates = [
      'Generating content based on: ',
      'Creating output for: ',
      'Processing request: '
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    const generated = `${template}"${prompt}" (generated ${length} chars)`;

    return { generated };
  }
}
