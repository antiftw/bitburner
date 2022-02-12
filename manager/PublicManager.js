import { ExtendedPublicServer } from '/src/entity/server/ExtendedPublicServer';
import { ServerManager } from '/src/manager/ServerManager'
import { Infector } from '/src/hacking/Infector'

/**
 * Class that handles the expansion of our infected part of the public network
 */
export class PublicManager extends ServerManager{
    constructor(ns, verbose = false, context = 'PUBLIC'){
        super(ns, verbose, context);
        this.infector = new Infector(ns, verbose);
        this.maxPortsHackable = 0;
    }

    /**
     * @inheritdoc
     */
    loadData(enabled = true) {
        this.loadConfig();
        this.dataFile = this.config.public.data_file;
        this.initializeServers();
        this.calculateNukablePortsMax();
        this.enabled = enabled;
    }

    /**
     * @inheritdoc
     */
    initializeServers() {
        let serverData = this.file.readJson(this.dataFile);
        serverData.forEach(server => {
            let srv = new ExtendedPublicServer(this.ns, server.name, server.source);
            srv.update({
                maxRam: server.maxRam,
                maxMoney: server.maxMoney,
                rootAccess: server.rootAccess,
                usedRam: server.usedRam,
                money: server.money,
                portsRequired: server.portsRequired,
                requiredHackingLevel: server.requiredHackingLevel,
                security: server.security,
                minSecurity: server.minSecurity,
            })
            this.servers.push(srv);
        })
    }

    /**
     * @inheritdoc
     */
    determineOptimalAction() {
        let action = {}
        if(this.phase === 0) {
            action = this.formatAction('infect', 0);
        }
        else if(this.phase === 1) {
            action = this.formatAction('wait', 0)
        }
        return action;
    }

    /**
     * @inheritdoc
     */
    performAction(action) {
        let result = {};
        switch(action.name) {
            case 'infect':
                let servers = this.rootableServers(false);
                this.infectServers(servers);
                result = {
                    success: true,
                    message: `Infected servers (${servers.length})`
                }
                break;
            case 'wait':
            default:
                this.enabled = false;
                result =  {
                    success: true,
                    message: 'No new servers to infect, hybernating'
                }
        }
        return result;
    }

    /**
     * @inheritdoc
     */
    determinePhase(){
        let rootableServers = this.rootableServers(false);
        let rootedServers = this.rootableServers();
        this.logger.log(`Rooted/Rootable servers: ${rootedServers.length} / ${rootableServers.length}`)
        if(rootableServers.length > rootedServers.length) {
            // There still are servers that can be rooted
            this.phase = 0;
        }else {
            this.phase = 1;
        }
        this.logger.log(`Phase determined: ${this.phase}`)
    }

    /**
     * Check which servers are rootable
     * @param {bool} rooted: Whether we also want servers that have already been rooted
     * @returns an array of servers
     */
    rootableServers(rooted = true){
        let servers =  this.servers.filter(srv => this.isRootable(srv))
        if(rooted) {
            return servers.filter(srv => srv.rootAccess === true);
        }
        return servers;
    }

    /**
     * Check if a certain server is rootable (meaning we have enough exe's to open all ports)
     * @param {ExtendedPublicServer} server the server to check
     * @returns {bool}
     */
    isRootable(server) {
        let ports = server.portsRequired;
        if(ports > this.maxPortsHackable) {
            return false;
        }
        return true;
    }

    /**
     * Caclulate how many ports we can open
     * @param {bool} reload whether we wish to recaculate of just read from cache
     * @returns the max amount of servers we can open currently
     */
    calculateNukablePortsMax(reload = true){
        if(!reload && this.maxPortsHackable !== 0) {
            return this.maxPortsHackable;
        }
        let amount = 0 ;
        if(this.file.fileExists('BruteSSH.exe')){
            amount++;
        }
        if(this.file.fileExists('FTPCrack.exe')){
            amount++;
        }
        if(this.file.fileExists('relaySMTP.exe')){
            amount++;
        }
        if(this.file.fileExists('HTTPWorm.exe')){
            amount++;
        }
        if(this.file.fileExists('SQLInject.exe')){
            amount++;
        }
        this.maxPortsHackable = amount;
        return this.maxPortsHackable;
    }

    /**
     * Infect an array of servers
     * @param {array} servers to be infected
     */
    infectServers(servers) {
        servers.forEach(srv => {
            this.infect(srv);
        })
        if(servers.length > 0) {
            this.logger.notify(`Run complete: ${servers.length} servers infected.`);
            this.enabled = false;
        }
    }
    
    /**
     * Infect a server
     * @param {Server} server to be infected
     */
    infect(server){
        try{
            let result = this.infector.infect(server);
            if(result.success) {
                // Update our local datastructure, else we will get stuck in an infinite loop
                for(let index = 0; index < this.servers.length; index++) {
                    let srv = this.servers[index];
                    if(srv.name === server.name) {
                        this.servers[index].rootAccess = true;
                        break;
                    }
                }
            }
            this.logger.log(result.message);
        }catch(e){
            this.eh.handle(e, 'INFECT');
        }
    }

}