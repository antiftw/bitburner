import {ServerManager } from '/src/manager/ServerManager'
import { ExtendedBotnetServer } from '/src/entity/server/ExtendedBotnetServer';
import { Exception } from '/src/entity/Exception';
import { Logger } from '/src/tools/Logger'

export class BotnetManager extends ServerManager {

    constructor(ns, verbose = false, context = 'BOTNET'){
        super(ns, verbose, context);
        this.context = context
        this.allowedRamAmounts = [];
        this.logger = new Logger(ns, verbose, this.context);
        this.maxAllowedAmountOfRam = 1024 * 1024;
    }
    loadData() {

        this.loadConfig();
        this.budgetFile = this.config.budgets.botnet_file;
        this.dataFile = this.config.botnet.data_file;

        this.initializeServers();
        this.loadBudget();
        this.logger.log(`index for 19: ${this.servers.indexOf(srv => srv.name === 'srv19.antiftw.nl')}`)
    }

    initializeServers(){
        try{
            let servers = [];
            let serverData = this.file.readJson(this.dataFile);
            serverData.forEach(srv => {
                let server = new ExtendedBotnetServer(this.ns, srv.name, 'home');
                server.update({
                    maxRam: srv.maxRam,
                    maxMoney: srv.maxMoney,
                    rootAccess: srv.rootAccess,
                    usedRam: srv.usedRam,
                    money: srv.money,
                });
                servers.push(server);
            })
            this.servers = servers;
        }catch(e) {
            this.eh.handle(e, 'INISRV')
        }
    }
    
    /**
     * Determine the phase we are in, influencing the choice of our optimal action
     */
    determinePhase(){
       try{
            // Since the maximum amount of servers increases over time, phase can go back to 0
            this.logger.log(`Determining phase:`)
            this.logger.log(`- maxServersReached: ${this.maxServersReached()}`)
            this.logger.log(`- allServersUpgraded: ${this.allServersUpgraded()}`)
            if(!this.maxServersReached()) {
                // Still allowed to buy new servers
                this.phase = 0;
            }else if (this.maxServersReached() && !this.allServersUpgraded()){
                // Not allowed to buy servers, but still able to upgrade
                this.phase = 1;
            }else if(this.maxServersReached() && this.allServersUpgraded()){
                // All servers fully upgraded
                this.phase = 2;
            }
            this.logger.log(`Phase determined: [ ${this.phase} ]`)
       }catch(e) {
           this.ns.trpint(e)
       }
    }

    /**
     * Determine the optimal action depending on the phase and prices of different actions
     * @returns {object} action {name, price, node}
     */
    determineOptimalAction(){
        // Our main tactic is to buy new ones if we can and its cheapest, and upgrade RAM otherwise
        // todo: optimize tactic
        let action = {};
        let cheapestUpgrade = this.findCheapestNodeToUpgrade();
        let priceForUpgrade = Infinity;
        if(cheapestUpgrade.node !== null) {
            priceForUpgrade = cheapestUpgrade.price;
            this.logger.log(`Cheapest node to upgrade => name: ${cheapestUpgrade.node.name}, price: [ ${priceForUpgrade.toFixed(0)} ]`)
        }

        if(this.phase === 0 ){
            let priceForNewNode = this.getPurchasedServerCost(this.config.botnet.min_ram_amount);
            this.logger.log(`priceForNewNode (${priceForNewNode.toLocaleString('en')}) ${priceForNewNode > priceForUpgrade ? '>' : '<'} priceforUpgrade (${priceForUpgrade.toLocaleString('en')})`)
            if(priceForNewNode < priceForUpgrade) {
                 // buy new node
                action = this.formatAction('buy-new', priceForNewNode);
            }else{
                // upgrade ram
                action = this.formatAction('upgrade-ram', priceForUpgrade, cheapestUpgrade.node);
            }
        }else if(this.phase === 1) {
            // upgrade ram
            action = this.formatAction('upgrade-ram', priceForUpgrade, cheapestUpgrade.node);
        }else if(this.phase === 2) {
            // nothing to do
            action = this.formatAction('wait', 0);
        }
        this.logger.log(`Action determined: ${action.name}, price: ${action.price}`)
        return action;
    }

