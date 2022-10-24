export class PlayerStats{
    name: string;
    level: number=1;
    bank: number=0;
    cooldown: number=0;
    cooldown_mining:number=0;
    lavasuit: number=0;
    blocksmined: number=0;
    lowestY: number=0;

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