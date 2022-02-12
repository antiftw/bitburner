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
        this.context = 'MAIN-LOOP';
        this.ch = new ConfigurationHandler(ns);
        this.config;
  
        this.verbose = verbose;
        this.logger = new Logger(ns, this.verbose, this.context);
        this.eh = new ExceptionHandler(ns, this.context);
        this.fm = new FileHandler(ns, this.verbose);
        this.host = "home";
        this.modules;
        this.path;
        this.steps;
        this.args = [];
        this.lastBeat = new Date();
        this.heartbeat = 1000 * 60 * 5; // default give us a heartbeat each 5 min -> we can override this in the configuration
        this.previousFortune = this.ns.getServerMoneyAvailable('home');
        this.phase
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
                if(this.steps.initConfig.enabled){
                    this.executeModule(`${this.path}${this.steps.initConfig.file}`, this.args.forceRefresh);
                    await this.checkModuleStatus(this.steps.initConfig.file);
                }
                if(this.steps.incrBudget.enabled){
                    this.executeModule(`${this.path}${this.steps.incrBudget.file}`, this.args.forceRefresh);
                    await this.checkModuleStatus(this.steps.incrBudget.file);
                }
                if(this.steps.divdBudget.enabled){
                    this.executeModule(`${this.path}${this.steps.divdBudget.file}`);
                    await this.checkModuleStatus(this.steps.divdBudget.file);
                }
                if(this.steps.scanBotnet.enabled){
                    this.executeModule(`${this.path}${this.steps.scanBotnet.file}`);
                    await this.checkModuleStatus(this.steps.scanBotnet.file);
                }
                if(this.steps.scanPublic.enabled){
                    this.executeModule(`${this.path}${this.steps.scanPublic.file}`);
                    await this.checkModuleStatus(this.steps.scanPublic.file);
                }
                if(this.steps.scanHacknet.enabled){
                    this.executeModule(`${this.path}${this.steps.scanHacknet.file}`);
                    await this.checkModuleStatus(this.steps.scanHacknet.file);
                }
                if(this.steps.diagnoseBotnet.enabled){
                    this.executeModule(`${this.path}${this.steps.diagnoseBotnet.file}`);
                    await this.checkModuleStatus(this.steps.diagnoseBotnet.file);
                }
                if(this.steps.diagnosePublic.enabled){
                    this.executeModule(`${this.path}${this.steps.diagnosePublic.file}`);
                    await this.checkModuleStatus(this.steps.diagnosePublic.file);
                }
                if(this.steps.diagnoseHacknet.enabled){
                    this.executeModule(`${this.path}${this.steps.diagnoseHacknet.file}`);
                    await this.checkModuleStatus(this.steps.diagnoseHacknet.file);
                }
                if(this.steps.runBotnet.enabled){
                    this.executeModule(`${this.path}${this.steps.runBotnet.file}`);
                    await this.checkModuleStatus(this.steps.runBotnet.file);
                }
                if(this.steps.runPublic.enabled){
                    this.executeModule(`${this.path}${this.steps.runPublic.file}`);
                    await this.checkModuleStatus(this.steps.runPublic.file);
                }
                if(this.steps.runHacknet.enabled){
                    this.executeModule(`${this.path}${this.steps.runHacknet.file}`);
                    await this.checkModuleStatus(this.steps.runHacknet.file);
                }
                if(this.steps.runHacker.enabled){
                    this.executeModule(`${this.path}${this.steps.runHacker.file}`, this.args.forceRefresh);
                    await this.checkModuleStatus(this.steps.runHacker.file);
                }
                this.updateConfig();
            }else {
                await this.ns.asleep(5000);
            }
            await this.ns.asleep(10);
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
        this.verbose = this.config.main.verbosity;
        // only replace it when defined
        this.heartbeat = typeof this.config.main.heartbeatDuration !== 'undefined' ? this.config.main.heartbeatDuration : this.heartbeat;
    }

    notify(msg) {
        this.ns.tprint(`[${this.logger.currentTime()}][NOTIFY][MAIN-LOOP] ${msg}`)
    }

}