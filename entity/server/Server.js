/**
 * Base class for all servers, contains basic datastructure
 */
/** @param {NS} ns **/
export class Server {

    constructor(ns, name){

        this.ns = ns;
        this.name = name;
        this.maxRam;
        this.maxMoney;

        this.rootAccess;
        this.usedRam;
        this.money;

    }
    update(values) {
        this.maxRam = values.maxRam;
        this.maxMoney = values.maxMoney;
        this.rootAccess = values.rootAccess;
        this.usedRam = values.usedRam;
        this.money = values.money;
    }
}