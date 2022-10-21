import Ore from "./ore";

export class Chunk{
    x: number
    y: number
    z: number
    spots: string[]= [];
    ores: Ore[]=[];

    constructor(x:number,y:number,z:number){
        this.x=x;
        this.y=y;
        this.z=z;
    }
}