    /**
     * Perform the determined action
     * @param {object} action The action to be performed: {name, price, node}
     * @returns success
     */
    performAction(action) {
        this.logger.log(`action.name: ${action.name}, is_null(action.node): ${action.node === null}`)
        if(action.name === 'upgrade-ram' && action.node === null){
            throw new Exception('Cannot upgrade when node is null.');
        }

        this.logger.log(`${JSON.stringify(action)}`)
        switch(action.name) {
            case 'buy-new':
                // new id = length of current array
                let newId = this.servers.length;
                this.logger.log(`new id: ${newId}`)
                let name = this.config.botnet.name_template.replace('[id]', newId);
                this.logger.log(`name: ${name}`)
                let buyResult = this.buyNode(name, this.config.botnet.min_ram_amount);
                this.logger.log(`Buyresult: ${buyResult.success}`)
                this.logger.log(buyResult.message)
                return buyResult;
            case 'upgrade-ram':
                this.logger.log(`cur ram: ${action.node.maxRam}, multiplier: ${this.config.botnet.max_ram_multiplier}`)
                let upgradeResult = this.upgradeNode(action.node.name, action.node.maxRam * this.config.botnet.max_ram_multiplier);
                this.logger.log(`${upgradeResult.message}`)
                return upgradeResult;
            case 'wait':
                this.enabled = false;
                break;
        }
    }
    /**
     * Finds the cheapest node (the one with the least amount of ram) to upgrade
     * @returns {object} Cheapest node {ExtendedBotnetServer} to upgrade, including price for that upgrade
     */
    findCheapestNodeToUpgrade(){
        let leastRam = this.maxAllowedAmountOfRam;
        this.logger.log(`Finding cheapest node to upgrade`)
        if(this.servers.length === 0) {
            return {
                node: null,
                price: this.getPurchasedServerCost(this.maxAllowedAmountOfRam)
            }
        }
        let sortedServers = this.servers.sort((a, b) => {
            return a.maxRam - b.maxRam;
        });
        let nodeToUpgrade = sortedServers[0];
        leastRam = nodeToUpgrade.maxRam;

        this.logger.log(`Least RAM: ${leastRam}, servername: ${nodeToUpgrade.name}`)
        
        let newRam = this.config.botnet.max_ram_multiplier * leastRam;
        if(newRam >= this.maxAllowedAmountOfRam) {
            newRam = this.maxAllowedAmountOfRam;
        }
        let price = this.getPurchasedServerCost(newRam)
        this.logger.log(`Price to upgrade node to ${newRam} GB RAM: ${price.toLocaleString('en')}`)

        return {
            node: nodeToUpgrade,
            price: price
        };
    }

    /**
     * Upgrades a single node, which is actually the deletion & re-creation of that node
     * @param {string} serverName The name of the server to 'upgrade'
     * @param {int} ram : The (total) amount we are 'upgrading' the server to in GB
     */
    upgradeNode(serverName, ram){
        try{
            this.logger.log(`Attempting to upgrade node ${serverName} to ${ram} GB RAM`);
            let server = this.findByName(serverName);
            if(typeof server === 'undefined'){
                throw new Exception(`Node with name ${serverName} not found.`);
            }
            this.logger.log(`Located ${server.name}: current ram: ${server.maxRam}`);
            // since we cannot actually upgrade a node, we need to delete it
            let deleteResult = this.deleteServer(serverName);
            this.logger.log(`${deleteResult.message}`)
            if (deleteResult.success) {
                // and create a new one with the same name and the "upgraded" amount of RAM
                let buyResult = this.buyNode(serverName, ram);
                if(buyResult.success){
                    this.logger.log(buyResult.message);
                    return {
                        success: true,
                        message: `Successfully upgraded node ${buyResult.node.name}`,
                        node: buyResult.node
                    };
                }
            }
            return {
                success: false,
                message: `Error deleting node ${serverName}`,
                node: null
            };
        }catch(e) {
            let exception = this.eh.handle(e, 'BOTUPG');
            return {
                success: false,
                message: `Error upgrading node: ${exception}`,
                node: null
            };
        }
    }

