import { Kernel } from './core/kernel';
import { Router } from './core/router';
import logger from './utils/logger';

async function main(): Promise<void> {
  try {
    logger.info('⚡ StarTorque AI OS - Initialization starting...');

    const kernel = new Kernel();
    const router = new Router(kernel);

    logger.info('✓ Kernel initialized');
    logger.info('✓ Router initialized');
    logger.info('✓ StarTorque AI OS ready');

    // Example task execution
    const taskResult = await router.route({
      goal: 'Analyze user sentiment from text',
      data: { text: 'I love this product!' },
      priority: 'high'
    });

    logger.info('✓ Task executed successfully');
    logger.info('Result:', taskResult);
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

main();