import OmeggaPlugin, { OL, PS, PC, Vector, Brick, WriteSaveObject } from 'omegga';
import { PlayerStats } from './playerstats';
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

    this.omegga.clearAllBricks();
    this.omegga.loadBricks("brminer");


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




    stonetypes.push(new OreType(99995,"Space",0,2800,5200,11));
    stonetypes.push(new OreType(59999,"Thin Air",0,2400,2800,72));
    stonetypes.push(new OreType(9995,"Air",0,2000,2400,79));
    stonetypes.push(new OreType(995,"Water",0,1600,2000,82));
    stonetypes.push(new OreType(15,"Gravel",0,800,1600,7));
    stonetypes.push(new OreType(5,"Dirt",0,400,800,12));
    //Start here
    stonetypes.push(new OreType(5,"Stone",0,-400,400,4));
    stonetypes.push(new OreType(15,"Hard Stone",0,-800,-400,5));
    stonetypes.push(new OreType(115,"Harder Stone",0,-1200,-800,5));
    stonetypes.push(new OreType(1115,"Hardest Stone",0,-1600,-1200,6));
    stonetypes.push(new OreType(11115,"Deepslate",0,-2000,-1600,7));
    stonetypes.push(new OreType(22225,"Bedrock",0,-2400,-2000,8));
    stonetypes.push(new OreType(33335,"Granite",0,-3000,-2400,12));
    stonetypes.push(new OreType(55555,"Condensed Stone",0,-4000,-3000,7));
    stonetypes.push(new OreType(66666,"Hardened Stone Squared",0,-5000,-400,8));
    stonetypes.push(new OreType(100000,"Deep Stone",0,-7000,-5000,9));



    this.omegga.on('cmd:bank', async (speaker: string) => {
      const playerstat = await this.getPlayer(this.omegga.getPlayer(speaker).name);
        this.omegga.whisper(speaker, "You have $"+playerstat.bank);
    });
    this.omegga.on('cmd:upgrade', async (speaker: string) => {
      const playerstat = await this.getPlayer(this.omegga.getPlayer(speaker).name);
      if(playerstat.bank<100){
        this.omegga.whisper(speaker, "You need atleast $100 to upgrade your pick. You have $"+playerstat.bank);
        return;
      }else{
        playerstat.level++;
        playerstat.bank-=100;
        this.store.set(playerstat.name+"_bank" as 'bar', playerstat.bank+"");
        this.store.set(playerstat.name+"_level" as 'bar', playerstat.level+"");
        this.omegga.whisper(speaker, "You are now at level "+playerstat.level+".");
      }
    });
    this.omegga.on('cmd:upgradeall', async (speaker: string) => {
      const playerstat = await this.getPlayer(speaker);
      if(playerstat.bank<100){
        this.omegga.whisper(speaker, "You need atleast $100 to upgrade your pick. You have $"+playerstat.bank);
        return;
      }else{
        while(playerstat.bank>=100){
        playerstat.level++;
        playerstat.bank-=100;
        }
        this.store.set(playerstat.name+"_bank" as 'bar', playerstat.bank+"");
        this.store.set(playerstat.name+"_level" as 'bar', playerstat.level+"");
        this.omegga.whisper(speaker, "You are now at level "+playerstat.level+".");
      }
    });
    
    this.omegga.on('interact',
      async ({ player, position, brick_name, message }) => {
        const block = await getDoorBrickFromInteract(position);
        const playerstat = await this.getPlayer(this.omegga.getPlayer(player.name).name);

        let ore = await this.getOre(position);
        if(ore == null){
          ore = await this.genOre(position,block,0,0,0);
        }else{
          ore.setDurability(ore.getDurability()-playerstat.level);
        }
        
        if(ore==null || ore.getDurability() <= 0){
          if(ore!=null&&ore.type.price>0){
          this.omegga.middlePrint(player.name,ore.type.name+" || Earned: $"+ore.type.price);
          playerstat.bank+=ore.type.price;
          this.store.set(playerstat.name+"_bank" as 'bar', playerstat.bank+"");
        }
        // get door data from the brick position
        let x1: string = "x"+(position[0]+40)+"y"+position[1]+"z"+position[2];
        if(spots.indexOf(x1)==-1){
          let oreStuff = this.genOre(position,block,40,0,0);
          spots.push(x1);
        }
        let x2: string = "x"+(position[0]-40)+"y"+position[1]+"z"+position[2];
        if(spots.indexOf(x2)==-1){
          let oreStuff = this.genOre(position,block,-40,0,0);
          spots.push(x2);
        }
        let y1: string = "x"+(position[0])+"y"+(position[1]+40)+"z"+position[2];
        if(spots.indexOf(y1)==-1){
          let oreStuff = this.genOre(position,block,0,40,0);
          spots.push(y1);
        }
        let y2: string = "x"+(position[0])+"y"+(position[1]-40)+"z"+position[2];
        if(spots.indexOf(y2)==-1){
          let oreStuff = this.genOre(position,block,0,-40,0);
          spots.push(y2);
        }
        let z1: string = "x"+(position[0])+"y"+(position[1])+"z"+(position[2]+40);
        if(spots.indexOf(z1)==-1){
          let oreStuff = this.genOre(position,block,0,0,40);
          spots.push(z1);
        }
        let z2: string = "x"+(position[0])+"y"+(position[1])+"z"+(position[2]-40);
        if(spots.indexOf(z2)==-1){
          let oreStuff = this.genOre(position,block,0,0,-40);
          spots.push(z2);
        }

          this.clearBricks(position,block.brick.size,block.ownerId);
        }else{          
        this.omegga.middlePrint(player.name,ore.type.name+" || Durability: "+ore.getDurability());
        }

    });


    return { registeredCommands: ['upgrade','upgradeall','bank'] };
  }

  async stop() {

  }

  async genOre(pos: Vector,block: any, xx: number, yy: number, zz: number){
    const doorData = (await Omegga.getSaveData({center: pos, extent: block.brick.size})) as WriteSaveObject;
    let blockPos: Vector = [pos[0],pos[1],pos[2]];
    blockPos[0]+=xx;
    blockPos[1]+=yy;
    blockPos[2]+=zz;
    if(blockPos[0]<120&&blockPos[0]>-120)
    if(blockPos[1]<120&&blockPos[1]>-120)
    if(blockPos[2]<120&&blockPos[2]>0)
    return null;
    let ore = null;
    if(getRandomInt(100)<1){
      let oret = oretypes[getRandomInt(oretypes.length)];
      while(oret.minY > blockPos[2] || oret.maxY<blockPos[2]){
        oret = oretypes[getRandomInt(oretypes.length)];
      }
        ore = new Ore(blockPos,oret);
        ores.push(ore);
    }else{
      let i = 0;
      let stone = stonetypes[i];
      while(stone.minY > blockPos[2] || stone.maxY<blockPos[2]){
        i++;
        stone = stonetypes[i];
      }
      ore = new Ore(blockPos,stone);
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
      if(element.location[0] === position[0]){
        if(element.location[1] === position[1]){
          if(element.location[2] === position[2]){
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
    for (const ps of playerstats) {
      if(ps.name===player){
        return ps;
      }      
    }
    let bank = 0;
    let level = 1;
    let xxl = await this.store.get(player+"_bank" as 'bar')
    let xxk = await this.store.get(player+"_level" as 'bar')
    if(xxl !== null){
      bank = +xxl;
    }
    if(xxk !== null){
      level = +xxk;
    }
    const ps = new PlayerStats(player,level,bank);
    playerstats.push(ps);
    return ps;
  }
}

function getRandomInt(max: number) {
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