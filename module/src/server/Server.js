import { Server as SoundworksServer } from '@soundworks/core/server.js';
import * as configuration from '@dotpi/led/configuration.js';

import {
  schema as fillSchema,
  name as fillSchemaName,
  nameAliases as fillSchemaNameAliases,
} from './fillSchema.js';

export class Server {

  static async create(attributes) {
    const server = new this(attributes);
    await server.init();
    await server.start();
    return server;
  }

  constructor({
    configurationFile,
  } = {}) {
    this.configurationFile = configurationFile;
    this.soundworksServer = null;
    this.configuration = {};
  }

  async init() {
    const configurationFile = await configuration.read(this.configurationFile);
    this.configuration = { ...configurationFile };
    this.configurationSoundworks = {
      ...configuration.soundworksServer,
    }
    Object.assign(this.configurationSoundworks.env, configurationFile.server);

    this.soundworksServer = new SoundworksServer(this.configurationSoundworks);

    this.soundworksServer.stateManager.registerSchema(fillSchemaName, fillSchema);
    fillSchemaNameAliases.forEach((name) => {
      this.soundworksServer.stateManager.registerSchema(name, fillSchema);
    });

    return this;
  }

  async start() {
    await this.soundworksServer.start();
    this.fillState = await this.soundworksServer.stateManager.create('fill');

    return this;
  }

  async getCollections(schemaNames) {
    return await Promise.all(schemaNames.map((schemaName) => {
      return this.soundworksServer.stateManager.getCollection(schemaName);
    })
    );
  }

}
