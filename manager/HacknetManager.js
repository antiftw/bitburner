/** @param {NS} ns **/
import { ExtendedHacknetServer } from '/src/entity/server/ExtendedHacknetServer';
import { Exception } from '/src/entity/Exception'
import { ServerManager } from '/src/manager/ServerManager';
import { Logger } from '/src/tools/Logger'

export class HacknetManager extends ServerManager {
    constructor(ns, verbose = false, context = 'HCKNET'){
        super(ns, verbose, context);
        this.context = context;
        this.ramAmount;
        this.cpuAmount;
        this.lvlAmount;
        this.loopCounter = 1;
        this.logger = new Logger(ns, verbose, this.context);
        this.loadData();
    }

    /**
     * @inheritdoc
     */
    loadData() {
        this.loadConfig();
        this.sleepDuration = this.config.process.processes.hacknetManager.param.sleepDuration;
        this.ramAmount = this.config.hacknet.min_ram_amount;
        this.cpuAmount = this.config.hacknet.min_cpu_amount;
        this.lvlAmount = this.config.hacknet.min_lvl_amount;
        this.budgetFile = this.config.budgets.hacknet_file;
        this.dataFile = this.config.hacknet.data_file;
        this.initializeServers();
        this.loadBudget();
        this.calculateLoopCounter();
    }

    /**
     * @inheritdoc
     */
    initializeServers(){
        let servers = [];
        let serverData = this.file.readJson(this.dataFile);
        serverData.forEach(srv => {
            let server = new ExtendedHacknetServer(this.ns, srv.name);
            server.update({
                level: srv.level,
                maxRam: srv.ram,
                cores: srv.cores,
                isServer: srv.isServer,
                production: srv.production,
                totalProduction: srv.totalProduction,
                timeOnline: srv.timeOnline,
                cache: srv.cache,
                hashCapacity: srv.hashCapacity,
            });
            servers.push(server);
        })
        this.servers = servers;
    }

    /**
     * @inheritdoc
     */
    determineOptimalAction() {
        let action = {}
        let priceForNewNode = this.getPurchaseNodeCost();
        this.logger.log(`Price for new node: ${priceForNewNode.toFixed(0)}`)

        if(this.phase === 0 ){
            // Buy the first node, and switch to second phase
            action = this.formatAction('buy-new', priceForNewNode);
        }else if(this.phase === 1) {
            // In this phase we only buy new servers or upgrade the level of an existing one, whichever cheapest
            let cheapestNode = this.nodeToUpgrade('level');
            let levelPrice = cheapestNode.getLevelUpgradeCost(this.lvlAmount);
            this.logger.log(`Cheapest node to upgrade: ${cheapestNode.name}. Price: ${levelPrice}`)
            if (priceForNewNode < levelPrice) {
                action = this.formatAction('buy-new', priceForNewNode, null);
            } else {
                action = this.formatAction('upgrade-level', levelPrice, cheapestNode);
            }
        }else if(this.phase === 2) {
            let cheapestRamNode = this.nodeToUpgrade('ram');
            let cheapestCoreNode = this.nodeToUpgrade('core');
            let ramPrice = cheapestRamNode.getRamUpgradeCost(this.ramAmount);
            let corePrice = cheapestCoreNode.getCoreUpgradeCost(this.cpuAmount);
            this.logger.log(`Price to upgrade ram: ${ramPrice}`)
            this.logger.log(`Price to upgrade core: ${corePrice}`)
            if(ramPrice < corePrice){
                action = this.formatAction('upgrade-ram', ramPrice, cheapestRamNode);
            }else{
                action = this.formatAction('upgrade-core', corePrice, cheapestCoreNode);
            }
        }
        if (action === undefined) {
            throw new Exception(`Error determining action, phase: ${this.phase}, `)
        }
        this.priceOfLastAction = action.price;
        return action;
    }

    /**
     * @inheritdoc
     */
    performAction(action) {
        this.logger.log(`Performing action: '${action.name}'`)
        this.logger.log(JSON.stringify(action))
        switch(action.name) {
            case 'buy-new':
                let node = this.expandNodeSwarm();
                this.logger.log(`Swarm expanded. New node: '${node.name}'`)
                break;
            case 'upgrade-level':
                this.logger.log(`Upgrading node '${action.node.name}' with [ ${this.lvlAmount} ] level(s)`)
                action.node.upgradeLevel(this.lvlAmount);
                this.logger.log(`Swarm upgraded: Level for node '${action.node.name}' to level [ ${action.node.fetch('level')} ] `)
                break;
            case 'upgrade-ram':
                this.logger.log(`Upgrading node '${action.node.name}' with [ ${this.ramAmount} ] GB RAM`)
                action.node.upgradeRam(this.ramAmount);
                this.logger.log(`Swarm upgraded: Ram for node '${action.node.name}' to [ ${action.node.fetch('ram')} ] GB RAM `)
                break;
            case 'upgrade-core':
                this.logger.log(`Upgrading node '${action.node.name}' with [ ${this.cpuAmount} ] CPU Cores`)
                action.node.upgradeCore(this.cpuAmount);
                this.logger.log(`Swarm upgraded: Core for node '${action.node.name}' to [ ${action.node.fetch('cores')} ] CORES `)
                break;
        }
    }

