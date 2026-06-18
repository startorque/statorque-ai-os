import logger from './logger';

interface ValidationSchema {
  [key: string]: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean';
    default?: string | number | boolean;
    validator?: (value: string) => boolean;
  };
}

const ENV_SCHEMA: ValidationSchema = {
  NODE_ENV: {
    required: true,
    type: 'string',
    default: 'production',
    validator: (val) => ['development', 'production', 'test'].includes(val)
  },
  PORT: {
    required: false,
    type: 'number',
    default: 3000,
    validator: (val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0 && parseInt(val, 10) <= 65535
  },
  HOST: {
    required: false,
    type: 'string',
    default: '0.0.0.0'
  },
  LOG_LEVEL: {
    required: false,
    type: 'string',
    default: 'info',
    validator: (val) => ['debug', 'info', 'warn', 'error'].includes(val)
  },
  REQUEST_TIMEOUT: {
    required: false,
    type: 'number',
    default: 30000,
    validator: (val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0
  }
};

export class EnvironmentValidator {
  static validate(): Record<string, string | number | boolean> {
    const validated: Record<string, string | number | boolean> = {};
    const errors: string[] = [];

    for (const [key, schema] of Object.entries(ENV_SCHEMA)) {
      const value = process.env[key];

      // Check required
      if (schema.required && !value) {
        errors.push(`Missing required environment variable: ${key}`);
        continue;
      }

      // Use default or value
      const finalValue = value ?? schema.default;

      // Type validation
      if (schema.type && finalValue !== undefined) {
        switch (schema.type) {
          case 'number':
            if (isNaN(Number(finalValue))) {
              errors.push(`Invalid number for ${key}: ${finalValue}`);
              continue;
            }
            validated[key] = Number(finalValue);
            break;
          case 'boolean':
            if (!['true', 'false'].includes(String(finalValue).toLowerCase())) {
              errors.push(`Invalid boolean for ${key}: ${finalValue}`);
              continue;
            }
            validated[key] = String(finalValue).toLowerCase() === 'true';
            break;
          case 'string':
          default:
            validated[key] = String(finalValue);
        }
      }

      // Custom validator
      if (schema.validator && !schema.validator(String(finalValue))) {
        errors.push(`Invalid value for ${key}: ${finalValue}`);
        continue;
      }

      if (finalValue !== undefined) {
        validated[key] = finalValue;
      }
    }

    if (errors.length > 0) {
      logger.error('Environment validation failed:');
      errors.forEach((error) => logger.error(`  - ${error}`));
      process.exit(1);
    }

    logger.info('✓ Environment variables validated successfully');
    return validated;
  }
}

export const validateEnvironment = (): void => {
  EnvironmentValidator.validate();
};
