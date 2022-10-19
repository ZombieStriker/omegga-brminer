export class PlayerStats{
    name: string;
    level: number;
    bank: number;
    cooldown: number;

    constructor(name: string, level: number, bank: number){
        this.name=name;
        this.level=level;
        this.bank=bank;
        this.cooldown = 0;
    }
    

}