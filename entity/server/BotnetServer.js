import { Server } from "/src/entity/server/Server.js";
/**
 * Botnet server class, contains means to update this specific server
 */
export class BotnetServer extends Server {
    constructor(ns, name, source){
        super(ns, name);
        this.source = source;

    }
    delete(){
        this.ns.deleteServer(this.name);
    }
    update(values) {
        this.maxRam = values.maxRam;
        this.maxMoney = values.maxMoney;
        this.rootAccess = values.rootAccess;
        this.usedRam = values.usedRam;
        this.money = values.money;
    }
}