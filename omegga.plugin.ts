import OmeggaPlugin, { OL, PS, PC, Vector, Brick, WriteSaveObject, OmeggaPlayer } from 'omegga';
import { PlayerStats } from './playerstats';
import Ore from './ore'
import OreType from './oretype'
import { Chunk } from './chunk';

type Config = { foo: string };

const BRICK_SIZE = 20;
let spots: Chunk[] = []; //An array of all positions that have been generated
let ores: Ore[] = []; //An array of all current ores loaded in memory.
let playerstats : {[index:string]: PlayerStats} = {}; //An Object containing all player data
let oretypes: OreType[] = [];
let stonetypes: OreType[]=[];
let lava: OreType = new OreType(1,"Lava",0,-5000000,5000,13,5);
let lotto: OreType = new OreType(15000,"LottoBlock",0,-5000000,5000,18,5);
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

    const playerStatsStore = await this.store.get("playerStatsObject")
    for(const pla of this.omegga.getPlayers()){
      if(playerStatsStore[pla.name] === undefined){
        playerstats[pla.name] = new PlayerStats(pla.name, 1, 0, 0)
        console.info(`New player '${pla.name}' detected, giving them a playerstats template.`)
      } else {
        playerstats[pla.name] = playerStatsStore[pla.name]
      }
    }
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
    oretypes.push(new OreType(1100,"Dura-Steel",100,-160000,-4000,19,6));
    oretypes.push(new OreType(1200,"Netherite",125,-160000,-4000,8,6));
    oretypes.push(new OreType(2200,"Plasteel",225,-160000,-4000,20,3));
    oretypes.push(new OreType(4100,"Platinum",425,-160000,-4000,20,3));
    oretypes.push(new OreType(5100,"Beskar",525,-160000,-4000,11,6));
    oretypes.push(new OreType(10100,"Uranium",1025,-160000,-4000,18,7));




    stonetypes.push(new OreType(99995,"Space",32,28000,52000,11,5));
    stonetypes.push(new OreType(59999,"Thin Air",20,24000,28000,72,3));
    stonetypes.push(new OreType(9995,"Air",15,20000,24000,79,3));
    stonetypes.push(new OreType(995,"Water",10,16000,20000,82,3));
    stonetypes.push(new OreType(15,"Gravel",5,8000,16000,7,3));
    stonetypes.push(new OreType(5,"Dirt",2,4000,8000,12,3));
    //Players Spawn here
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

    //Autosaver 

    const autosaver = setInterval(()=>{
      this.store.set("playerStatsObject", playerstats)
    },(this.config['autosave_interval']*60000))


    this.omegga.on('join', async (player: OmeggaPlayer) => {
      const name = player.name
      const playerStatsStore = await this.store.get("playerStatsObject")
      if(playerStatsStore[name] === undefined){
        playerstats[name] = new PlayerStats(name, 1, 0, 0)
        console.info(`New player '${name}' has joined, giving them a playerstats template.`)
        return;
      }
    })
    this.omegga.on('leave', async (player: OmeggaPlayer) =>{
      console.info(`Saving PlayerStats...`)
      this.store.set("playerStatsObject", playerstats)
    })



    this.omegga.on('cmd:bank', async (speaker: string) => {
        let playerstat = playerstats[speaker]
        this.omegga.whisper(speaker, "You have $"+playerstat.bank);
    });

    this.omegga.on('cmd:top', async (speaker: string) => {
      for(const pla of this.omegga.getPlayers()){
        const playerstat = playerstats[pla.name]
          this.omegga.whisper(speaker, "-"+pla.name+" : $"+playerstat.bank+" || Level: "+playerstat.level);
      }
    }); 
    this.omegga.on('cmd:upgrade', async (speaker: string) => {
      let playerstat = playerstats[speaker]
      let cost: number = (playerstat.level*5)+75;
      if(playerstat.bank<cost){
        this.omegga.whisper(speaker, "You need atleast $"+cost+" to upgrade your pick. You have $"+playerstat.bank);
        return;
      }else{
        playerstat.level++;
        playerstat.bank-=cost;
        this.omegga.whisper(speaker, "You are now at level "+playerstat.level+".");
      }
    });

    this.omegga.on('cmd:buyhs', async (speaker: string) => {
      const playerstat = playerstats[speaker]
      if(playerstat.bank<100){
        this.omegga.whisper(speaker, "You need atleast $100 to buy a heat suit. You have $"+playerstat.bank);
        return;
      }else{
        playerstat.lavasuit++;
        playerstat.bank-=100;
        this.omegga.whisper(speaker, "You now have "+playerstat.lavasuit+" heat suits.");
      }
    });

    this.omegga.on('cmd:upgradeall', async (speaker: string) => {
      let playerstat = playerstats[speaker]
      let cost: number = (playerstat.level*5)+75;
      if(playerstat.bank<100){
        this.omegga.whisper(speaker, "You need atleast $500 to upgrade your pick. You have $"+playerstat.bank);
        return;
      }else{
        while(playerstat.bank>=500){
        playerstat.level++;
        playerstat.bank-=cost;
        }
        this.omegga.whisper(speaker, "You are now at level "+playerstat.level+".");
      }
    });
    
    this.omegga.on('interact',
      async ({ player, position }) => {
        let playerstat = playerstats[player.name]
        if(Date.now()-playerstat.cooldown<100){
            return;
        }
        playerstat.cooldown=Date.now();

        let ore = await this.getOre(position);
        

        //This code is always expected to work, however if a user attempts to access a brick that doesn't exist, instead of an unhandled exception crash, we log it and mine the brick.
        try {
          if(ore.type.price>0){
            if(ore.getDurability()>0&&ore.getDurability()-playerstat.level<=0){
              this.omegga.middlePrint(player.name,ore.type.name+" || Earned: $"+ore.type.price);
              playerstat.bank+=ore.type.price;
            }

            ore.setDurability(ore.getDurability()-playerstat.level);
          }
        } catch (error) {
          console.error(`Brick at position (${position[0]},${position[1]},${position[2]}) doesn't exist!`)
          
        }

        
        if(ore == null || ore.getDurability() <= 0){

          // checks for spots that have already been mined
          if(ore == null) {
            let chunk = getChunk(position[0],position[1],position[2]);
            if(chunk.spots.indexOf("x"+position[0]+"y"+position[1]+"z"+position[2])==-1){
              chunk.spots.push("x"+position[0]+"y"+position[1]+"z"+position[2]);
            }
  
            
          }
          
          let x1: string = "x"+(position[0]+40)+"y"+position[1]+"z"+position[2];
          let chunk = getChunk(position[0]+40,position[1],position[2]);
          let positionArray:Array<Vector> = [];
          if(chunk.spots.indexOf(x1)==-1){
            positionArray.push([position[0]+40,position[1],position[2]])
            chunk.spots.push(x1);
          }
          chunk = getChunk(position[0]-40,position[1],position[2]);
          let x2: string = "x"+(position[0]-40)+"y"+position[1]+"z"+position[2];
          if(chunk.spots.indexOf(x2)==-1){
            positionArray.push([position[0]-40,position[1],position[2]])
            chunk.spots.push(x2);
          }
          chunk = getChunk(position[0],position[1]+40,position[2]);
          let y1: string = "x"+(position[0])+"y"+(position[1]+40)+"z"+position[2];
          if(chunk.spots.indexOf(y1)==-1){
            positionArray.push([position[0],position[1]+40,position[2]])
            chunk.spots.push(y1);
          }
          chunk = getChunk(position[0],position[1]-40,position[2]);
          let y2: string = "x"+(position[0])+"y"+(position[1]-40)+"z"+position[2];
          if(chunk.spots.indexOf(y2)==-1){
            positionArray.push([position[0],position[1]-40,position[2]])
            chunk.spots.push(y2);
          }
          chunk = getChunk(position[0],position[1],position[2]+40);
          let z1: string = "x"+(position[0])+"y"+(position[1])+"z"+(position[2]+40);
          if(chunk.spots.indexOf(z1)==-1){
            positionArray.push([position[0],position[1],position[2]+40])
            chunk.spots.push(z1);
          }
          chunk = getChunk(position[0],position[1],position[2]-40);
          let z2: string = "x"+(position[0])+"y"+(position[1])+"z"+(position[2]-40);
          if(chunk.spots.indexOf(z2)==-1){
            positionArray.push([position[0],position[1],position[2]-40])
            chunk.spots.push(z2);
          }
          this.genOre(positionArray);
          Omegga.writeln(
            `Bricks.ClearRegion ${position.join(' ')} ${BRICK_SIZE} ${BRICK_SIZE} ${BRICK_SIZE}`
          );

        }else{          
        this.omegga.middlePrint(player.name,ore.type.name+" || Durability: "+ore.getDurability());
        }

        if(ore == null) return;
        switch (ore.type) {
          case lava:
            
            if(playerstat.lavasuit>0){
              playerstat.lavasuit--;
            }else{
            this.omegga.getPlayer(player.id).kill();
            this.omegga.broadcast(""+playerstat.name+" was killed by lava!");
            }

            break;

          case lotto:

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

          
          break;
        
          default:
            break;
        }

    });


    return { registeredCommands: ['upgrade','upgradeall','bank'] };
  }

  async stop() {

  }
  //Fat Function should be split for organization.
  /**
   * Generates ore to the memory arrays / Loads brickData.
   * @param posArray
   */
  genOre(posArray: Array<Vector>):void{
    let positionalData = [];

    for(let i = 0; i < posArray.length; i++){
      let pos = posArray[i]
      
      let blockPos: Vector = [pos[0],pos[1],pos[2]];
      let ore = null;
      
      // ore generator
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
        let j = 0;
        let stone = stonetypes[j];
        while(stone.minY > blockPos[2] || stone.maxY<blockPos[2]){
          j++;
          stone = stonetypes[j];
        }
        ore = new Ore(blockPos,stone);
        ores.push(ore);
      }
      positionalData.push({
        position:pos,
        size:[BRICK_SIZE,BRICK_SIZE,BRICK_SIZE],
        color:ore.type.color,
        material_index:ore.type.material
      })
    };

    const publicUser = {
      id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      name: 'Generator',
    };
  
    let save:WriteSaveObject;

    save = {
      author: {
        id: publicUser.id,
        name: 'TypeScript',
      },
      description: 'Load Segment',
      map: 'Load Segment',
      brick_assets: [ 'PB_DefaultBrick' ],
      colors: [
        [ 255, 255, 255, 255 ], [ 184, 184, 184, 255 ], [ 136, 136, 136, 255 ],
        [ 114, 114, 114, 255 ], [ 90, 90, 90, 255 ],    [ 57, 57, 57, 255 ],
        [ 35, 35, 35, 255 ],    [ 24, 24, 24, 255 ],    [ 17, 17, 17, 255 ],
        [ 6, 6, 6, 255 ],       [ 2, 2, 2, 255 ],       [ 0, 0, 0, 255 ],
        [ 87, 5, 9, 255 ],      [ 235, 6, 6, 255 ],     [ 255, 29, 3, 255 ],
        [ 246, 73, 6, 255 ],    [ 235, 157, 6, 255 ],   [ 61, 164, 4, 255 ],
        [ 9, 139, 5, 255 ],     [ 3, 16, 255, 255 ],    [ 12, 244, 255, 255 ],
        [ 163, 35, 85, 255 ],   [ 48, 8, 72, 255 ],     [ 14, 6, 49, 255 ],
        [ 41, 25, 25, 255 ],    [ 96, 71, 73, 255 ],    [ 181, 131, 134, 255 ],
        [ 45, 44, 27, 255 ],    [ 114, 109, 65, 255 ],  [ 144, 139, 100, 255 ],
        [ 27, 45, 28, 255 ],    [ 65, 114, 68, 255 ],   [ 100, 144, 103, 255 ],
        [ 30, 39, 41, 255 ],    [ 71, 92, 96, 255 ],    [ 131, 171, 181, 255 ],
        [ 23, 5, 2, 255 ],      [ 90, 16, 5, 255 ],     [ 77, 20, 1, 255 ],
        [ 77, 30, 7, 255 ],     [ 144, 60, 18, 255 ],   [ 166, 104, 62, 255 ],
        [ 255, 159, 78, 255 ],  [ 255, 121, 78, 255 ],  [ 50, 20, 13, 255 ],
        [ 21, 12, 3, 255 ],     [ 51, 33, 13, 255 ],    [ 194, 163, 58, 255 ],
        [ 19, 2, 1, 255 ],      [ 73, 4, 1, 255 ],      [ 190, 23, 18, 255 ],
        [ 190, 59, 53, 255 ],   [ 255, 149, 156, 255 ], [ 255, 79, 38, 255 ],
        [ 255, 41, 2, 255 ],    [ 171, 54, 27, 255 ],   [ 109, 64, 5, 255 ],
        [ 171, 99, 8, 255 ],    [ 255, 146, 11, 255 ],  [ 255, 175, 47, 255 ],
        [ 22, 37, 1, 255 ],     [ 67, 80, 12, 255 ],    [ 122, 144, 30, 255 ],
        [ 101, 255, 81, 255 ],  [ 13, 204, 47, 255 ],   [ 0, 77, 0, 255 ],
        [ 11, 54, 11, 255 ],    [ 5, 30, 3, 255 ],      [ 5, 18, 5, 255 ],
        [ 8, 43, 27, 255 ],     [ 9, 96, 53, 255 ],     [ 8, 146, 66, 255 ],
        [ 5, 13, 17, 255 ],     [ 11, 30, 44, 255 ],    [ 1, 34, 64, 255 ],
        [ 0, 65, 122, 255 ],    [ 8, 118, 200, 255 ],   [ 5, 152, 171, 255 ],
        [ 80, 147, 163, 255 ],  [ 134, 250, 255, 255 ], [ 86, 119, 242, 255 ],
        [ 37, 55, 235, 255 ],   [ 12, 25, 156, 255 ],   [ 1, 4, 44, 255 ],
        [ 8, 0, 30, 255 ],      [ 18, 0, 57, 255 ],     [ 56, 19, 100, 255 ],
        [ 141, 45, 255, 255 ],  [ 255, 93, 255, 255 ],  [ 253, 149, 255, 255 ],
        [ 255, 58, 116, 255 ],  [ 91, 18, 55, 255 ],    [ 255, 24, 255, 255 ],
        [ 255, 0, 55, 255 ],    [ 127, 0, 29, 255 ],    [ 55, 0, 55, 255 ]
      ],
      materials: [
        'BMC_Hidden',
        'BMC_Ghost',
        'BMC_Ghost_Fail',
        'BMC_Plastic',
        'BMC_Glass',
        'BMC_Glow',
        'BMC_Metallic',
        'BMC_Hologram'
      ],
      brick_owners: [publicUser],
      bricks: positionalData
        .map(({position, size, color, material_index}) => ({
          size: size,
          position: position,
          color:color,
          material_index:material_index,
          components:{
              BCD_Interact:{
                  bPlayInteractSound:true,
                  ConsoleTag:``,
                  Message:''
              },
          }
          
        })
      )
    };

    if(save.bricks.length != 0){
      Omegga.loadSaveData(save, {quiet: true});
    }
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



  async clearBricks(center: Vector, extent: Vector){
    // clear the old door bricks
    
  }
  /*
  async getPlayer(player: string){
    for (const ps of playerstats) {
      if(ps.name===player){
        return ps;
      }      
    }
    let bank = 0;
    let level = 1;
    let xxl = await this.store.get(player+"_bank" )
    let xxk = await this.store.get(player+"_level" )
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
  */
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
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


/** lookup a brick by position and filter fn
 * @param unique when enabled, require this door to be unique
 */
/* export async function getDoorBrickQuery(
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
}*/

/** get a brick's data from interact metadata (for relative positioning) */
/*export async function getDoorBrickFromInteract(
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
}*/