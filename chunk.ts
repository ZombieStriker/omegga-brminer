export class Chunk{
    x: number
    y: number
    z: number
    spots: string[]= [];

    constructor(x:number,y:number,z:number){
        this.x=x;
        this.y=y;
        this.z=z;
    }
}