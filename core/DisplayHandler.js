import { ConfigurationHandler } from '/src/tools/ConfigurationHandler'
import { FileHandler } from '/src/tools/FileHandler'
import { Exception } from '/src/entity/Exception'
import { Logger } from '/src/tools/Logger';
/**
 * Handle the displaying of the network on the terminal
 */
export class DisplayHandler{
    constructor(ns, verbose) {
        this.ns = ns;
        this.verbose = verbose;
        this.public = [];
        this.botnet = [];
        this.hacknet = [];

        this.file = new FileHandler(ns, verbose);
        this.ch = new ConfigurationHandler(ns, verbose);
        this.logger = new Logger(ns, verbose, 'DISPLAY');
        this.config;
        this.initialized = false;
        this.scripts = [];
    }
    async loadConfig(){
        try{
            this.config = await this.ch.getConfig('main');
        }catch(e) {
            this.logger.log('Error reading configuration file: ' + e)
        }
    }
    /**
     * Show all the networks, or a part of it, depending on the arguments and options
     * @param {string} queryType ['all', 'network', 'server']
     * @param {string} query the actual query
     */
    async showNetwork(queryType = 'all', query = null){
        let showBotnet = false;
        let showPublic = false;
        let showHacknet = false;
        let showRootOnly = false;
        if(queryType === 'all') {
            showBotnet = true;
            showPublic = true;
            showHacknet = true;
            // We hide the non-rooted servers here to at least limit the list a bit, else it becomes too large
            showRootOnly = true;
        }else if (queryType === 'network') {
            // can be 1 network name ("botnet"), or several: "botnet, hacknet"
            if('botnet'.includes(query)) {
                showBotnet = true;
            }
            if ('hacknet'.includes(query)){
                showHacknet = true;
            }
            if ('public'.includes(query)){
                showPublic = true;
            }
        }else if (queryType === 'server') {
            showHacknet = this.hacknet.some(srv => srv.name.includes(query));
            showBotnet = this.botnet.some(srv => srv.name.includes(query));
            showPublic = !showBotnet && !showHacknet;
            if(showPublic) {
                let target = this.public.find(srv => srv.name.includes(query));
                if(typeof target !== 'undefined'){
                    this.logger.log(target.rootAccess);
                    showRootOnly = target.rootAccess;
                }
            }
        }
        this.show({
                rootOnly: showRootOnly,
                botnet: showBotnet,
                public: showPublic,
                hacknet: showHacknet,
                query: query
        })
    }
    async init(){
       try{
         await this.loadConfig();
         this.hacknet = this.file.readJson(this.config.hacknet.data_file);
         this.public = this.file.readJson(this.config.public.data_file);
         this.botnet = this.file.readJson(this.config.botnet.data_file);

       }catch(e) {
           throw new Exception('Error initializing DisplayHandler: ' + e);
       }finally{
            this.initialized = true
       }
    }

    /**
     * Show all networks specified by the options
     * @param {obj} options aray of options that influence the rendering of the networks
     * @returns {void}
     */
    async show(options) {
        this.logger.log('DisplayHandler init.');
        if(!this.initialized){
            return;
        };
        this.logger.log('Display network with options: [ ' + JSON.stringify(options) + ' ]');
        this.logger.log('Amount of servers: [ ' + this.public.length + ' ]');
        this.logger.log('Size of botnet : [ ' + this.botnet.length + ' ]');
        this.logger.log('Size of hacknet: [ ' + this.hacknet.length + ' ]');

        if(options.botnet) {
            this.logger.line();
            this.logger.log('✔️ Also showing Botnet');
            // we want the botnet servers to be on top, because they are more powerful
            for(let index = 0; index < this.botnet.length; index++) {
                this.showBotnetServer(this.botnet[index], options.query);
            }
        }
        if(options.hacknet){
            this.logger.line();
            this.logger.log('✔️ Also showing Hacknet');
            this.hacknet.forEach(srv => {
               try{
                this.showHacknetServer(srv, options.query);
               }catch(e){
                   this.logger.log(e)
               }
            });
        }
   
        if(options.public) {
            this.logger.line();
            this.logger.log('✔️ Also showing Public');
            let servers = this.public;
            if(options.rootOnly) {
                this.public
                    .filter( srv => srv.rootAccess === true)
                    .sort( (a,b) => b.money - a.money)
                    .forEach(srv => {
                        this.showPublicServer(srv, options.query);
                });
                servers = servers;
            } else {
                this.logger.log('✔️ Also showing nodes without r00t Access');
                this.public.sort( (a,b) => b.money - a.money).forEach(srv => {
                    this.showPublicServer(srv, options.query);
                });
            }
        }
        
    }

    /**
     * Show a Botnet server
     * @param {ExtendedBotnetServer} server to display
     * @param {?string} query optional search parameter
     */
    showBotnetServer(server, query = null){
        let marker = '';
        if(query !== null && server.name.includes(query)) {
            marker = '🔍';
        }
        let scripts = this.getRunningScripts(server);
        let name = '[ ' + this.logger.pad(17, server.name) + ' ] ';
        let padding = String(server.maxRam).length;
        let usedRam =  this.logger.pad(padding + 3, server.usedRam) ; // needs extra padding bc of possible decimals
        let maxRam = this.logger.pad(padding, server.maxRam);
        let ram = '[ ' + usedRam + ' / ' + maxRam + ' GB] ';

        let line = name + ram + scripts + marker;
        this.ns.tprint(line);
    }

