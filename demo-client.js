import { Client } from '@soundworks/core/client.js';
import { config } from './config.js';

const client = new Client({ role: 'dotpi-led-client', ...config });
await client.start();

const rgb = await client.stateManager.create('rgb');

const r = 0;
const g = 0;
let b = 0;

setInterval(() => {
  rgb.set({ r, g, b });
  b = (b + 1) % 255;
}, 10);
