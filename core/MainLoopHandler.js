import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
import { FileHandler } from '/src/tools/FileHandler';
import { Logger } from '/src/tools/Logger'
/**
 * Runs the main loop, kicking off all different parts of the application
 * Inspired by the JAHS class by Jjin, because of the nice solution to wait for scripts to finish, which works faster than the 'spawn' solution
 */
export class MainLoopHandler {
    constructor(ns, verbose = 0) {
        this.ns = ns;
        this.verbose = verbose;
        this.context = 'MAIN-LOOP';
        this.logger = new Logger(ns, this.verbose, this.context);
        this.eh = new ExceptionHandler(ns, this.context);
        this.fm = new FileHandler(ns, this.verbose);
        this.ch = new ConfigurationHandler(ns, this.verbose);
        this.config;
        this.host = "home";
        this.modules;
        this.path;
        this.steps;
        this.args = [];
        this.lastBeat = new Date();
        this.heartbeat = 1000 * 60 * 5; // default give us a heartbeat each 5 min -> we can override this in the configuration
        this.previousFortune = this.ns.getServerMoneyAvailable('home');
    }

    async execute(args) {
       try {
           this.args = args;
            await this.updateConfig();

            // Thanks to https://textkool.com/en/ascii-art-generator?hl=default&vl=default&font=Elite&text=Anti-Bitburner
            this.notify(` ▄▄▄·  ▐ ▄ ▄▄▄▄▄▪  ▄▄▄▄· ▪  ▄▄▄▄▄▄▄▄▄· ▄• ▄▌▄▄▄   ▐ ▄ ▄▄▄ .▄▄▄  `);
            this.notify(`▐█ ▀█ •█▌▐█•██  ██ ▐█ ▀█▪██ •██  ▐█ ▀█▪█▪██▌▀▄ █·•█▌▐█▀▄.▀·▀▄ █·`);
            this.notify(`▄█▀▀█ ▐█▐▐▌ ▐█.▪▐█·▐█▀▀█▄▐█· ▐█.▪▐█▀▀█▄█▌▐█▌▐▀▀▄ ▐█▐▐▌▐▀▀▪▄▐▀▀▄ `);
            this.notify(`▐█ ▪▐▌██▐█▌ ▐█▌·▐█▌██▄▪▐█▐█▌ ▐█▌·██▄▪▐█▐█▄█▌▐█•█▌██▐█▌▐█▄▄▌▐█•█▌`);
            this.notify(` ▀  ▀ ▀▀ █▪ ▀▀▀ ▀▀▀·▀▀▀▀ ▀▀▀ ▀▀▀ ·▀▀▀▀  ▀▀▀ .▀  ▀▀▀ █▪ ▀▀▀ .▀  ▀`);
            let noVerbosity = `, verbose: ${this.verbose} => no output, running silently in background. To change this => ConfigurationHandler => main.verbosity.general`
            this.notify(`Initialized${this.verbose === 0 ? noVerbosity : '.' }`)
            await this.monitor();
       }catch(e) {
           this.eh.handle(e, 'EXECUTE');
       }
    }

    async monitor() {

        this.logger.log(this.sleepDuration)
        if(this.args.initConfig) {
            this.executeModule(`${this.path}${this.steps.initConfig}`, true);
            await this.checkModuleStatus(this.steps.initConfig);
        }

        while (this.config.main.heartbeat) {
            let now = new Date();
            if(now.valueOf() - this.lastBeat.valueOf() > this.heartbeat && this.verbose === 0) {
                // even if we dont have verbosity on, we still want a signal of life every now and then
                let money = this.ns.getServerMoneyAvailable('home');
                let difference = money - this.previousFortune;
                this.notify(`Heartbeat - Current Cash: ${(Math.round(money * 100) / 100).toLocaleString('en')} - Difference since last beat: ${(Math.round(difference * 100) / 100).toLocaleString('en')}`);
                this.lastBeat = now;
                this.previousFortune = money;
            }
            if(this.config.main.enabled){
                this.logger.line(50, true);
                this.logger.notify(`Iteration started at ${this.logger.currentTime()}`);
                this.logger.line(50, true);
                if(true){
                    this.executeModule(`${this.path}${this.steps.initConfig}`, this.args.forceRefresh);
                    await this.checkModuleStatus(this.steps.initConfig);
                }
                if(true){
                    this.executeModule(`${this.path}${this.steps.incrBudget}`, this.args.forceRefresh);
                    await this.checkModuleStatus(this.steps.incrBudget);
                }
                if(true){
                    this.executeModule(`${this.path}${this.steps.divdBudget}`);
                    await this.checkModuleStatus(this.steps.divdBudget);
                }
                if(true){
                    this.executeModule(`${this.path}${this.steps.scanBotnet}`);
                    await this.checkModuleStatus(this.steps.scanBotnet);
                }
                if(true){
                    this.executeModule(`${this.path}${this.steps.scanPublic}`);
                    await this.checkModuleStatus(this.steps.scanPublic);
                }
                if(true){
                    this.executeModule(`${this.path}${this.steps.scanHacknet}`);
                    await this.checkModuleStatus(this.steps.scanHacknet);
                }
                if(true){
                    this.executeModule(`${this.path}${this.steps.diagnoseBotnet}`);
                    await this.checkModuleStatus(this.steps.diagnoseBotnet);
                }
                if(true){
                    this.executeModule(`${this.path}${this.steps.diagnosePublic}`);
                    await this.checkModuleStatus(this.steps.diagnosePublic);
                }
                if(true){
                    this.executeModule(`${this.path}${this.steps.diagnoseHacknet}`);
                    await this.checkModuleStatus(this.steps.diagnoseHacknet);
                }
                if(true){
                    this.executeModule(`${this.path}${this.steps.runBotnet}`);
                    await this.checkModuleStatus(this.steps.runBotnet);
                }
                if(true){
                    this.executeModule(`${this.path}${this.steps.runPublic}`);
                    await this.checkModuleStatus(this.steps.runPublic);
                }
                if(true){
                    this.executeModule(`${this.path}${this.steps.runHacknet}`);
                    await this.checkModuleStatus(this.steps.runHacknet);
                }
                if(true){
                    this.executeModule(`${this.path}${this.steps.runHacker}`, this.args.forceRefresh);
                    await this.checkModuleStatus(this.steps.runHacker);
                }
                this.updateConfig();
            }else {
                await this.ns.asleep(1000);
            }
        }
    }

    async checkModuleStatus(module) {
        await this.waitForModule(`${this.path}${module}`);
    }

    async waitForModule(scrName) {
        while (this.ns.scriptRunning(scrName, this.host)) {
            await this.ns.sleep(this.sleepDuration);
        }
    }
    async executeModule(scrName, args){
        if(args != null){
            this.ns.exec(scrName, this.host, 1, args);
        } else {
            this.ns.exec(scrName, this.host, 1);
        }
    }

    async updateConfig(){
        this.config = this.ch.getConfig('main');
        this.path = this.config.main.cmdPath;
        this.steps = this.config.main.steps;
        this.sleepDuration = this.config.main.sleepDuration;
        this.verbose = this.config.main.verbosity.general;
        // only replace it when defined
        this.heartbeat = typeof this.config.main.heartbeatDuration !== 'undefined' ? this.config.main.heartbeatDuration : this.heartbeat;
    }

    notify(msg) {
        this.ns.tprint(`[${this.logger.currentTime()}][NOTIFY][MAIN-LOOP] ${msg}`)
    }

}