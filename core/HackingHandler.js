import { FileHandler } from '/src/tools/FileHandler';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler'
import { ExceptionHandler } from '/src/tools/ExceptionHandler'
import { Logger } from '/src/tools/Logger'
import { ExtendedBotnetServer } from '/src/entity/server/ExtendedBotnetServer';
import { ExtendedPublicServer } from '/src/entity/server/ExtendedPublicServer';
import { Infector } from '/src/hacking/Infector';
import { Process } from '/src/entity/Process';
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
        this.running;
    }
    init() {
        this.config = this.ch.getConfig('main');
        this.loadServers();
        this.files = this.config.main.hacking.scripts;
        this.path = this.config.main.hacking.path;
        
    }

    loadServers() {
        let botnetData = this.file.readJson(this.config.botnet.data_file);
        let publicData = this.file.readJson(this.config.public.data_file).filter(srv => srv.rootAccess === true);
        botnetData.forEach(bot => {
            let server = new ExtendedBotnetServer(this.ns, bot.name);
            server.actualize();
            this.botnet.push(server);
        })
        publicData.forEach(pub => {
            let server = new ExtendedPublicServer(this.ns, pub.name);
            server.actualize();
            this.public.push(server);
        })

    }
    async execute(force = false) {
        // load config etc
        this.init();
        let botnetSuccess = 0, publicSuccess = 0;
        // loop through all the bots
        for(let index = 0; index < this.botnet.length; index++) {
            try{
                let botnetServer = this.botnet[index];

                // and try to enslave them
                let result = await this.enslave(botnetServer, force);

                this.logger.log(`Finished enslaving server ${botnetServer.name}, result: ${result.success} => '${result.message}'`)
                botnetSuccess = result.success ? botnetSuccess + 1 : botnetSuccess;
                await this.ns.asleep(10);

            }catch(e) {
                this.eh.handle(e, 'HCKEXEC');
            }
            // if(index === 2){
            //     break;
            // }
            await this.ns.asleep(10);
        }
        //return
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
            this.eh.handle(e, 'HCKEXEC');
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

        let target = this.selectTarget(server);
        this.logger.log(`chosen target: ${JSON.stringify(target)}`)
       
        return this.infector.executeScript(`${this.path}${script.file}`, server, target.name)

    }
    /**
     * Check if a server has the scripts required to weaken, grow and hack
     * @param {Server} server to check
     * @returns {bool}
     */
    checkIfServerHasRequiredScripts(server) {

        for(let index = 0; index < this.files.length; index++) {
            let script = this.files[index];
            let toCheck = `${this.path}${script.file}`;
            if(!this.file.fileExists(toCheck, server.name)){
                return false;
            }
        }
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
    selectTarget(attacker) {
        let attackers = this.getAttackers();
        let attacked = this.getAttacked(attackers);
        let possibleTargets = this.getPossibleTargets();
        let ratio = this.calculateMoneyToRamRatio(possibleTargets);
        this.logger.log(`Attackers:`);
        this.logger.log(`${JSON.stringify(attackers)}`);
        
        this.logger.log(`Attacked:`);
        this.logger.log(`${JSON.stringify(attacked)}`);
        this.logger.log(`Possible targets: ${possibleTargets.length}`)
        for(let index = 0; index < possibleTargets.length; index++) {
            let target = possibleTargets[index];
            let find = attacked.find(srv => srv.name === target.name);
            this.logger.log(`Considering target ${target.name} => already in datastructure: ${typeof find ==='undefined' ? 'no' : 'yes'}`)
            
            if(typeof find === 'undefined') {
                // Target is not being targeted yet, so it is a perfect target
                this.logger.log(`New target: ${target.name}`)
                return target;
            }else{
                // Target is already being attacked, calculate if there is room left
                let threads = find.threads;
                let script = find.script;
                let ramPerThread = this.ns.getScriptRam(script, attacker.name);
               // this.logger.log(`threads: ${threads}, ramPerThread: ${ramPerThread}`)
                let ramUsed = threads * ramPerThread;
                this.logger.log(`Threads: ${threads}`);
                this.logger.log(`Script: ${script}`);
                this.logger.log(`ramPerThread: ${ramPerThread}`);
                this.logger.log(`ramUsed: ${threads}`);
                // We check how much money the target has with regards to the amount of RAM currently spent on attacking it
                // since ratio === money / ram => money / ratio === ram, so we have the cutoff point there
                this.logger.log(`money / ratio > ramUsed : ${target.maxMoney} / ${ratio} > ${ramUsed} => ${target.maxMoney / ratio > ramUsed}`)
                if(target.maxMoney / ratio > ramUsed) {
                    return target;
                }
                // if we cross it, we know we have spent all the ram we wanted on this target, and will continue to the next
                continue;
            }
        }
    }

    getAttackers() {

        let attackers = [];
        // Get all the attacking servers
        this.public.filter(pub => pub.name !== 'home').forEach(pub => {
           
            let running = this.ns.ps(pub.name);
            if(running.length > 0) {
                // server is attacking someone
                running.forEach(run => {
                    let process = new Process(
                        run.pid,
                        run.filename,
                        pub.name,
                        run.args,
                        run.threads,
                    );
                    attackers.push(process);
                });
            }
        })
        this.botnet.forEach(bot => {
            let running = this.ns.ps(bot.name);
            if(running.length > 0) {
                // server is attacking someone
                running.forEach(run => {
                    let process = new Process(
                        run.pid,
                        run.filename,
                        bot.name,
                        run.args,
                        run.threads,
                    );
                    attackers.push(process);
                });
            }
        })
 
        return attackers;

    }

    getAttacked(attackers) {

        let attacked = [];
        // Get all the currently attacked servers
        for(let index = 0; index < attackers.length; index++) {
            let attacker = attackers[index];
            let indexOfElement = attacked.findIndex(srv => srv.name === attacker.args[0] && srv.script === attacker.filename);
            if(indexOfElement !== -1) {
                let currentThreads = attacked[indexOfElement].threads
                // already in list of attacked, add the new amount of threads
                attacked[indexOfElement] = { name: attacker.args[0], script: attacker.filename, threads: attacker.threads + currentThreads };
            }else{
                // not yet in list of attacked, add it
                attacked.push({name: attacker.args[0], script: attacker.filename, threads: attacker.threads});
            }
        }
        return attacked;
    }
   
    getPossibleTargets() {
        return this.public
            // Filter out servers that aren't valid targets
            .filter(
                pub =>  pub.rootAccess
                        && pub.name !== 'home'
                        && pub.requiredHackingLevel <= this.ns.getHackingLevel()
                        && pub.maxMoney > 1000000000
                    )
            // sort on the maximum amount of money
            .sort((a,b) => b.maxMoney - a.maxMoney)
    }

    calculateMoneyToRamRatio(targets) {
        let totalAvailableRam = 0;
        let totalAvailableMoney = 0;
        
        // First we calculate how much RAM all our servers have together (except home (for now) because that has its own schedule)
        this.public.filter(srv => srv.name !== 'home').forEach(pub => {
            totalAvailableRam += pub.fetch('maxRam');
        })
        this.botnet.forEach(bot => {
            totalAvailableRam += bot.fetch('maxRam');
        })
        targets.forEach(target => {
            totalAvailableMoney += target.maxMoney
        })

        // Finally we calculate the money to ram ratio
        return totalAvailableMoney / totalAvailableRam;
    }
}