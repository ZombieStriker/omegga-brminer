import OmeggaPlugin, { OL, PS, PC, Vector, Brick, WriteSaveObject } from 'omegga';


export default class Ore{
    durability: number
    name: string
    price: number

    constructor(durability: number, name: string, price: number){
        this.durability = durability;
        this.name = name;
        this.price = price;
    }
    public setDurability(durability: number){
        this.durability = durability;
    }

    public setPrice(price: number){
        this.price = price;
    }
}