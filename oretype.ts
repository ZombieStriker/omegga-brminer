export default class Ore{
    durability: number
    name: string
    price: number
    maxY: number
    minY: number
    color: number=0
    material: number

    constructor(durability: number, name: string, price: number, miny: number, maxy: number, color: number, material: number){
        this.durability = durability;
        this.name = name;
        this.price = price;
        this.minY=miny;
        this.maxY=maxy;
        this.color = color;
        this.material = material;
        if(color===null)
        color=0;
    }
    public setDurability(durability: number){
        this.durability = durability;
    }
    public getDurability(){
        return this.durability;
    }


    public setPrice(price: number){
        this.price = price;
    }
}

export class PlayerOre extends Ore{
    owner: string;

    constructor(durability: number, name: string, price: number, miny: number, maxy: number, color: number, material: number, owner: string){
        super(durability,name,price,miny,maxy,color,material);
        this.owner = owner;
    }
}