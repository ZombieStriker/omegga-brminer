export class PlayerStats{
    name: string;
    level: number;
    bank: number;
    cooldown: number;
    lavasuit: number;
    blocksmined: number;
    lowestY: number;

    constructor(name: string, level: number, bank: number, lavasuit: number, lowestY: number, blocksmined: number ){
        this.name=name;
        this.level=level;
        this.bank=bank;
        this.cooldown = 0;
        this.lavasuit=lavasuit;
        if(blocksmined===undefined)
        blocksmined=0;
        if(lowestY===undefined)
        lowestY=0;
        this.blocksmined=blocksmined;
        this.lowestY=lowestY;
    }
    

}