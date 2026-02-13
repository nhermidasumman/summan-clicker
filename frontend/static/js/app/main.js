import { bootstrap } from './bootstrap.js';

try {
  bootstrap();
} catch (error) {
  console.error('[main] Bootstrap failed:', error);
}
