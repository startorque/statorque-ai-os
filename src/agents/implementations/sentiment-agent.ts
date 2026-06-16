import { BaseAgent } from '../base-agent';
import { Task } from '../../core/router';
import logger from '../../utils/logger';

export class SentimentAgent extends BaseAgent {
  constructor() {
    super({
      name: 'sentiment-agent',
      description: 'Analyzes sentiment and emotions in text',
      version: '1.0.0'
    });
  }

  async execute(task: Task): Promise<unknown> {
    logger.info(`[SentimentAgent] Executing task: ${task.goal}`);

    const text = (task.data.text as string) || '';

    return this.executeStep('sentiment-analysis', 'Analyze text sentiment', async () => {
      const sentiment = this.analyzeSentiment(text);
      logger.info(`[SentimentAgent] Sentiment analysis complete: ${sentiment.label}`);
      return sentiment;
    });
  }

  private analyzeSentiment(text: string): { label: string; score: number } {
    const positiveWords = ['love', 'great', 'excellent', 'amazing', 'fantastic', 'wonderful'];
    const negativeWords = ['hate', 'bad', 'terrible', 'awful', 'horrible', 'poor'];

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach((word) => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    let label = 'neutral';
    let score = 0;

    if (positiveCount > negativeCount) {
      label = 'positive';
      score = Math.min(positiveCount / words.length, 1);
    } else if (negativeCount > positiveCount) {
      label = 'negative';
      score = -Math.min(negativeCount / words.length, 1);
    }

    return { label, score };
  }
}
