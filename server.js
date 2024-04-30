import { Server } from '@soundworks/core/server.js';
import { config } from './config.js';

const server = new Server(config);

import * as led from './led.js';

const rgbSchema = {
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
};

server.stateManager.registerSchema('rgb', rgbSchema);

await server.start();
await led.init();

led.rgb_fill_and_render(0, 0, 0);
await new Promise( (resolve) => setTimeout(resolve, 1000) );

const dotpiLedClientCollection = await server.stateManager.getCollection('rgb');

function rgbIntegrate() {

  const integration = {
    r: 0,
    g: 0,
    b: 0,
  };
  
  dotpiLedClientCollection.forEach( (client) => {
    const {r, g, b } = client.getValues();
    integration.r += r;
    integration.g += g;
    integration.b += b;
  });

  integration.r = Math.max(0, Math.min(255, Math.round(integration.r) ) );
  integration.g = Math.max(0, Math.min(255, Math.round(integration.g) ) ) ;
  integration.b = Math.max(0, Math.min(255, Math.round(integration.b) ) ) ;

  const {r, g, b } = integration;
  led.rgb_fill_and_render(r, g, b);
}

dotpiLedClientCollection.onAttach((client, updates) => {
  rgbIntegrate();
});


dotpiLedClientCollection.onUpdate((client, updates) => {
  rgbIntegrate();
});


dotpiLedClientCollection.onDetach((client, updates) => {
  rgbIntegrate();
});
