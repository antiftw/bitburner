import { BotnetServer } from "/src/entity/server/BotnetServer";
/**
 * Complete Botnet server class, contains all relevant functionality
 */
export class ExtendedBotnetServer extends BotnetServer {
    constructor(ns, name, source){
        super(ns, name, source);
    }
    fetch(property){
        switch(property) {
            case 'money':
                return this.ns.getServerMoneyAvailable(this.name);
            case 'maxMoney':
                return this.ns.getServerMaxMoney(this.name);
            case 'usedRam':
                return this.ns.getServerUsedRam(this.name);
            case 'maxRam':
                return this.ns.getServerMaxRam(this.name);
            case 'rootAccess':
                return this.ns.hasRootAccess(this.name);
            case 'security':
                return this.ns.getServerSecurityLevel(this.name);
            case 'minSecurity':
                return this.ns.getServerMinSecurityLevel(this.name);
            default:
                throw new Exception(`Property name ${property} does not exist.`)
        }
    }
}