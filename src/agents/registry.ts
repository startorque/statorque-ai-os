import { BaseAgent } from './base-agent';
import { SentimentAgent } from './implementations/sentiment-agent';
import { ExtractionAgent } from './implementations/extraction-agent';
import { GenerationAgent } from './implementations/generation-agent';
import { ClassificationAgent } from './implementations/classification-agent';
import logger from '../utils/logger';

export class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();

  constructor() {
    this.registerDefaultAgents();
  }

  private registerDefaultAgents(): void {
    const sentimentAgent = new SentimentAgent();
    const extractionAgent = new ExtractionAgent();
    const generationAgent = new GenerationAgent();
    const classificationAgent = new ClassificationAgent();

    this.register('sentiment-agent', sentimentAgent);
    this.register('extraction-agent', extractionAgent);
    this.register('generation-agent', generationAgent);
    this.register('classification-agent', classificationAgent);
    this.register('general-agent', sentimentAgent); // Default fallback

    logger.info('Default agents registered');
  }

  register(name: string, agent: BaseAgent): void {
    this.agents.set(name, agent);
    logger.info(`Agent registered: ${name}`);
  }

  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  getAgentNames(): string[] {
    return Array.from(this.agents.keys());
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }
}
