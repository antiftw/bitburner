import { Server } from "/src/entity/server/Server.js";
/**
 * Public server class, contains means to update this specific server
 */
export class PublicServer extends Server {
    constructor(ns, name, source){
        super(ns, name);
        this.source = source;
        this.portsRequired;
        this.requiredHackingLevel;
        this.security;
        this.minSecurity;
    }
    update(values) {
        this.maxRam = values.maxRam;
        this.maxMoney = values.maxMoney;
        this.rootAccess = values.rootAccess;
        this.usedRam = values.usedRam;
        this.money = values.money;
        this.portsRequired = values.portsRequired;
        this.requiredHackingLevel = values.requiredHackingLevel;
        this.security = values.security;
        this.minSecurity = values.minSecurity;
    }
}