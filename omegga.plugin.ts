import OmeggaPlugin, { OL, PS, PC, Vector, Brick, WriteSaveObject, OmeggaPlayer } from 'omegga';
import { PlayerStats } from './playerstats';
import Ore from './ore'
import OreType from './oretype'
import { Chunk } from './chunk';

type Config = { foo: string };

const CHUNK_SIZE = 51200;
const BRICK_SIZE = 20;
let spots: Chunk[] = []; //An array of all positions that have been generated
let ores: Ore[] = []; //An array of all current ores loaded in memory.
//let playerstats : {[index:string]: PlayerStats} = {}; //An Object containing all player data
let playerstats : PlayerStats[] = []; //An Object containing all player data
let oretypes: OreType[] = [];
let stonetypes: OreType[]=[];
let lava: OreType = new OreType(1,"Lava",0,-5000000,5000,13,5);
let lotto: OreType = new OreType(15000,"LottoBlock",0,-5000000,5000,18,5);
let globalMoneyMultiplier = 1;
let globalMoneyMultiplierTimer = 0;
let rlcbmium=null;
let blocksave = false;

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
    this.omegga.on('autorestart',async()=>{
      for(const pla of this.omegga.getPlayers()){
        const pss_bank = await this.store.get("playerStatsObject_"+pla.name+"_bank");
        const pss_level = await this.store.get("playerStatsObject_"+pla.name+"_level");
        const pss_ls = await this.store.get("playerStatsObject_"+pla.name+"_ls");
        if(pss_bank === undefined || pss_bank===null){
          playerstats[pla.name] = new PlayerStats(pla.name, 1, 0, 0,0,0);
          if(pla!=undefined && pla.name!=undefined)
          console.info(`New player '${pla.name}' detected, giving them a playerstats template.`);
        } else {
          const pss_lm = await this.store.get("playerStatsObject_"+pla.name+"_lm");
          const pss_bm = await this.store.get("playerStatsObject_"+pla.name+"_bm");
          if(pss_lm===undefined||pss_lm===null){
          playerstats[pla.name] = new PlayerStats(pla.name, pss_level, pss_bank, pss_ls,0,0);
          }else{
          playerstats[pla.name] = new PlayerStats(pla.name, pss_level, pss_bank, pss_ls,pss_lm,pss_bm);
          }
        }
      }
      this.omegga.clearAllBricks();
      this.omegga.loadBricks("brminer")
      spots=[];
      ores=[];
    });
    for(const pla of this.omegga.getPlayers()){
      const pss_bank = await this.store.get("playerStatsObject_"+pla.name+"_bank");
      const pss_level = await this.store.get("playerStatsObject_"+pla.name+"_level");
      const pss_ls = await this.store.get("playerStatsObject_"+pla.name+"_ls");
      if(pss_bank === undefined || pss_bank===null){
        playerstats[pla.name] = new PlayerStats(pla.name, 1, 0, 0,0,0);
        if(pla!=undefined && pla.name!=undefined)
        console.info(`New player '${pla.name}' detected, giving them a playerstats template.`);
      } else {
        const pss_lm = await this.store.get("playerStatsObject_"+pla.name+"_lm");
        const pss_bm = await this.store.get("playerStatsObject_"+pla.name+"_bm");
        if(pss_lm===undefined||pss_lm===null){
        playerstats[pla.name] = new PlayerStats(pla.name, pss_level, pss_bank, pss_ls,0,0);
        }else{
        playerstats[pla.name] = new PlayerStats(pla.name, pss_level, pss_bank, pss_ls,pss_lm,pss_bm);
        }
      }
    }
    this.omegga.clearAllBricks();
    this.omegga.loadBricks("brminer")


    oretypes.push(new OreType(10,"Tin",5,-4000000000,4000000000,0,6));
    oretypes.push(new OreType(200000,"FrogInCharium", 4000,4000,20000,12,6));
    oretypes.push(new OreType(10,"Coal",5,-4000000000,4000000000,0,11));
    oretypes.push(new OreType(20,"Copper",5,-40000,4000,15,6));
    oretypes.push(new OreType(30,"Cobalt",10,-40000,4000,20,6));
    oretypes.push(new OreType(60,"Iron",15,-40000,4000,7,6));
    oretypes.push(new OreType(70,"Tungsten",25,-40000,4000,10,6));
    oretypes.push(new OreType(100,"Gold",45,-40000,4000,16,6));
    oretypes.push(new OreType(200,"Diamond",50,-40000,4000,20,4));
    oretypes.push(new OreType(400,"Emerald",100,-40000,4000,18,3));
    oretypes.push(new OreType(1100,"Dura-Steel",100,-160000,-4000,19,6));
    oretypes.push(new OreType(1200,"Netherite",125,-160000,-4000,8,6));
    oretypes.push(new OreType(2200,"Plasteel",225,-160000,-4000,20,3));
    oretypes.push(new OreType(4100,"Platinum",425,-160000,-4000,20,3));
    oretypes.push(new OreType(5100,"Beskar",525,-160000,-4000,11,6));
    oretypes.push(new OreType(10100,"Uranium",1025,-160000,-4000,17,5));
    oretypes.push(new OreType(50500,"Graphite",5000,-32000,-4000,37,3));
    oretypes.push(new OreType(200000,"Flavium", 20000,-320000,-16000,12,6));
    oretypes.push(rlcbmium=new OreType(101000,"rlcbmium",10100,-320000,-16000,23,4));
    oretypes.push(new OreType(501000,"Aware",50100,-320000,-16000,32,6));
    oretypes.push(new OreType(1001000,"Cakium",100100,-640000,-32000,37,6));
    oretypes.push(new OreType(5005000,"Simulatium",500100,-640000,-32000,37,7));
    oretypes.push(new OreType(101000000,"Bobcatiumm",10100100,-640000,-32000,24,7));




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
      console.info("Saving PlayerStats for ALL...")
      for(const pss of playerstats){
        if(pss!=null && pss != undefined){
        this.store.set("playerStatsObject_"+pss.name+"_bank", pss.bank);
        this.store.set("playerStatsObject_"+pss.name+"_level", pss.level);
        this.store.set("playerStatsObject_"+pss.name+"_ls", pss.lavasuit);
        this.store.set("playerStatsObject_"+pss.name+"_lm", pss.lowestY);
        this.store.set("playerStatsObject_"+pss.name+"_bm", pss.blocksmined);
        }
      }
    },(this.config['autosave-interval']*60000));
    
    const globalMoneyMultiplierTimerInterval = setInterval(()=>{
      globalMoneyMultiplierTimer--;
      if(globalMoneyMultiplierTimer==0){
        globalMoneyMultiplier=1;
        this.omegga.broadcast("Ore prices have returned to normal.");
      }
    },1000*60);


    this.omegga.on('join', async (player: OmeggaPlayer) => {
      const name = player.name
      const pss_bank = await this.store.get("playerStatsObject_"+name+"_bank");
      const pss_level = await this.store.get("playerStatsObject_"+name+"_level");
      const pss_ls = await this.store.get("playerStatsObject_"+name+"_ls");
      if(pss_bank === undefined || pss_bank===null){
        playerstats[name] = new PlayerStats(name, 1, 0, 0,0,0)
        console.info(`New player '${name}' has joined, giving them a playerstats template.`)
        return;
      }else{
        if(playerstats[name]!=undefined&&playerstats[name]!=null){
          const pss_lm = await this.store.get("playerStatsObject_"+name+"_lm");
          const pss_bm = await this.store.get("playerStatsObject_"+name+"_bm");
          if(pss_lm===undefined||pss_lm===null){
            playerstats[name]=new PlayerStats(name, pss_level,pss_bank,pss_ls,0,0);
          }else{
        playerstats[name]=new PlayerStats(name, pss_level,pss_bank,pss_ls,pss_lm,pss_bm);
          }
        }

      }
    })
    this.omegga.on('leave', async (player: OmeggaPlayer) =>{
      const name = player.name
      console.info("Saving PlayerStats for "+name+"...")
      const pla = playerstats[name];
      if(pla!=null){
      this.store.set("playerStatsObject_"+name+"_bank",pla.bank);
      this.store.set("playerStatsObject_"+name+"_level",pla.level);
      this.store.set("playerStatsObject_"+name+"_ls",pla.lavasuit);
      this.store.set("playerStatsObject_"+name+"_lm", pla.lowestY);
      this.store.set("playerStatsObject_"+name+"_bm", pla.blocksmined);
      }
    })



    this.omegga.on('cmd:bank', async (speaker: string) => {
        let playerstat = playerstats[speaker]
        this.omegga.whisper(speaker, "You have $"+playerstat.bank);
    });

    this.omegga.on('cmd:top', async (speaker: string) => {
      let playerArray: string[] = [];
      for(const pla of this.omegga.getPlayers()){
        playerArray.push(pla.name);
      }
      
      playerArray.sort(function(a, b) {
        const playerstat1 = playerstats[a]
        const playerstat2 = playerstats[b]
       return playerstat1.level - playerstat2.level;
      });
      for(const pla of playerArray){
        const playerstat = playerstats[pla]
        if(playerstat!=undefined){
          this.omegga.whisper(speaker, "-"+pla+" : $"+playerstat.bank+" || Level: "+playerstat.level+" || Blocks mined:"+playerstat.blocksmined);
        }else{
          this.omegga.whisper(speaker, "-"+pla+" : $ERROR");
        }
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
    this.omegga.on('cmd:mined', async (speaker: string) => {
        let playerstat = playerstats[speaker]
        this.omegga.whisper(speaker, "You have mined "+playerstat.blocksmined+".");
    });
    this.omegga.on('cmd:?', async (speaker: string) => {
        this.omegga.whisper(speaker, "--==Commands==--");
        this.omegga.whisper(speaker, "/? - sends you to this help page");
        this.omegga.whisper(speaker, "/upgrade - Upgrades your pick by one level.");
        this.omegga.whisper(speaker, "/upgrademax - Upgrades your pick by the max amount of levels you can buy");
        this.omegga.whisper(speaker, "/buyhs - Buys a heat suit so you can mine lava");
        this.omegga.whisper(speaker, "/bank - See how much money you currently have.");
        this.omegga.whisper(speaker, "/top - See how much money/levels everyone online has.");
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

    this.omegga.on('cmd:upgrademax', async (speaker: string) => {
      let playerstat = playerstats[speaker]
      let cost: number = (playerstat.level*5)+75;
      if(playerstat.bank<cost){
        this.omegga.whisper(speaker, "You need atleast $"+cost+" to upgrade your pick. You have $"+playerstat.bank);
        return;
      }else{
        while(playerstat.bank>=cost){
        playerstat.level++;
        playerstat.bank-=cost;
        }
        this.omegga.whisper(speaker, "You are now at level "+playerstat.level+".");
      }
    });
    
    this.omegga.on('interact',
      async ({ player, position }) => {
        let playerstat = playerstats[player.name]
        
      const name = player.name
      if(playerstat === undefined){
        playerstats[name] = new PlayerStats(name, 1, 0, 0,0,0)
        console.info(`New player '${name}' has joined, giving them a playerstats template.`)
        return;
      }
        if(Date.now()-playerstat.cooldown<100){
            return;
        }
        playerstat.cooldown=Date.now();

        let ore = await this.getOre(position);
        if(ore==null){
          await this.genOre([position],position);
          ore = await this.getOre(position);
        }
        

        //This code is always expected to work, however if a user attempts to access a brick that doesn't exist, instead of an unhandled exception crash, we log it and mine the brick.
        try {
          if(ore!=null){
            if(ore.getDurability()>0&&ore.getDurability()-playerstat.level<=0){
              playerstat.blocksmined++;
              if(ore.type.price>0){
              this.omegga.middlePrint(player.name,ore.type.name+" || Earned: $"+(ore.type.price));
              playerstat.bank+=(ore.type.price);
              }
              
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


          const slot = getRandomInt(100);

          if(slot<10){
            let recieved = playerstat.bank;
            recieved*=Math.random();
            playerstat.bank-=recieved;
            this.omegga.whisper(playerstat.name,"You has lost $"+recieved+".");

          }else if(slot<30){
            let recieved = playerstat.bank;
            recieved*=Math.random();
            playerstat.bank+=recieved;
            this.omegga.whisper(playerstat.name,"You have recieved $"+recieved+".");
            

          }else if (slot<45){
            globalMoneyMultiplier-=Math.random();
            this.omegga.broadcast(playerstat.name+" mined a lotto-block and lowered the multiplier to "+globalMoneyMultiplier);
          }else if (slot < 68){
            globalMoneyMultiplier+=Math.random();
            this.omegga.broadcast(playerstat.name+" mined a lotto-block and raised the multiplier to "+globalMoneyMultiplier);
          }else{
            this.omegga.broadcast(playerstat.name+" mined a lotto-block that did nothing!");
          }
            break;

          case rlcbmium:
            let date = new Date();
            this.omegga.broadcast(playerstat.name+": it is now "+date.getHours()+":"+date.getMinutes());
            break;
          default:
            break;
            }
          }
          ore.setDurability(ore.getDurability()-playerstat.level);
          }
        } catch (error) {
          console.error(`Brick at position (${position[0]},${position[1]},${position[2]}) doesn't exist!`);
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
          this.genOre(positionArray,position);
          Omegga.writeln(
            `Bricks.ClearRegion ${position.join(' ')} ${BRICK_SIZE} ${BRICK_SIZE} ${BRICK_SIZE}`
          );

        }else{          
        this.omegga.middlePrint(player.name,ore.type.name+" || Durability: "+ore.getDurability());
        }
    });


    return { registeredCommands: ['upgrade','upgrademax','bank','top','?','buyhs'] };
  }

  async stop() {
    console.info("Saving PlayerStats for ALL...")
    for(const pss of playerstats){
      if(pss!=null && pss != undefined){
      this.store.set("playerStatsObject_"+pss.name+"_bank", pss.bank)
      this.store.set("playerStatsObject_"+pss.name+"_level", pss.level)
      this.store.set("playerStatsObject_"+pss.name+"_ls", pss.lavasuit)
      this.store.set("playerStatsObject_"+pss.name+"_lm", pss.lowestY)
      this.store.set("playerStatsObject_"+pss.name+"_bm", pss.blocksmined)
      }
    }
  }
  //Fat Function should be split for organization.
  /**
   * Generates ore to the memory arrays / Loads brickData.
   * @param posArray
   */
  genOre(posArray: Array<Vector>, center: Vector):void{
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
        let tries = 0;
        while((oret.minY > blockPos[2] || oret.maxY<blockPos[2])&&tries<1000){
          oret = oretypes[getRandomInt(oretypes.length)];
          tries++;
        }
          ore = new Ore(blockPos,oret);
          ores.push(ore);
      }else{
        let j = 0;
        let stone = stonetypes[j];
        while((stone.minY > blockPos[2] || stone.maxY<blockPos[2])&&j < stonetypes.length){
          j++;
          stone = stonetypes[j];
        }
        ore = new Ore(blockPos,stone);
        ores.push(ore);
      }
      positionalData.push({
        position:[pos[0]-center[0],pos[1]-center[1],pos[2]-center[2]],
        size:[BRICK_SIZE,BRICK_SIZE,BRICK_SIZE],
        color:ore.type.color,
        material_index:ore.type.material
      })
    }

    const publicUser = {
      id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      name: 'Generator',
    };
  
    const save:WriteSaveObject = {
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
      let namestring: string="";
      for(let k of positionalData){
          namestring+=k.position[0]+"_"+k.position[1]+"_"+k.position[2]+"_"+k.color+"--"
      }
      if(Omegga.getSaves["block"+namestring]===null||Omegga.getSaves["block"+namestring]===undefined)
      Omegga.writeSaveData("block"+namestring,save);
      Omegga.loadBricks("block"+namestring, {quiet: true, offX:center[0],offY:center[1],offZ:center[2]});
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
    if(x/CHUNK_SIZE==chunk.x){
      if(y/CHUNK_SIZE==chunk.y){
        if(z/CHUNK_SIZE==chunk.z){
          return chunk;
        }
      }
    }
  }
  let c = new Chunk(x/CHUNK_SIZE,y/CHUNK_SIZE,z/CHUNK_SIZE);
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