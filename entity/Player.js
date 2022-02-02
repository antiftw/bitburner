/**
 * Class to represent a player, so we can encapsulate some ns functionality
 * @notused
 */
export class Player{
    constructor(ns){
        this.ns = ns;
    }
    getHackingLevel(){
        return this.ns.getHackingLevel()
    }
    getHackingMultipliers(){
        return this.ns.getHackingMultipliers();
    }
    getHacknetMultipliers(){
        return this.ns.getHacknetMultipliers();
    }
}