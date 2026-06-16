import { BaseAgent } from '../base-agent';
import { Task } from '../../core/router';
import logger from '../../utils/logger';

export class ClassificationAgent extends BaseAgent {
  constructor() {
    super({
      name: 'classification-agent',
      description: 'Classifies and categorizes data',
      version: '1.0.0'
    });
  }

  async execute(task: Task): Promise<unknown> {
    logger.info(`[ClassificationAgent] Executing task: ${task.goal}`);

    return this.executeStep('data-classification', 'Classify data', async () => {
      const classified = this.classifyData(task.data);
      logger.info(`[ClassificationAgent] Classification complete`);
      return classified;
    });
  }

  private classifyData(data: Record<string, unknown>): { category: string; confidence: number } {
    const text = JSON.stringify(data).toLowerCase();

    const categories: Record<string, string[]> = {
      business: ['business', 'company', 'enterprise', 'corporate', 'market'],
      technology: ['tech', 'software', 'code', 'development', 'api'],
      health: ['health', 'medical', 'disease', 'treatment', 'doctor'],
      education: ['school', 'learning', 'student', 'course', 'education']
    };

    const scores: Record<string, number> = {};

    for (const [category, keywords] of Object.entries(categories)) {
      scores[category] = keywords.reduce((count, keyword) => {
        return count + (text.includes(keyword) ? 1 : 0);
      }, 0);
    }

    const maxCategory = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
    const category = maxCategory?.[0] || 'general';
    const confidence = Math.min((maxCategory?.[1] || 0) / 5, 1);

    return { category, confidence };
  }
}