    /**
     * @inheritdoc
     */
    determinePhase(){
        this.logger.log(`Determining phase`)
        this.logger.log(`Server amount: [ ${this.servers.length} ] ; LoopCounter ${this.loopCounter} `)
        this.logger.log(`${this.servers.length} <= ${(12 * this.loopCounter)} : ${this.servers.length <= (12 * this.loopCounter)}`)
        if(this.servers.length == 0) {
            // Beginning, we dont have any Nodes yet
            this.phase = 0;
        }else if (this.servers.length <= (12 * this.loopCounter) && !this.allNodesUpgraded('level')){
            // First Node bought, start looping
            // Only Buy new nodes + extra levels
            this.phase = 1;
        }else if(!this.allNodesUpgraded()){
            // If not all Nodes fully upgraded
            // Buy more Ram + Cores
            this.phase = 2;
        }else if (this.allNodesUpgraded()){
            // When we have upgraded all nodes, recalculate the loop counter, and switch to phase 0, to buy a new server
            this.calculateLoopCounter();
            this.phase = 0;
        }
        this.logger.log(`Phase determined: [ ${this.phase} ]`)
    }

    /**
     * Expands our swarm of hacknet nodes by buying a new one
     */
    expandNodeSwarm(){
        try{
            let nodeId = this.purchaseNode();
            let node = new ExtendedHacknetServer(this.ns, 'hacknet-node-' + nodeId);
            this.servers.push(node);
            return node;
        }catch(exception){
            throw new Exception(exception);
        }
    }

    /**
     * Find the optimal Hacknetnode to upgrade given the type of upgrade we want to perform
     * @param {string} type of upgrade we want to perform
     * @returns {ExtendedHacknetServer} optimal node to upgrade
     */
    nodeToUpgrade(type){
        this.logger.log(`Calculating optimal node to upgrade with regard to ${type}`)
        this.servers.sort((a, b) => {
            if(type === 'level'){
                return parseFloat(a.getLevelUpgradeCost(this.lvlAmount)) - parseFloat(b.getLevelUpgradeCost(this.lvlAmount));
            }else if(type === 'ram'){
                return parseFloat(a.getRamUpgradeCost(this.ramAmount)) - parseFloat(b.getRamUpgradeCost(this.ramAmount));
            }else if(type === 'core') {
                return parseFloat(a.getCoreUpgradeCost(this.cpuAmount)) - parseFloat(b.getCoreUpgradeCost(this.cpuAmount));
            }
        });

        return this.servers[0];
    }

    /**
     * Check if all nodes are upgraded given which part we want to check
     * @param {string} option which checks we want to perform ['all', 'level', 'ram', 'core']
     * @returns {bool}
     */
    allNodesUpgraded(option = 'all'){
        for(let index = 0; index < this.servers.length; index++){

            // walk through all nodes
            let node = this.servers[index];
            if(option === 'all' && (!node.isMaxed())){
                // check if either ram, cores or level are not fully upgraded
                return false;
            }else if (option === 'level' && !node.isMaxed('level')){
                // Just level
                return false;
            }else if (option === 'ram' && !node.isMaxed('ram')){
                // Just ram
                return false;
            }else if (option === 'core' && !node.isMaxed('core')){
                // Just cores
                return false;
            }
        }
        return true;
    }

    /**
     * Calculate how far we are in expanding our Hacknet network, influences the optimal actions chosen to perform
     */
    calculateLoopCounter() {
        let serverAmount = this.servers.length;
        if(serverAmount > 12) {
            this.loopCounter = Math.round((this.servers.length / 12) + 0.5);
        }else {
            this.loopCounter = 1;
        }
    }

    /** Some wrappers for hacknet functions */
    getHashUpgradeLevel(upgName){
        return this.ns.hacknet.getHashUpgradeLevel(upgName);
    }
    getHashUpgrades(){
        return this.ns.hacknet.getHashUpgrades();
    }
    getPurchaseNodeCost(){
        return this.ns.hacknet.getPurchaseNodeCost();
    }
    getStudyMult(){
        return this.ns.hacknet.getStudyMult();
    }
    getTrainingMult(){
        return this.ns.hacknet.getTrainingMult();
    }
    hashCapacity(){
        return this.ns.hacknet.hashCapacity();
    }
    hashCost(upgName){
        return this.ns.hacknet.hashCost(upgName);
    }
    maxNumNodes(){
        return this.ns.hacknet.maxNumNodes();
    }
    numHashes(){
        return this.ns.hacknet.numHashes();
    }
    numNodes(){
        return this.ns.hacknet.numNodes();
    }
    purchaseNode(){
        return this.ns.hacknet.purchaseNode();
    }
    spendHashes(upgName, upgTarget){
        return this.ns.hacknet.spendHashes(upgName, upgTarget);
    }
}