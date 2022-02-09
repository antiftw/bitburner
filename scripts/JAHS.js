import { FileManager } from "/JAHS/Tools/FileManager.js";
import { getConfig } from "/JAHS/Tools/ConfigHelper.js";
/**
 * Author: Jjin
 */
/** @param {NS} ns **/
export class JAHS {
    constructor(ns, l) {
        this.ns = ns;
        this.l = l;
        this.fm = new FileManager(ns,l);
        this.config;
        this.host = "home";
        this.modules;
    }

    async execute() {
        await this.updateConfig();
        await this.monitor();
    }

    async monitor() {
        while (this.config.jahsEnabled) {
            if(this.config.scannerEnabled){
                await this.executeModule("/JAHS/Scripts/Scanner.js");
                await this.checkModuleStatus();
            }
            if(this.config.analyzerEnabled){
                await this.executeModule("/JAHS/Scripts/Analyzer.js");
                await this.checkModuleStatus();
            }
            if(this.config.budgetManagerEnabled){
                await this.executeModule("/JAHS/Scripts/BudgetManager.js");
                await this.checkModuleStatus();
            }
            if(this.config.homeUpgraderEnabled){
                await this.executeModule("/JAHS/Scripts/HomeUpgrader.js");
                await this.checkModuleStatus();
            }
            if(this.config.hackNetManagerEnabled){
                let budget = this.ns.getServerMoneyAvailable("home") / 2;
                await this.executeModule("/JAHS/Scripts/HackNetManager.js");
                await this.checkModuleStatus();
            }
            if(this.config.domainManagerEnabled){
                let budget = this.ns.getServerMoneyAvailable("home");
                await this.executeModule("/JAHS/Scripts/DomainManager.js");
                await this.checkModuleStatus();
            }
            if(this.config.botNetManagerEnabled){
                await this.executeModule("/JAHS/Scripts/BotNetManager.js");
                await this.checkModuleStatus();
            }
            if(this.config.programmerManagerEnabled){
                await this.executeModule("/JAHS/Scripts/ProgrammerManager.js");
                await this.checkModuleStatus();
            }
            if(this.config.AttackManagerEnabled){
                await this.executeModule("/JAHS/Scripts/AttackManager.js");
                await this.checkModuleStatus();
            }
            this.updateConfig();
        }
    }

    async checkModuleStatus() {
        await this.waitForModule("/JAHS/Scripts/Scanner.js");
        await this.waitForModule("/JAHS/Scripts/Analyzer.js");
        await this.waitForModule("/JAHS/Scripts/BudgetManager.js");
        await this.waitForModule("/JAHS/Scripts/HomeUpgrader.js");
        await this.waitForModule("/JAHS/Scripts/HackNetManager.js");
        await this.waitForModule("/JAHS/Scripts/DomainManager.js");
        await this.waitForModule("/JAHS/Scripts/BotNetManager.js");
        await this.waitForModule("/JAHS/Scripts/ProgrammerManager.js");
        await this.waitForModule("/JAHS/Scripts/AttackManager.js");
    }

    async waitForModule(scrName) {
        while (this.ns.scriptRunning(scrName, this.host)) {
            await this.ns.sleep(3000);
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
        this.config = await getConfig(this.ns, "JAHS");
    }
}