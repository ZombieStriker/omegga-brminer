import Ore from "./ore";

export class Chunk{
    x: number
    y: number
    z: number
    spots: boolean[][][]= [];
    ores: Ore[]=[];
    lastmined: number=0;

    constructor(x:number,y:number,z:number){
        this.x=x;
        this.y=y;
        this.z=z;
    }
    getSpot(x:number,y:number,z:number){
        if(!this.spots)
            this.spots=[];
        if(!this.spots[x])
            this.spots[x]=[]
        if(!this.spots[x][y])
            this.spots[x][y]=[];
        if(!this.spots[x][y][z])
           this.spots[x][y][z]=false;
    return this.spots[x][y][z];
    }
}