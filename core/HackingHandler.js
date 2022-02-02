import { FileHandler } from '/src/tools/FileHandler';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler'
import { ExceptionHandler } from '/src/tools/ExceptionHandler'
import { Logger } from '/src/tools/Logger'
import { ExtendedBotnetServer } from '/src/entity/server/ExtendedBotnetServer';
import { ExtendedPublicServer } from '/src/entity/server/ExtendedPublicServer';
import { Infector } from '/src/hacking/Infector';
/**
 * Handles the enslaving of servers, instructing them to weaken, grow or hack
 */
export class HackingHandler {
    constructor(ns, verbose) {
        this.ns = ns;
        this.verbose = verbose;
        this.context = 'HCKING'
        this.ch = new ConfigurationHandler(ns, verbose);
        this.eh = new ExceptionHandler(ns, this.context)
        this.logger = new Logger(ns, verbose, this.context);
        this.file = new FileHandler(ns, verbose);
        this.infector = new Infector(ns, verbose);
        this.config;
        this.targets = [];
        this.public = [];
        this.botnet = [];
        this.files = [];
        this.path;
    }
    init() {
        this.config = this.ch.getConfig('main');
        this.public = this.file.readJson(this.config.public.data_file).filter(srv => srv.rootAccess === true);
        this.botnet = this.file.readJson(this.config.botnet.data_file);
        this.files = this.config.main.hacking.scripts;

        this.path = this.config.main.hacking.path;
    }
    async run(force = false) {
        // load config etc
        this.init();
        let botnetSuccess = 0, publicSuccess = 0;
        // loop through all the bots
        for(let index = 0; index < this.botnet.length; index++) {
            try{
                let bot = this.botnet[index];
                let botnetServer = new ExtendedBotnetServer(this.ns, bot.name, bot.source);
                botnetServer.maxRam = botnetServer.fetch('maxRam');

                // and try to enslave them
                let result = await this.enslave(botnetServer, force);

                this.logger.log(`Finished enslaving server ${botnetServer.name}, result: ${result.success} => '${result.message}'`)
                botnetSuccess = result.success ? botnetSuccess + 1 : botnetSuccess;
                await this.ns.asleep(10);
            }catch(e) {
                this.eh.handle(e, 'HCKRUN');
            }

        }
        // loop through all the public servers
        for(let index = 0; index < this.public.length; index++) {
            try {
                let pub = this.public[index];
                let publicServer = new ExtendedPublicServer(this.ns, pub.name, pub.source);
                publicServer.maxRam = publicServer.fetch('maxRam');

                // and try to enslave them
                let result = await this.enslave(publicServer, force);

                this.logger.log(`Finished enslaving server ${publicServer.name}, result: ${result.success} => '${result.message}'`)
                publicSuccess = result.success ? publicSuccess + 1 : publicSuccess;
                await this.ns.asleep(10);
            }catch(e) {
            this.eh.handle(e, 'HCKCRUN');
            }
        }
        // If we successfully enslaved servers, report these
        if(botnetSuccess > 0 || publicSuccess > 0) {
            this.logger.notify(`Enslavement run completed, succesfully instructed to w/g/h:`);
            this.logger.notify(`- BotnetServers: ${this.logger.pad(2, botnetSuccess, true)} / ${this.botnet.length}`);
            this.logger.notify(`- PublicServers: ${this.logger.pad(2, publicSuccess, true)} / ${this.public.length}`);
        }else {
            this.logger.notify(`No servers required enslavement, hybernating`);
        }
    }
    /**
     * Enslave a server, i.e. making it hack/grow/weaken a target
     * @param {Server} server the server to enslave
     */
    async enslave(server, force = false) {
        if(force) {
            this.ns.killall(server.name);
        }else if(!force && this.ps(server.name).length > 0) {
            return {
                success: false,
                message: `Skipping server, already has scripts running and force === ${force}`
            };
        }
        this.logger.log(`Enslaving server: ${server.name}`)
        let maxMoney = server.fetch('maxMoney');
        let moneyThreshold = maxMoney * 0.7;
        let securityThreshold = server.fetch('minSecurity') + 5;
        let script = {};

        if(!this.checkIfServerHasRequiredScripts(server) || force) {
            for(let index = 0; index < this.files.length; index++) {
                let result = await this.ns.scp(this.path + this.files[index].file, server.name);
                this.logger.log(`SCP ${this.files[index].file} to ${server.name} => result: ${result}`)
                // Add the logger so we can use the currentTime functionality in the w/g/h.js scripts
            }
            let result = await this.ns.scp('/src/tools/Logger.js', server.name);
            this.logger.log(`SCP '/src/tools/Logger.js' to ${server.name} => result: ${result}`)
        }
        if (server.fetch('security') > securityThreshold) {
            // If the server's security level is above our threshold, weaken it
            script = this.files.find(script => script.name === 'weaken');
        } else if (this.ns.getServerMoneyAvailable(server.name) < moneyThreshold) {
            // If the server's money is less than our threshold, grow it
            script = this.files.find(script => script.name === 'grow');
        } else {
            // Otherwise, hack it
            script = this.files.find(script => script.name === 'hack');
        }
        let target = this.selectTarget();
        return this.infector.executeScript(`${this.path}${script.file}`, server, target.name)

    }
    /**
     * Check if a server has the scripts required to weaken, grow and hack
     * @param {Server} server to check
     * @returns {bool}
     */
    checkIfServerHasRequiredScripts(server) {
        this.logger.log(`files length: ${this.files.length}`)
        for(let index = 0; index < this.files.length; index++) {
            let script = this.files[index];
            let toCheck = `${this.path}${script.file}`;
            this.logger.log(`Checking ${server.name}:${this.path + script.file}`)
            if(!this.file.fileExists(toCheck, server.name)){
                return false;
            }
        }
        this.logger.log(`Server ${server.name} has required files)`)
        return true;
    }
    checkRequiredAction() {
        let moneyThresh = ns.getServerMaxMoney(target) * 0.75;
    }
    killEverythingEverywhere() {
        this.botnet.forEach(bot => {
            this.killall(bot.name)
        })
        this.public.forEach(pub => {
            this.killall(pub.name)
        })
    }
    killAll(host) {
        this.ns.killall(host)
    }
    /**
     * Get all running scripts on server
     * @param {string} host name of server
     * @returns {array} list of scripts + arguments
     */
    ps(host) {
        return this.ns.ps(host)
    }

    /**
     * Select an (optimal) target
     * @todo optimize the selection
     * @returns target to attack
    */
    selectTarget() {
        let possibleTargets = this.public
            // Filter out servers that aren't valid targets
            .filter(
                pub =>  pub.rootAccess
                        && pub.name !== 'home'
                        && pub.requiredHackingLevel <= this.ns.getHackingLevel()
                        && pub.maxMoney > 0
                    )
            // sort on the amount of available money
            // Note: this is not a perfect way to select a target
            // @todo: think of a better way
            .sort((a,b) => b.maxMoney - a.maxMoney)
            //.sort((a,b) => b.money - a.money);
        return possibleTargets[0];
    }
}