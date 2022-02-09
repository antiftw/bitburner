import { PublicServer } from "/src/entity/server/PublicServer.js";
import { Exception } from '/src/entity/Exception';
/**
 * Complete Public server class, contains all relevant functionality
 */
export class ExtendedPublicServer extends PublicServer {
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
            case 'portsRequired':
                return this.ns.getServerNumPortsRequired(this.name);
            case 'requiredHackingLevel':
                return this.ns.getServerRequiredHackingLevel(this.name);
            default:
                throw new Exception(`Property name ${property} does not exist.`)
        }
    }

    actualize() {
        this.money = this.fetch('money');
        this.maxMoney = this.fetch('maxMoney');
        this.usedRam = this.fetch('usedRam');
        this.maxRam = this.fetch('maxRam');
        this.rootAccess = this.fetch('rootAccess');
        this.security = this.fetch('security');
        this.minSecurity = this.fetch('minSecurity');
        this.portsRequired = this.fetch('portsRequired');
        this.requiredHackingLevel = this.fetch('requiredHackingLevel');
    }
    async nuke(){
        await this.ns.nuke(this.name);
    }
    async bruteSsh(){
        await this.ns.brutessh(this.name);
    }
    async ftpCrack() {
        await this.ns.ftpcrack(this.name);
    }
    async relaySmtp(){
        await this.ns.relaysmtp(this.name);
    }
    async httpWorm(){
        await this.ns.httpworm(this.name);
    }
    async sqlInject(){
        await this.ns.sqlinject(this.name);
    }
}