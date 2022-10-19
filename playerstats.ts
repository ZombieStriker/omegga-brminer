export class PlayerStats{
    name: string;
    level: number;
    bank: number;
    cooldown: number;
    lavasuit: number;

    constructor(name: string, level: number, bank: number, lavasuit: number){
        this.name=name;
        this.level=level;
        this.bank=bank;
        this.cooldown = 0;
        this.lavasuit=lavasuit;
    }
    

}