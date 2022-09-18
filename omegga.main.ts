import OmeggaPlugin, { OL, PS, PC, Brick } from 'omegga';


type Config = {
    'only-authorized': boolean;
    'authorized-users': { id: string; name: string }[];
  };
  type Storage = { bar: string };

export default class BRMiner implements OmeggaPlugin<Config, Storage>{
    omegga: OL;
    config: PC<Config>;
    store: PS<Storage>;
  
    running: boolean;
  
    constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
      this.omegga = omegga;
      this.config = config;
      this.store = store;
    }
    async init() {
      this.omegga.on('cmd:test', (speaker: string) => {
        this.omegga.broadcast(`Hello, ${speaker}!`);
      });
  
      return { registeredCommands: ['test'] };
    }
  
    async stop() {
    }
}