// swagger.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  enable: true,
  title: 'Elite Drive API',
  description: 'API documentation',
  version: '1.0.0',
  path: 'docs',
}));
