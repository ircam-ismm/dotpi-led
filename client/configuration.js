import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { moduleConfigurationPathGet } from '@dotpi/module/configuration.js';

export const filename = 'config.mjs';

export const defaultValues = {
  server: {
    port: 9999,
    verbose: false,
  },
  led: {
    refreshRate: 60, // in hertz
    stripSize: 10, // number of pixels
    stripType: 'ws2812', // see rpi-ws281x-native
    brightness: 255,
    invert: false,
    gpio: 12,
    dma: 10,
    freq: 800000, // in hertz
  },
}

// __filename and __dirname are undefined in module type
const localFileName = fileURLToPath(import.meta.url);
const localPath = path.dirname(localFileName);

export const moduleDefinition = JSON.parse(await fs.readFile(
  path.resolve(localPath, 'package.json')));
// over-ride with generic module name
moduleDefinition.name = '@dotpi/led';

export async function read(file) {
  let configurationFile;
  if (file) {
    configurationFile = path.resolve(file);
  } else {
    const configurationPath = await moduleConfigurationPathGet({
      module: moduleDefinition,
    });
    configurationFile = path.resolve(configurationPath, filename);
  }

  const configurationFromFile = await import(configurationFile);

  const configuration = {
    ...defaultValues,
   };

   Object.keys(configurationFromFile).forEach((key) => {
    if (typeof configuration[key] === 'undefined') {
      return;
    }
    Object.assign(configuration[key], {
      ...configurationFromFile[key],
    });
   });

  configuration.file = configurationFile;

  return configuration;
}

export const soundworks = {
  app: {
    name: 'dotpi-led',
  },
  env: {
    serverAddress: '127.0.0.1',
    // port from configuration file
    useHttps: false,
  },
};

export const soundworksServer = {
  ...soundworks,
};
Object.assign(soundworksServer.app, {
  clients: {
    'dotpi-led-client': { target: 'node' },
  },
});

export const soundworksClient = {
  ...soundworks,
  role: 'dotpi-led-client',
};
