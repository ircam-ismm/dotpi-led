#!/usr/bin/env node
import { program } from 'commander';

import { createConfig } from './createConfig.js';

program
  .command('create-config')
  .description('Create configuration file for the dotpi led server.')
  .option('-r, --dotpi-root <path>', 'dotpi root path, to initialise environment')
  .option('-p, --project <path>', 'project path, to adapt configuration')
  .option('-s, --strip-size <number>', 'number of leds in the strip')
  .option('-t, --strip-type <type>', 'type of the strip')
  .action((options, command) => createConfig({...options, command}) );
;

program.parse();

