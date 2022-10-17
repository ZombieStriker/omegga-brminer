import OmeggaPlugin, { OL, PS, PC, Vector, Brick, WriteSaveObject } from 'omegga';
import OreType from './oretype'

export default class Ore{
    location: Vector
    durability: number
    type: OreType

    constructor(location: Vector, type: OreType){
        this.location = location;
        this.type = type;
    }
    public setType(type: OreType){
        this.type = type;
    }
    setDurability(durability: number){
        this.durability = durability;
    }
}