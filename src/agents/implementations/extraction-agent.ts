import { BaseAgent } from '../base-agent';
import { Task } from '../../core/router';
import logger from '../../utils/logger';

export class ExtractionAgent extends BaseAgent {
  constructor() {
    super({
      name: 'extraction-agent',
      description: 'Extracts and parses data from content',
      version: '1.0.0'
    });
  }

  async execute(task: Task): Promise<unknown> {
    logger.info(`[ExtractionAgent] Executing task: ${task.goal}`);

    return this.executeStep('data-extraction', 'Extract structured data', async () => {
      const extracted = this.extractData(task.data);
      logger.info(`[ExtractionAgent] Extraction complete`);
      return extracted;
    });
  }

  private extractData(data: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        result[key] = {
          original: value,
          length: value.length,
          wordCount: value.split(/\s+/).length,
          hasNumbers: /\d/.test(value),
          hasSpecialChars: /[!@#$%^&*]/.test(value)
        };
      } else {
        result[key] = value;
      }
    }

    return result;
  }
}
