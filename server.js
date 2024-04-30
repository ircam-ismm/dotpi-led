import { Server } from '@soundworks/core/server.js';
import { config } from './config.js';

import { program } from 'commander';

import fs from 'node:fs';
import path from 'node:path';

import * as led from './led.js';

const fillSchema = {
  r: {
    type: 'float',
    default: 0,
    min: 0,
    max: 255,
  },
  g: {
    type: 'float',
    default: 0,
    min: 0,
    max: 255,
  },
  b: {
    type: 'float',
    default: 0,
    min: 0,
    max: 255,
  },
  w: {
    type: 'float',
    default: 0,
    min: 0,
    max: 255,
  },
};

const server = new Server(config);

server.stateManager.registerSchema('fill', fillSchema);

// deprecated
server.stateManager.registerSchema('rgb', fillSchema);

program.option('-C, --configuration <file>', 'LED-strip configuration file');

program.parse();
const options = program.opts();


let ledStripConfigurationFile = options.configuration;
if(!ledStripConfigurationFile) {
  // no __dirname in ESM
  const dirname = path.dirname(new URL(import.meta.url).pathname);
  ledStripConfigurationFile = path.join(dirname, 'ledstrip-config-default.json');
  console.log(`No configuration file specified, using default: ${ledStripConfigurationFile}`);
}


const ledStripConfigurationPath = path.resolve(ledStripConfigurationFile);
const ledStripConfiguration = JSON.parse(fs.readFileSync(ledStripConfigurationPath) );
console.log('LED strip configuration:', ledStripConfiguration);

await server.start();
await led.init(ledStripConfiguration);

led.rgbw_fill_and_render(0, 0, 0, 0);
await new Promise( (resolve) => setTimeout(resolve, 1000) );

const fillClientCollection = await server.stateManager.getCollection('fill');

// deprecated
const rgbClientCollection = await server.stateManager.getCollection('rgb');

function fillIntegrate() {

  const integration = {
    r: 0,
    g: 0,
    b: 0,
    w: 0,
  };

  const clients = [];
  fillClientCollection.forEach( (client) => clients.push(client) );
  // deprecated
  rgbClientCollection.forEach( (client) => clients.push(client) );
  clients.forEach( (client) => {
    const {r, g, b, w } = client.getValues();
    integration.r += r;
    integration.g += g;
    integration.b += b;
    integration.w += w;
  });

  integration.r = Math.max(0, Math.min(255, Math.round(integration.r) ) );
  integration.g = Math.max(0, Math.min(255, Math.round(integration.g) ) ) ;
  integration.b = Math.max(0, Math.min(255, Math.round(integration.b) ) ) ;
  integration.w = Math.max(0, Math.min(255, Math.round(integration.w) ) );

  const {r, g, b, w } = integration;
  led.rgbw_fill_and_render(r, g, b, w);
}

fillClientCollection.onAttach((client, updates) => {
  fillIntegrate();
});


fillClientCollection.onUpdate((client, updates) => {
  fillIntegrate();
});


fillClientCollection.onDetach((client, updates) => {
  fillIntegrate();
});


// deprecated

rgbClientCollection.onAttach((client, updates) => {
  fillIntegrate();
});


rgbClientCollection.onUpdate((client, updates) => {
  fillIntegrate();
});


rgbClientCollection.onDetach((client, updates) => {
  fillIntegrate();
});
