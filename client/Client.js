import { Client as SoundworksClient } from '@soundworks/core/client.js';
import { isRaspberryPi } from '@dotpi/javascript/system.js';
import * as echo from '@dotpi/javascript/echo.js';
import * as configuration from './configuration.js';

export class Client {

  static async create(attributes) {
    const client = new this(attributes);
    await client.init();
    await client.start();
    return client;
  }

  constructor({
    configurationFile,
  } = {}) {
    this.isRaspberryPi = null;
    this.configurationFile = configurationFile;
    this.configuration = null;
    this.soundworksClient = null;
  }

  async init() {
    this.isRaspberryPi = await isRaspberryPi();

    try {
      this.configuration = await configuration.read(this.configurationFile);
      this.configurationSoundworks = {
        ...configuration.soundworksClient,
      };
      Object.assign(this.configurationSoundworks.env, this.configuration.server);

      this.soundworksClient = new SoundworksClient(this.configurationSoundworks);
    } catch (error) {
      if (!this.isRaspberryPi) {
        echo.warning('Not a dotpi system, and no valid configuration file: dummy client');
        console.warn(`(${error.message})`);
      } else {
        throw error;
      }
    }
    return this;
  }

  async start() {
    if (!this.configuration) {
      return this;
    }
    await this.soundworksClient.start();
    this.fillState = await this.soundworksClient.stateManager.create('fill');

    return this;
  }

  async fill({
    r = 0,
    g = 0,
    b = 0,
    w = 0,
  } = {}) {
    if (!this.configuration) {
      return;
    }
    await this.fillState.set({ r, g, b, w });
  }

}
