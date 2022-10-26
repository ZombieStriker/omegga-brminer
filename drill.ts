import { Vector } from "omegga";

export default class Drill{
    position:Vector;
    range:number;
    mined:number=0;
    player:string;
    direction:Directions;
    playerlevel:number;

    constructor(position:Vector,range:number,player:string,direction:Directions,playerlevel:number){
        this.player=player;
        this.position=position;
        this.range =range;
        this.direction=direction;
        this.playerlevel=playerlevel;
    }
}

export declare type Directions = "up"|"down"|"north"|"south"|"east"|"west";