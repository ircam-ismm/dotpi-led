#!/usr/bin/env node
import { program } from 'commander';
import { Server } from './Server.js';

import * as led from './led.js';
import * as echo from '@dotpi/javascript/echo.js';

import {
  schema as fillSchema,
  name as fillSchemaName,
  nameAliases as fillSchemaNameAliases,
} from './fillSchema.js';

try {
  program.option('-c, --configuration <file>', 'configuration file');
  program.parse();
  const options = program.opts();

  const server = await Server.create({
    configurationFile: options.configuration,
  });

  echo.info(`Server started with configuration:`,
    server.configuration,
  );

  await led.init(server.configuration.led);

  led.rgbw_fill_and_render(0, 0, 0, 0);

  const fillClientCollections = await server.getCollections([
    fillSchemaName,
    ...fillSchemaNameAliases,
  ]);

  const clients = new Set();

  function fillIntegrate() {
    const integration = {
      r: 0,
      g: 0,
      b: 0,
      w: 0,
    };

    clients.forEach((client) => {
      const { r, g, b, w } = client.getValues();
      integration.r += r;
      integration.g += g;
      integration.b += b;
      integration.w += w;
    });

    integration.r = Math.max(0, Math.min(255, Math.round(integration.r)));
    integration.g = Math.max(0, Math.min(255, Math.round(integration.g)));
    integration.b = Math.max(0, Math.min(255, Math.round(integration.b)));
    integration.w = Math.max(0, Math.min(255, Math.round(integration.w)));

    const { r, g, b, w } = integration;
    led.rgbw_fill_and_render(r, g, b, w);
  }

  fillClientCollections.forEach((fillClientCollection) => {

    fillClientCollection.onAttach((client, updates) => {
      clients.add(client);
      fillIntegrate();
    });


    fillClientCollection.onUpdate((client, updates) => {
      fillIntegrate();
    });

    fillClientCollection.onDetach((client, updates) => {
      clients.delete(client);
      fillIntegrate();
    });

  }); // fillClientCollections.forEach

} catch (error) {
  console.error('Error:', error);
  led.finalise();
  process.exit(255);
}

['SIGINT', 'SIGTERM', 'SIGHUP'].forEach((signal) => {
  process.on(signal, () => {
    console.log('\n');
    console.log('signal', signal);
    led.finalise();
    process.exit();
  });
});
