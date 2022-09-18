import OmeggaPlugin, { OL, PS, PC, Vector, Brick, WriteSaveObject } from 'omegga';

type Config = { foo: string };
type Storage = { bar: string };

let spots: string[] = [];

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
    // Write your plugin!
    this.omegga.on('cmd:test', (speaker: string) => {
      this.omegga.broadcast(`Hello, ${speaker}!`);
    });
    
    this.omegga.on('interact',
      async ({ player, position, brick_name, message }) => {
        const block = await getDoorBrickFromInteract(position);





    // get door data from the brick position
      const doorData = (await Omegga.getSaveData({center: position,extent: block.brick.size})) as WriteSaveObject;

        this.clearBricks(position,block.brick.size,block.ownerId)

        let x1: string = "x"+(position[0]+40)+"y"+position[1]+"z"+position[2];
        if(spots.indexOf(x1)==-1){
          await Omegga.loadSaveData(doorData, { quiet: true,
          offX: 40});
          spots.push(x1);
        }
        let x2: string = "x"+(position[0]-40)+"y"+position[1]+"z"+position[2];
        if(spots.indexOf(x2)==-1){
          await Omegga.loadSaveData(doorData, { quiet: true,
          offX: -40});
          spots.push(x2);
        }
        let y1: string = "x"+(position[0])+"y"+(position[1]+40)+"z"+position[2];
        if(spots.indexOf(y1)==-1){
          await Omegga.loadSaveData(doorData, { quiet: true,
          offY: 40});
          spots.push(y1);
        }
        let y2: string = "x"+(position[0])+"y"+(position[1]-40)+"z"+position[2];
        if(spots.indexOf(y2)==-1){
          await Omegga.loadSaveData(doorData, { quiet: true,
          offY: -40});
          spots.push(y2);
        }
        let z1: string = "x"+(position[0])+"y"+(position[1])+"z"+(position[2]+40);
        if(spots.indexOf(z1)==-1){
          await Omegga.loadSaveData(doorData, { quiet: true,
          offZ: 40});
          spots.push(z1);
        }
        let z2: string = "x"+(position[0])+"y"+(position[1])+"z"+(position[2]-40);
        if(spots.indexOf(z2)==-1){
          await Omegga.loadSaveData(doorData, { quiet: true,
          offZ: -40});
          spots.push(z2);
        }

    });


    return { registeredCommands: ['test'] };
  }

  async stop() {

  }

  async clearBricks(center: Vector, extent: Vector, ownerId: String){
    // clear the old door bricks
    Omegga.writeln(
      `Bricks.ClearRegion ${center.join(' ')} ${extent.join(' ')} ${ownerId}`
    );
  }
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
