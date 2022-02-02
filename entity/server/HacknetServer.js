import { Server } from "/src/entity/server/Server.js";
/**
 * Hacknet server class, contains means to update this specific server
 */
export class HacknetServer extends Server{
    constructor(ns, name){
        super(ns, name)
        // We need the id because getNodeStats wants an index/id instead of the actual name
        // so split the name 'hacknet-node-[id]' on the hyphens, and take the last part
        let parts = name.split('-');
        this.id = parts[2];

        // Can be either Node or Server
        this.isServer = false;
        this.production = 0;
        this.totalProduction = 0;
        this.timeOnline= 0;
        this.cache = 0;
        this.hashCapacity = 0;
        this.setAvailableStats();
    }
    
    update(values){
        this.level = values.level;
        this.maxRam = values.ram;
        this.cores = values.cores;
        this.isServer = values.isServer;
        this.production = values.production;
        this.totalProduction = values.totalProduction;
        this.timeOnline = values.timeOnline;
        this.cache = values.cache;
        this.hashCapacity = values.hashCapacity;
        this.setAvailableStats();
    }

    setAvailableStats(){
        this.availableStats = ['name', 'level', 'ram', 'cores', 'production', 'timeOnline', 'totalProduction'];
        if(this.isServer){
            this.availableStats.push(['cache', 'hashCapacity']);
        }
    }

    maxLevel() {
        return this.level === 200;
    }

    maxCores() {
        return this.cores === 16
    }
    maxRam() {
        return this.ram = 64;
    }
}