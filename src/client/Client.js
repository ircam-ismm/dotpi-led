import { Client as SoundworksClient } from '@soundworks/core/client.js';
import * as configuration from '../share/configuration.js';

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
    this.configurationFile = configurationFile;
    this.soundworksClient = null;
    this.configuration = {};
  }

  async init() {
    const configurationFile = await configuration.read(this.configurationFile);
    this.configuration = { ...configurationFile };
    this.configurationSoundworks = {
      ...configuration.soundworksClient,
    };
    Object.assign(this.configurationSoundworks.env, configurationFile.server);

    this.soundworksClient = new SoundworksClient(this.configurationSoundworks);
    return this;
  }

  async start() {
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
    await this.fillState.set({ r, g, b, w });
  }

}
