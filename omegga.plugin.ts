import OmeggaPlugin, { OL, PS, PC, Vector, Brick, WriteSaveObject } from 'omegga';
import { PlayerStats } from './playerstats';
import Ore from './ore'
import OreType from './oretype'
import { Chunk } from './chunk';

type Config = { foo: string };
type Storage = { bar: string };

let spots: Chunk[] = [];
let ores: Ore[] = [];
let playerstats : PlayerStats[] = [];
let oretypes: OreType[] = [];
let stonetypes: OreType[]=[];
let lava: OreType = new OreType(1,"Lava",0,-5000000,5000,13,5);
let lotto: OreType = new OreType(15000,"LottoBlock",0,-5000000,5000,18,5);
let doorData = null;
let globalMoneyMultiplier = 1;

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


    oretypes.push(new OreType(10,"Tin",5,-40000,4000,0,3));
    oretypes.push(new OreType(20,"Copper",5,-40000,4000,15,6));
    oretypes.push(new OreType(30,"Cobalt",10,-40000,4000,20,3));
    oretypes.push(new OreType(60,"Iron",15,-40000,4000,7,3));
    oretypes.push(new OreType(70,"Tungsten",25,-40000,4000,10,6));
    oretypes.push(new OreType(100,"Gold",45,-40000,4000,16,6));
    oretypes.push(new OreType(200,"Diamond",50,-40000,4000,20,4));
    oretypes.push(new OreType(400,"Emerald",100,-40000,4000,18,3));
    oretypes.push(new OreType(1100,"Dura-Steel",300,-160000,-4000,19,6));
    oretypes.push(new OreType(1200,"Netherite",325,-160000,-4000,8,6));
    oretypes.push(new OreType(2200,"Plasteel",625,-160000,-4000,20,3));
    oretypes.push(new OreType(4100,"Platinum",825,-160000,-4000,20,3));
    oretypes.push(new OreType(5100,"Beskar",1025,-160000,-4000,11,6));
    oretypes.push(new OreType(10100,"Uranium",2025,-160000,-4000,18,7));




    stonetypes.push(new OreType(99995,"Space",32,28000,52000,11,5));
    stonetypes.push(new OreType(59999,"Thin Air",20,24000,28000,72,3));
    stonetypes.push(new OreType(9995,"Air",15,20000,24000,79,3));
    stonetypes.push(new OreType(995,"Water",10,16000,20000,82,3));
    stonetypes.push(new OreType(15,"Gravel",5,8000,16000,7,3));
    stonetypes.push(new OreType(5,"Dirt",2,4000,8000,12,3));
    //Start here
    stonetypes.push(new OreType(5,"Stone",1,-4000,4000,4,3));
    stonetypes.push(new OreType(15,"Hard Stone",2,-8000,-4000,5,3));
    stonetypes.push(new OreType(115,"Harder Stone",4,-12000,-8000,5,3));
    stonetypes.push(new OreType(1115,"Hardest Stone",8,-16000,-12000,6,3));
    stonetypes.push(new OreType(11115,"Deepslate",16,-20000,-16000,7,3));
    stonetypes.push(new OreType(22225,"Bedrock",32,-24000,-20000,8,3));
    stonetypes.push(new OreType(33335,"Granite",64,-30000,-24000,12,3));
    stonetypes.push(new OreType(55555,"Condensed Stone",128,-40000,-30000,7,3));
    stonetypes.push(new OreType(66666,"Hardened Stone Squared",256,-50000,-40000,8,3));
    stonetypes.push(new OreType(100000,"Deep Stone",512,-70000,-50000,9,3));

    this.omegga.on('cmd:bank', async (speaker: string) => {
      const playerstat = await this.getPlayer(this.omegga.getPlayer(speaker).name);
        this.omegga.whisper(speaker, "You have $"+playerstat.bank.toFixed(2));
    });
    this.omegga.on('cmd:top', async (speaker: string) => {
      for(const pla of this.omegga.getPlayers()){
        const playerstat = await this.getPlayer(this.omegga.getPlayer(pla.name).name);
          this.omegga.whisper(speaker, "-"+pla.name+" : $"+playerstat.bank+" || Level: "+playerstat.level);
      }
    });
    this.omegga.on('cmd:upgrade', async (speaker: string) => {
      const playerstat = await this.getPlayer(this.omegga.getPlayer(speaker).name);
      let cost: number = (playerstat.level*5)+75;
      if(playerstat.bank<cost){
        this.omegga.whisper(speaker, "You need atleast $"+cost+" to upgrade your pick. You have $"+playerstat.bank);
        return;
      }else{
        playerstat.level++;
        playerstat.bank-=cost;
        this.store.set(playerstat.name+"_bank" as 'bar', playerstat.bank+"");
        this.store.set(playerstat.name+"_level" as 'bar', playerstat.level+"");
        this.omegga.whisper(speaker, "You are now at level "+playerstat.level+".");
      }
    });
    this.omegga.on('cmd:buyhs', async (speaker: string) => {
      const playerstat = await this.getPlayer(this.omegga.getPlayer(speaker).name);
      if(playerstat.bank<100){
        this.omegga.whisper(speaker, "You need atleast $100 to buy a heat suit. You have $"+playerstat.bank);
        return;
      }else{
        playerstat.lavasuit++;
        playerstat.bank-=100;
        this.store.set(playerstat.name+"_bank" as 'bar', playerstat.bank+"");
        this.store.set(playerstat.name+"_ls" as 'bar', playerstat.lavasuit+"");
        this.omegga.whisper(speaker, "You now have "+playerstat.lavasuit+" heat suits.");
      }
    });
    this.omegga.on('cmd:upgradeall', async (speaker: string) => {
      const playerstat = await this.getPlayer(speaker);
      let cost: number = (playerstat.level*5)+75;
      if(playerstat.bank<cost){
        this.omegga.whisper(speaker, "You need atleast $"+cost+" to upgrade your pick. You have $"+playerstat.bank);
        return;
      }else{
        while(playerstat.bank>= (playerstat.level*5)+75){
        playerstat.level++;
        playerstat.bank-=(playerstat.level*5)+75;
        }
        this.store.set(playerstat.name+"_bank" as 'bar', playerstat.bank+"");
        this.store.set(playerstat.name+"_level" as 'bar', playerstat.level+"");
        this.omegga.whisper(speaker, "You are now at level "+playerstat.level+".");
      }
    });
    
    this.omegga.on('interact',
      async ({ player, position, brick_name, message }) => {
        const playerstat = await this.getPlayer(this.omegga.getPlayer(player.name).name);
        if(Date.now()-playerstat.cooldown<100){
            return;
        }
        playerstat.cooldown=Date.now();
        const block = await getDoorBrickFromInteract(position);

        let ore = await this.getOre(position);
        if(ore == null){
          ore = await this.genOre(position,block,0,0,0);
        }else{
          if(ore!=null&&ore.type.price>0){
            if(ore.getDurability()>0&&ore.getDurability()-playerstat.level<=0){
          this.omegga.middlePrint(player.name,ore.type.name+" || Earned: $"+(ore.type.price*globalMoneyMultiplier).toFixed(2)+"<br><br><br><br><br><br>Level="+playerstat.level+" Y="+ ore.location[2]+"</></></></></></>");
          playerstat.bank+=ore.type.price*globalMoneyMultiplier;
          this.store.set(playerstat.name+"_bank" as 'bar', playerstat.bank.toFixed(2)+"");
          }
        }
          ore.setDurability(ore.getDurability()-playerstat.level);
        }
        
        if(ore==null || ore.getDurability() <= 0){

          if(ore!=null){
          if(ore.type==lava){
            if(playerstat.lavasuit>0){
              playerstat.lavasuit--;
              this.store.set(playerstat.name+"_ls" as 'bar', playerstat.lavasuit+"");
            }else{
            this.omegga.getPlayer(player.id).kill();
            this.omegga.broadcast(""+playerstat.name+" was killed by lava!");
            }
          }else if(ore.type==lotto){
            let multiplier = 0.02;
            let chance = 0.99;
            let ppp = 1;
            do{
                multiplier+=Math.random();
                chance*=0.99;
                ppp++;
            }while(Math.random() < chance)
            globalMoneyMultiplier=multiplier/(ppp/6);
            this.omegga.broadcast(playerstat.name+" mined a lotto-block and set the multiplier to "+globalMoneyMultiplier);
          
          }
        }

        // get door data from the brick position
        let x1: string = "x"+(position[0]+40)+"y"+position[1]+"z"+position[2];
        let chunk = getChunk(position[0]+40,position[1],position[2]);
        if(chunk.spots.indexOf(x1)==-1){
          let oreStuff = this.genOre(position,block,40,0,0);
          chunk.spots.push(x1);
        }

        x1 = "x"+(position[0]-40)+"y"+position[1]+"z"+position[2];
        chunk = getChunk(position[0]-40,position[1],position[2]);
        if(chunk.spots.indexOf(x1)==-1){
          let oreStuff = this.genOre(position,block,-40,0,0);
          chunk.spots.push(x1);
        }
        x1 = "x"+(position[0])+"y"+(position[1]+40)+"z"+(position[2]);
        chunk = getChunk(position[0],position[1]+40,position[2]);
        if(chunk.spots.indexOf(x1)==-1){
          let oreStuff = this.genOre(position,block,0,40,0);
          chunk.spots.push(x1);
        }
        x1 = "x"+(position[0])+"y"+(position[1]-40)+"z"+(position[2]);
        chunk = getChunk(position[0],position[1]-40,position[2]);
        if(chunk.spots.indexOf(x1)==-1){
          let oreStuff = this.genOre(position,block,0,-40,0);
          chunk.spots.push(x1);
        }
        x1 = "x"+(position[0])+"y"+(position[1])+"z"+(position[2]+40);
        chunk = getChunk(position[0],position[1],position[2]+40);
        if(chunk.spots.indexOf(x1)==-1){
          let oreStuff = this.genOre(position,block,0,0,40);
          chunk.spots.push(x1);
        }
        x1 = "x"+(position[0])+"y"+(position[1])+"z"+(position[2]-40);
        chunk = getChunk(position[0],position[1],position[2]-40);
        if(chunk.spots.indexOf(x1)==-1){
          let oreStuff = this.genOre(position,block,0,0,-40);
          chunk.spots.push(x1);
        }


          if(block.brick!=null){
          this.clearBricks(position,block.brick.size,block.ownerId);
          }
      
        }else{          
        this.omegga.middlePrint(player.name,ore.type.name+" || Durability: "+ore.getDurability()+"<br><br><br><br><br><br>Level="+playerstat.level+" Y="+ ore.location[2]+"</></></></></></>");
        }

    });


    return { registeredCommands: ['upgrade','upgradeall','bank','top','buyhs'] };
  }

  async stop() {

  }

  async genOre(pos: Vector,block: any, xx: number, yy: number, zz: number){
    doorData =  (await Omegga.getSaveData({center: pos, extent: block.brick.size})) as WriteSaveObject;
    let blockPos: Vector = [pos[0],pos[1],pos[2]];
    blockPos[0]+=xx;
    blockPos[1]+=yy;
    blockPos[2]+=zz;
    if(blockPos[0]<120&&blockPos[0]>-120)
    if(blockPos[1]<120&&blockPos[1]>-120)
    if(blockPos[2]<120&&blockPos[2]>0)
    return null;
    let ore = null;
    if(getRandomInt(1000)<1){
      ore = new Ore(blockPos,lotto);
      ores.push(ore);
    }else if(getRandomInt(100)<Math.min(50,-blockPos[2]/7000)){
        ore = new Ore(blockPos,lava);
        ores.push(ore);
    }else if(getRandomInt(100)<4){
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
    doorData.bricks[0].color=ore.type.color;
    doorData.bricks[0].material_index=ore.type.material;
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
    let lavasuits = 0;
    let xxl = await this.store.get(player+"_bank" as 'bar')
    let xxk = await this.store.get(player+"_level" as 'bar')
    let xxls = await this.store.get(player+"_ls" as 'bar')
    if(xxl !== null){
      bank = +xxl;
    }
    if(xxk !== null){
      level = +xxk;
    }
    if(xxls !== null){
      lavasuits = +xxls;
    }
    const ps = new PlayerStats(player,level,bank,lavasuits);
    playerstats.push(ps);
    return ps;
  }
}

function getChunk(x: number, y: number, z: number){
  for(const chunk of spots){
    if(x/2560==chunk.x){
      if(y/2560==chunk.y){
        if(z/2560==chunk.z){
          return chunk;
        }
      }
    }
  }
  let c = new Chunk(x/2560,y/2560,z/2560);
  spots.push(c);
  return c;
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