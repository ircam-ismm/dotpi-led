import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { dotpiRootGet } from '@dotpi/javascript/system.js';
import {
  dotpiInitSourceFileGet,
  sourceAndExecute,
} from '@dotpi/javascript/bash.js';
import { moduleConfigurationPathGet } from '@dotpi/module/configuration.js';
import * as echo from '@dotpi/javascript/echo.js';

import { renderFile } from '@dotpi/javascript/template.js';

import * as configuration from '../share/configuration.js';

const gpioDefault = {
  analogAudioDevice: 21,
  digitalAudioDevice: 12,
};

export async function createConfig({
  dotpiRoot,
  project,
  command,
}) {

  if (!dotpiRoot) {
    try {
      dotpiRoot = await dotpiRootGet();
    } catch (error) {
      echo.error('dotpi-root not specified, and default not found');
      command.outputHelp({ error: true });
      process.exit(1);
    }
  }

  const sourceFiles = [];
  if (dotpiRoot) {
    const dotpiRootInitFile = await dotpiInitSourceFileGet({
      dotpiRoot,
    });
    sourceFiles.push(dotpiRootInitFile);
  }

  let audioDeviceIsAnalog = true; // default

  // Be sure to source the project after dotpi initialisation,
  // to over-ride the default $DOTPI_ROOT values
  if (project) {
    sourceFiles.push(path.join(project, 'dotpi_project.bash'));
  }
  try {
    // Be sure to NOT use the 'dotpi' separate binary here,
    // (like `dotpi audio_device_is_analog`)
    // as we need to over-ride the $DOTPI_ROOT default values
    // with the project definitions.
    const output = await sourceAndExecute({
      sourceFiles,
      command: `dotpi_audio_device_is_analog`,
    });
    audioDeviceIsAnalog = output.exitCode === 0;
  } catch (error) {
    if (error.cause) {
      echo.error('Error reading audio device');
      console.error(error.cause);
      process.exit(1);
    } else if (error.stderr) {
      echo.error('Error reading audio device');
      console.error(error.stderr);
      process.exit(1);
    }
    // else command returned false
    audioDeviceIsAnalog = error.exitCode === 0;
  }

  echo.info(`Create configuration for ${audioDeviceIsAnalog ? 'analog' : 'digital'} audio device`);

  try {
    // __filename and __dirname are undefined in module type
    const localFileName = fileURLToPath(import.meta.url);
    const localPath = path.dirname(localFileName);

    const moduleDefinition = JSON.parse(await fs.readFile(
        path.join(localPath, '..', '..', 'package.json')));

    const gpio = (audioDeviceIsAnalog
      ? gpioDefault.analogAudioDevice
      : gpioDefault.digitalAudioDevice
    );

    // defaults in template
    const configOptions = {
      module: moduleDefinition,
      server: {},
      led: {
        gpio: (audioDeviceIsAnalog ? 21 : 12),
      },
    }

    //overrides

    const templateFile = path.join(localPath, 'configTemplate.js');
    const configText = await renderFile(templateFile, configOptions);


    // write configuration file

    let configDestination;
    if (project) {
      configDestination = path.join(project, 'dotpi_filesystem');
    } else {
      configDestination = dotpiRoot;
    }

    const configPath = await moduleConfigurationPathGet({
      module: moduleDefinition,
      dotpiRoot: configDestination,
    });

    const configFile = path.join(configPath, configuration.filename);

    echo.info(`Write configuration to ${configFile}`);
    await fs.mkdir(configPath, { recursive: true });
    await fs.writeFile(configFile, configText);

    // validate

    const config = (await import(configFile));
    console.log('Configuration:', { ...config });

  } catch (error) {
    echo.error('Error processing configuration template');
    if (error.cause) {
      console.error(error.cause);
    }
    throw error;
  }

}