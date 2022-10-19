import OmeggaPlugin, { OL, PS, PC, Vector, Brick, WriteSaveObject } from 'omegga';
import OreType from './oretype'

export default class Ore{
    location: Vector
    durability: number
    type: OreType

    constructor(location: Vector, type: OreType){
        this.location = location;
        this.type = type;
        this.durability= type.durability;
    }
    public setType(type: OreType){
        this.type = type;
    }
    public setDurability(durability: number){
        this.durability = durability;
    }
    public getDurability(){
        return this.durability;
    }
}