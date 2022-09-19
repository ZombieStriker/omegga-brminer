import OmeggaPlugin, { OL, PS, PC, Vector, Brick, WriteSaveObject } from 'omegga';

export default class Ore{
    location: Vector
    durability: number
    name: string

    constructor(location: Vector, durability: number, name: string){
        this.location = location;
        this.durability = durability;
        this.name = name;
    }
    public setDurability(durability: number){
        this.durability = durability;
    }
}