    /**
     * Show a Hacknet server
     * @param {ExtendedHacknetServer} server to display
     * @param {?string} query optional search parameter
     */
    showHacknetServer(server, query = null){
        let marker = '';
        if(query !== null && server.name.includes(query)) {
            marker = '🔍';
        }
        //this.ns.tprint(JSON.stringify(server));
        let name = '[ ' + this.logger.pad(20, server.name) + ' ] ';
        let isServer = server.isServer ? ' [ ☣️ ] ' : ' [ ☢️ ] ';
        let level = '[ LVL: ' + this.logger.pad(3, server.level) + ' ] ';
        let maxRam ='[ ' + this.logger.pad(2, server.maxRam) + ' GB ] ';
        let cores = '[ CPU(s): ' + this.logger.pad(2, server.cores) + ' ]';
        let production = this.logger.pad(11, server.production.toFixed(0));
        let totalProduction = this.logger.pad(11, server.totalProduction.toFixed(0));
        let prod = '[ PROD: ' + production + ' / ' + totalProduction + ' ]';
        let online = '[ UP: ' + this.logger.pad(8, server.timeOnline.toFixed(0), true) + ' ]';
        let line = isServer + name + level + maxRam + cores + prod + online + marker;//+ ram + scriptString;
        this.ns.tprint(line);
    }
    /**
     * Show a Public server
     * @param {ExtendedPublicServer} server to display
     * @param {?string} query optional search parameter
     */
    showPublicServer(server, query) {
        let marker = '';
        if(query !== null && server.name.includes(query)) {
            marker = '🔍';
        }
        let scripts = this.getRunningScripts(server);
        let currentSecurity = this.logger.pad(3, server.security.toFixed(0), true);
        let minSecurity = this.logger.pad(3, server.minSecurity.toFixed(0), true);
        let security = `[ ${currentSecurity} / ${minSecurity} ]`
        let name = '[ ' + this.logger.pad(20, server.name) + ' ] ';
        let usedRam = this.logger.pad(8, server.usedRam.toFixed(1));
        let maxRam = this.logger.pad(5, server.maxRam);
        let ram = '[ ' + usedRam + ' / ' + maxRam + ' GB] ';
        let ports = ' [' + this.port(server.portsRequired) + ']';
        let root = (server.rootAccess ? '✔️' : '❌');
        let levelHack = '[ ' + this.logger.pad(4, server.requiredHackingLevel , true) + ' ]';
        let curMoney = this.formatPrice(server.money);
        let maxMoney = this.formatPrice(server.maxMoney);
        let money    = '[💰: '+ curMoney + ' / ' + maxMoney +' (₿)]'
        let line = root + ports + levelHack + name + ram + money + security + scripts + marker;
        this.ns.tprint(line);
    }

    /**
     * Format a price, so that it is more easily readable by the hoomans
     * @param {float} amount price to format
     * @returns {string} formatted price
     */
    formatPrice(amount) {
        let output = amount;
        let million = 1000000;
        let billion = 1000000000;
        let trillion = 1000000000000;
        if(amount > trillion) {
            amount = amount / trillion;
            output = `${amount.toFixed(2)}t`
        } else if(amount > billion) {
            amount = amount / billion;
            output = `${amount.toFixed(2)}b`
        }else if(amount > million) {
            amount = amount / million;
            output = `${amount.toFixed(2)}m`
        }else {
            output = `${amount.toFixed(2)}`
        }
        return this.logger.pad(10, output, true);
    }

    /**
     * Check if we have running scripts on a server
     * @param {Server} server server to check
     * @param {bool} icon whether we want an array of scripts or icons if we find running scripts
     * @returns {string|[obj]}
     */
    getRunningScripts(server, icon = true) {
        let active = [];
        let iconOutput = '';
        let ignore = ['/src/commands/show_network.js']
        let runningScripts = this.ns.ps(server.name);

        for(let index = 0; index < runningScripts.length; index++) {
            let script = runningScripts[index];
            let file = `${script.filename}`;

            if(ignore.includes(file)) {
                continue;
            }

            let icon = this.getScriptIcon(`${file}`)
            let runningScript  = {
                target: script.args[0],
                filename:file,
                img: icon
            }
            active.push(runningScript);
            iconOutput = `${iconOutput}[ ${icon} ] => [ ${script.args[0]} ]`
        }
        if(!icon) {
            return active;
        }
        return iconOutput;

    }

    /**
     * Get the icon corresponding to a script/filename so we can display it
     */
    getScriptIcon(filename) {
        let scripts = this.config.main.hacking.scripts;
        let path = this.config.main.hacking.path;
        let weakenScript = scripts.find(script => script.name === 'weaken');
        let growScript = scripts.find(script => script.name === 'grow');
        let hackScript = scripts.find(script => script.name === 'hack');

        switch(filename) {
            case `${path}${weakenScript.file}`:
                return '🧨';
            case `${path}${growScript.file}`:
                return '💲💲';
            case `${path}${hackScript.file}`:
                return '⚡';
            default:
                return '❓❓'
        }
    }

    /**
     * Create a string corresponding to the amount of ports that are required to attain root access
     * @param {int} number port number
     * @returns {string} visual representation of the amount of ports required
     */
    port(number) {
        let result = '';
        switch (number) {
            case 0: result = ' 0 '//'0️⃣'
                break;
            case 1: result = ' I '//'1️⃣'
                break;
            case 2: result = 'I I'//'2️⃣'
                break;
            case 3: result = 'III'//'3️⃣'
                break;
            case 4: result = 'I V'//'4️⃣'
                break;
            case 5: result = ' V '//'5️⃣'
                break;
        }
        return result;
    }
}