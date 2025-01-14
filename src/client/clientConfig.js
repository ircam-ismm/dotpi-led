import config from '../share/configuration.js';

const client = new Client({
  ...config.soundworks,
  role: 'dotpi-led-client',
});
