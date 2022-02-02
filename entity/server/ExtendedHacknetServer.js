import { HacknetServer } from "/src/entity/server/HacknetServer.js";
/**
 * Complete Hacknet server class, contains all relevant functionality
 */
export class ExtendedHacknetServer extends HacknetServer {
    constructor(ns, name) {
        super(ns, name)
    }
    fetch(property){
        let stats = this.getNodeStats();
        switch(property) {
            case 'name':
                return stats.name;
            case 'level':
                return stats.level;
            case 'ram':
                return stats.ram;
            case 'cores':
                return stats.cores;
            case 'production':
                return stats.production;
            case 'timeOnline':
                return stats.timeOnline;
            case 'totalProduction':
                return stats.totalProduction;
            case 'cache':
                return stats.cache;
            case 'hashCapacity':
                return stats.hashCapacity;
            default:
                throw new Exception(`This stat is not available. Choose from [ ${this.availableStat} ]`)
        }
    }
    getCacheUpgradeCost(n){
        return this.ns.hacknet.getCacheUpgradeCost(this.id, n);
    }
    getCoreUpgradeCost(n){
        return this.ns.hacknet.getCoreUpgradeCost(this.id, n);
    }
    getLevelUpgradeCost(n){
        return this.ns.hacknet.getLevelUpgradeCost(this.id, n);
    }
    getRamUpgradeCost(n){
        return this.ns.hacknet.getRamUpgradeCost(this.id, n);
    }
    upgradeCache(n){
        return this.ns.hacknet.upgradeCache(this.id, n);
    }
    upgradeCore(n){
        let upgradeCoreResult = this.ns.hacknet.upgradeCore(this.id, n);
        if(upgradeCoreResult) {
            this.cores += n;
        }
        return upgradeCoreResult;
    }
    upgradeLevel(n){
        let upgradeLevelResult = this.ns.hacknet.upgradeLevel(this.id, n);
        if(upgradeLevelResult) {
            this.level += n;
        }
        return upgradeLevelResult;
    }
    upgradeRam(n){
        let upgradeRamResult = this.ns.hacknet.upgradeRam(this.id, n);
        if(upgradeRamResult) {
            this.maxRam += n;
        }
    }
    getNodeStats() {
        return this.ns.hacknet.getNodeStats(this.id);
    }
    isMaxed(option = 'all') {
        let maxLevel = this.fetch('level') === 200;
        let maxRam = this.fetch('ram') === 64;
        let maxCores = this.fetch('cores') === 16;

        switch(option) {
            case 'all':
            default:
                return maxLevel && maxRam && maxCores;
            case 'level':
                return maxLevel;
            case 'ram':
                return maxRam;
            case 'cores':
                return maxCores;
        }
    }
}