    /**
     * @param {string} hostname Hostname of the new node
     * @param {int} ram Amount of RAM for the new node
     * @returns {bool} success
     */
    buyNode(hostname, ram){
        this.logger.log(`Attempting to buy node ${hostname}, with ${ram} GB RAM`)
        try{
            if(this.serverExists(hostname)){
                throw new Exception(`Failed to buy BotnetServer [ ${hostname} ], bot with that name already exists`)
            }
            if(!this.ramAmountAllowed(ram)){
                throw new Exception('RAM amount can only be a power of 2 and > 0');
            }
            if(this.maxServersReached()) {
                throw new Exception(`Maximum allowed Botnet size reached: ${currentSize} ' / ' ${allowedSize}`);
            }
            this.logger.log(`No Exceptions triggered: proceeding...`)
            let purchaseResult = this.ns.purchaseServer(hostname, ram);

            if(purchaseResult === '') {
                throw new Exception(`Something went wrong purchasing a new BotnetServer with name ${hostname}`)
            }else{
                let server = new ExtendedBotnetServer(this.ns, purchaseResult);
                this.logger.log(`Updating local datastructure, old length: ${this.servers.length}`)
                server.update({
                    maxRam: ram,
                    maxMoney: 0,
                    rootAccess: true,
                    usedRam: 0,
                    money: 0,
                })
                let len = this.servers.push(server);
                this.logger.log(`Local datastructure updated, new length: ${len}`)
                // fetch to see if it worked
                let newServer = this.servers[this.servers.length -1];

                return {
                    success: true,
                    message: `Succesfully bought new node ${newServer.name} with ${newServer.maxRam} GB RAM`,
                    node: newServer
                };
            }
        }catch(e) {
            let exception = this.eh.handle(e);
            return {
                success: false,
                message: `Error buying node: ${exception}`,
                node: server
            };
        }
    }
    /**
     * Check if we have reached the maximum amount of servers
     * @returns {bool}
     */
    maxServersReached(){
        let allowedSize = this.getPurchasedServerLimit();
        let currentSize = this.servers.length;
        this.logger.log(`current size: ${currentSize}, max size: ${allowedSize}`)
        if(currentSize < allowedSize) {
           return false;
        }
        return true;
    }
    /**
     * Check if all servers are upgraded (have max ram)
     * @returns {bool} 
     */
    allServersUpgraded(){
       try{
            let maxRam = this.ns.getPurchasedServerMaxRam();
            let server = this.servers.find(srv => srv.maxRam < maxRam);
            if(typeof server === 'undefined') {
                return true;
            }
            return false;
       }catch(e) {
          this.eh.handle(e);
       }
    }
    /**
     * Check whether a given amount of RAM is allowed for buying a Botnet server
     * @param {int} ram The amount of ram to check
     * @returns Whether the amount is allowed (is a power of two and not equal to 0)
     */
    ramAmountAllowed(ram){
        // Thanks to https://graphics.stanford.edu/~seander/bithacks.html#DetermineIfPowerOf2
        // Power of 2 && > 0
        if((ram && !(ram & (ram - 1)))){
            return true;
        }
        return false;
    }

    /**
     * Wrapper for the NS PurchaseServer function (Buy a new "purchased" server)
     * @param {string} hostname the name of the new server
     * @param {int} ram the amount of RAM for the new server
     * @returns the name of the new server if success, or am empty string when failed
     */
    purchaseServer(hostname, ram){
        return this.ns.PurchaseServer(hostname, ram);
    }
    /**
     * Delete a purchased servers and update local datastructure to new situation
     * @param {string} hostname the name of the serer to be deleted
     * @returns {obj} = {success, message}
     */
    deleteServer(hostname){
        try{
            this.logger.log(`Pre-deletion check for existance: exists = ${this.serverExists(hostname)}`)
            if(this.serverExists(hostname)){
                
                this.logger.log(`Pre deletion check for running scripts: [ ${hostname} ]`)
                let runningScripts = this.ps(hostname);
                // Kill all scripts, else ns.deleteServer() will fail
                if(runningScripts.length > 0 ) {
                    this.logger.log(`Killing all scripts (${runningScripts.length}) on server: [ ${hostname} ]`)
                    let killResult = this.ns.killall(hostname);
                    if(killResult) {
                        this.logger.log(`Successfully killed all scripts on server [ ${hostname} ]`)
                    }
                }else {
                    this.logger.log(`No scripts running on server [ ${hostname} ]`)
                }
                this.logger.log(`Deleting server: [ ${hostname} ]`)
                let deleteResult = this.ns.deleteServer(hostname);
                if(!deleteResult) {
                    throw new Exception(`Failed deleting server [ ${hostname} ] `);
                }
                // Remove element from out local datastructure
                this.logger.log(`Removing ${hostname} from local datastructure, old length: ${this.servers.length}`)
                let indexToDeleteNode = this.servers.findIndex(srv => srv.name === hostname);
                this.logger.log(`to delete: [ ${indexToDeleteNode} ]`)
                this.servers.splice(indexToDeleteNode, 1);
                this.logger.log(`Removed ${hostname} from local datastructure, new length: ${this.servers.length}`)
                return {
                    success: deleteResult,
                    message: `Successfully deleted server ${hostname}`
                }
            }
        }catch(e) {
            let exception = this.eh.handle(e, 'DELSRV');
            return {
                success: false,
                message: exception
            }
        }
    }
    /**
     * Search a server in the local datastructure
     * @param {string} name the servername to search
     * @returns {ExtendedBotnetServer} the server
     */
    findByName(name){
        return this.servers.find(srv => srv.name === name)
    }
    /**
     * Get the max amount of servers
     * @returns {int} amount
     */
    getPurchasedServerLimit(){
        return this.ns.getPurchasedServerLimit();
    }
    /**
     * Check how much a new server costs with a specified amount of RAM
     * @param {int} ram amount of RAM
     * @returns {float} cost
     */
    getPurchasedServerCost(ram) {
        return this.ns.getPurchasedServerCost(ram);
    }
    /**
     * Check how much RAM a "purchased" server can maximally get
     * @returns {int} amount
     */
    getPurchasedServerMaxRam(){
        return this.ns.getPurchasedServerMaxRam();
    }
    /**
     * Get a list of all "purchased" servers
     * @returns {[string]} currently purchased servers
     */
    getPurchasedServers(){
        return this.ns.getPurchasedServers();
    }
}