import OmeggaPlugin, { OL, PS, PC, Vector, Brick, WriteSaveObject } from 'omegga';
import { PlayerStats } from 'playerstats';
import Ore from './ore'
import OreType from './oretype'

type Config = { foo: string };
type Storage = { bar: string };

let spots: string[] = [];
let ores: Ore[] = [];
let playerstats : PlayerStats[] = [];
let oretypes: OreType[] = [];
let stonetypes: OreType[]=[];

export default class Plugin implements OmeggaPlugin<Config, Storage> {
  omegga: OL;
  config: PC<Config>;
  store: PS<Storage>;

  constructor(omegga: OL, config: PC<Config>, store: PS<Storage>) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;
  }


  async init() {


    oretypes.push(new OreType(10,"Tin",5,-4000,400,0));
    oretypes.push(new OreType(20,"Copper",5,-4000,400,15));
    oretypes.push(new OreType(30,"Cobalt",10,-4000,400,20));
    oretypes.push(new OreType(60,"Iron",15,-4000,400,7));
    oretypes.push(new OreType(70,"Tungsten",25,-4000,400,10));
    oretypes.push(new OreType(100,"Gold",45,-4000,400,16));
    oretypes.push(new OreType(200,"Diamond",50,-4000,400,20));
    oretypes.push(new OreType(400,"Emerald",100,-4000,400,18));
    oretypes.push(new OreType(1100,"Dura-Steel",100,-16000,-400,19));
    oretypes.push(new OreType(1200,"Netherite",125,-16000,-400,8));
    oretypes.push(new OreType(2200,"Plasteel",225,-16000,-400,20));
    oretypes.push(new OreType(4100,"Platinum",425,-16000,-400,20));
    oretypes.push(new OreType(5100,"Beskar",525,-16000,-400,11));




    oretypes.push(new OreType(99995,"Space",0,2800,5200,11));
    oretypes.push(new OreType(59999,"Thin Air",0,2400,2800,72));
    oretypes.push(new OreType(9995,"Air",0,2000,2400,79));
    oretypes.push(new OreType(995,"Water",0,1600,2000,82));
    oretypes.push(new OreType(15,"Gravel",0,800,1600,7));
    oretypes.push(new OreType(5,"Dirt",0,400,800,12));
    //Start here
    oretypes.push(new OreType(5,"Stone",0,-400,400,4));
    oretypes.push(new OreType(15,"Hard Stone",0,-800,-400,5));
    oretypes.push(new OreType(115,"Harder Stone",0,-1200,-800,5));
    oretypes.push(new OreType(1115,"Hardest Stone",0,-1600,-1200,6));
    oretypes.push(new OreType(11115,"Deepslate",0,-2000,-1600,7));
    oretypes.push(new OreType(22225,"Bedrock",0,-2400,-2000,8));
    oretypes.push(new OreType(33335,"Granite",0,-3000,-2400,12));
    oretypes.push(new OreType(55555,"Condensed Stone",0,-4000,-3000,7));
    oretypes.push(new OreType(66666,"Hardened Stone Squared",0,-5000,-400,8));
    oretypes.push(new OreType(100000,"Deep Stone",0,-7000,-5000,9));

    this.omegga.on('cmd:upgrade', async (speaker: string) => {
      const playerstat = await this.getPlayer(speaker);
      if(playerstat.bank<100){
        this.omegga.whisper(speaker, "You need atleast $100 to upgrade your pick.");
        return;
      }else{
        playerstat.level++;
        playerstat.bank-=100;
        this.omegga.whisper(speaker, "You are now at level "+playerstat.level+".");
      }
    });
    this.omegga.on('cmd:upgradeall', async (speaker: string) => {
      const playerstat = await this.getPlayer(speaker);
      if(playerstat.bank<100){
        this.omegga.whisper(speaker, "You need atleast $100 to upgrade your pick.");
        return;
      }else{
        while(playerstat.bank>=100){
        playerstat.level++;
        playerstat.bank-=100;
        }
        this.omegga.whisper(speaker, "You are now at level "+playerstat.level+".");
      }
    });
    
    this.omegga.on('interact',
      async ({ player, position, brick_name, message }) => {
        const block = await getDoorBrickFromInteract(position);
        const playerstat = await this.getPlayer(player.name);

        let ore = await this.getOre(position);
        if(ore == null){
          this.genOre(position,ore,block);
        }else{
          ore.setDurability(ore.durability-playerstat.level);
        }
        
    // get door data from the brick position
      const doorData = (await Omegga.getSaveData({center: position,extent: block.brick.size})) as WriteSaveObject;
        let x1: string = "x"+(position[0]+40)+"y"+position[1]+"z"+position[2];
        let pos = position;
        pos[0] = pos[0]+40;
        if(spots.indexOf(x1)==-1){
          let oreStuff = this.genOre(pos,ore,block,40,0,0);
          spots.push(x1);
        }
        let x2: string = "x"+(position[0]-40)+"y"+position[1]+"z"+position[2];
        if(spots.indexOf(x2)==-1){
          let oreStuff = this.genOre(pos,ore,block,-40,0,0);
          spots.push(x2);
        }
        let y1: string = "x"+(position[0])+"y"+(position[1]+40)+"z"+position[2];
        if(spots.indexOf(y1)==-1){
          let oreStuff = this.genOre(pos,ore,block,0,40,0);
          spots.push(y1);
        }
        let y2: string = "x"+(position[0])+"y"+(position[1]-40)+"z"+position[2];
        if(spots.indexOf(y2)==-1){
          let oreStuff = this.genOre(pos,ore,block,0,-40,0);
          spots.push(y2);
        }
        let z1: string = "x"+(position[0])+"y"+(position[1])+"z"+(position[2]+40);
        if(spots.indexOf(z1)==-1){
          let oreStuff = this.genOre(pos,ore,block,0,0,40);
          spots.push(z1);
        }
        let z2: string = "x"+(position[0])+"y"+(position[1])+"z"+(position[2]-40);
        if(spots.indexOf(z2)==-1){
          let oreStuff = this.genOre(pos,ore,block,0,0,-40);
          spots.push(z2);
        }

        if(ore.durability <= 0){
          this.clearBricks(position,block.brick.size,block.ownerId);
        }

    });


    return { registeredCommands: ['upgrade'] };
  }

  async stop() {

  }

  async genOre(position: Vector, ore: Ore, block: any, xx: number, yy: number, zz: number){
    const doorData = (await Omegga.getSaveData({center: position,extent: block.brick.size})) as WriteSaveObject;
    if(getRandomInt(100)===0){
      let oret = oretypes[getRandomInt(oretypes.length)];
      while(oret.minY > position[1] || oret.maxY<position[1]){
        oret = oretypes[getRandomInt(oretypes.length)];
      }
        ore = new Ore(position,oret);
        ores.push(ore);
    }else{
      let i = 0;
      let stone = stonetypes[i];
      while(stone.minY > position[1] || stone.maxY<position[1]){
        i++;
        stone = stonetypes[i];
      }
      ore = new Ore(position,stone);
      ores.push(ore);
    }
    doorData.bricks[0].color=ore.type.color
    await Omegga.loadSaveData(doorData, { quiet: true,
    offX: xx,
    offY: yy,
    offZ: zz});
    return ore;
  }

  async getOre(position: Vector) {
    for (let index = 0; index < ores.length; index++) {
      let element = ores[index];
      if(element.location[0] == position[0]){
        if(element.location[1] == position[1]){
          if(element.location[2] == position[2]){
        return element;
          }
        }
      }
    }
  }



  async clearBricks(center: Vector, extent: Vector, ownerId: String){
    // clear the old door bricks
    Omegga.writeln(
      `Bricks.ClearRegion ${center.join(' ')} ${extent.join(' ')} ${ownerId}`
    );
  }

  async getPlayer(player: string){
    playerstats.forEach(ps => {
      if(ps.name===player){
        return ps;
      }
    });
    const ps = new PlayerStats(player,1,0);
    playerstats.push(ps);
    return ps;
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/** lookup a brick by position and filter fn
 * @param unique when enabled, require this door to be unique
 */
 export async function getDoorBrickQuery(
  region: { center: Vector; extent: Vector },
  query: (brick: Brick) => boolean,
  unique?: boolean
): Promise<{ brick: Brick; ownerId: string }> {
  // get the save data around the clicked brick
  const saveData = await Omegga.getSaveData(region);

  // no bricks detected
  if (!saveData || saveData.bricks.length === 0) return null;

  // ensure the brick version has components
  if (saveData.version !== 10) return null;

  // find brick based on query
  const index = saveData.bricks.findIndex(query);
  const brick = index > -1 ? saveData.bricks[index] : null;

  // prevent multiple bricks in the same position from being clicked
  if (
    unique &&
    index > -1 &&
    saveData.bricks.some((b, i) => query(b) && i !== index)
  )
    return null;

  if (!brick) return null;

  return { brick, ownerId: saveData.brick_owners[brick.owner_index - 1].id };
}

/** get a brick's data from interact metadata (for relative positioning) */
export async function getDoorBrickFromInteract(
  position: Vector,
): Promise<{ brick: Brick; ownerId: string }> {
  // find the brick that has a matching position to this one
  return getDoorBrickQuery(
    {
      center: position as Vector,
      extent: [30, 30, 30] as Vector,
    },
    b => b.position.every((p, i) => position[i] === p),
    true
  );
}