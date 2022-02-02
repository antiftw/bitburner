/** @param {NS} ns **/

import { Exception } from '/src/entity/Exception.js';
import { ExceptionHandler } from '/src/tools/ExceptionHandler.js';
import { Logger } from '/src/tools/Logger.js';
import { cracks } from '/data/cracks.js';

/**
 * Used to infect servers, forcing rootAccess so we can enslave them
 */
export class Infector {
    ns;
    logger;
    exclude = [];
    crackFiles = []
    constructor(ns, verbose = false, exclude = ['home', 'darkweb']){
        this.ns = ns;
        this.context = 'INFECT'
        this.logger = new Logger(ns, verbose, this.context);
        this.eh     = new ExceptionHandler(ns, this.context);
        this.exclude = exclude;
        this.cracks = cracks;
    }
    /**
     * Infect a server
     * @param {*} server to infect
     * @returns {obj} = {success, messaage}
     */
    async infect(server){
        let context = 'INFECT'
        let exclude = ['home', 'darkweb'];
        if(exclude.includes(server.name))
            return 1;
        this.logger.log("Initializing Infectation of server " + server.name);

        let portsRequired = server.portsRequired;
        this.logger.log("Ports required: " + portsRequired);

        if(!server.hasRootAccess) {
            let portsCracked = 0;
            for(let index = 0; index < portsRequired; index++) {
                try{
                    await this.crack(this.cracks[index], server);
                    portsCracked++;
                }catch(e) {
                    this.eh.handle(e, 'INFECT')
                }
            }
            if(portsRequired === portsCracked) {
                try{
                    this.logger.log("NUKING!");
                    await server.nuke();
                    return {
                        success: true,
                        message: `Successfully infected server ${server.name}`
                    }
                }catch(e){
                    this.eh.handle(e, context);
                }
            }
            return {
                success: false,
                message: `Failed infecting server ${server.name}`
            }
        }
    }
    /**
     * Execute a certain script on a specified server
     * @param {string} script /path/filename of the script to execute
     * @param {string} server name of the server to execute the script on
     * @param {array} param parameters
     * @returns 
     */
    executeScript(script, server, param) {
        let serverRam = server.maxRam;
        let scriptRam = this.ns.getScriptRam(script, server.name);
        this.logger.log(`Executing file [ ${script} ] ( ${scriptRam} GB ) on server [ ${server.name} ] with [ ${serverRam} GB ] `)
        let threads = (serverRam / scriptRam) | 0 ; // | 0 => bitwise or to round down
        if(serverRam === 0 || threads === 0) {
            return {
                success: false,
                message: 'Infectation of server failed => insufficient processingpower available'
            }
        }
        this.logger.log('ScriptRam: ' + scriptRam + ' / ServerRam: ' + serverRam);
        this.logger.log("Executing script: ( " + script + " ) with " + threads + " threads.")
        let result = this.ns.exec(script, server.name, threads, param)
        return {
            success: result,
            message: `Infectation of server [ ${server.name} ] ==> [ ${param }] is complete. Result: ${result > 0 ? true : false}`
        }
    }
    /**
     * Execute a certain script on a specified server after killing all scripts on there
     * @deprecated, use executeScript() instead
     * @param {string} script /path/filename of the script to execute
     * @param {string} server name of the server to execute the script on
     * @param {array} param parameters
     * @returns {int} result
     */
    async executeHackScript(server, script, param) {
        this.logger.log("Copying script: " + script);
        await this.ns.scp(script, server.name);
        this.logger.log("Killing all running scripts...")
        if(server.name !== 'home') {
            await this.ns.killall(server.name);
        }

        this.logger.log("Calculating available processing power...")
        let serverRam = server.maxRam;
        let scriptRam = this.ns.getScriptRam(script, server.name);
        
        let threads = (serverRam / scriptRam) | 0 ; // | 0 => bitwise or to round down
        if(serverRam === 0 || threads === 0) {
            throw new Exception('No processingpower available on server', server)
        }
        this.logger.log('ScriptRam: ' + scriptRam + ' / ServerRam: ' + serverRam);
        this.logger.log("Executing script: ( " + script + " ) with " + threads + " threads.")
        let result = await this.ns.exec(script, server.name, threads, param)
        this.logger.log(`Infectation of server [ ${server.name} ] is complete. Result: ${result > 0 ? true : false}`)
        return 0;
    }

    /**
     * Crack a server using one of the available tools
     * @param {obj} crack crack to run
     * @param {obj} server server to run crack on
     */
    async crack(crack, server){
        if(this.ns.fileExists(crack.name)) {
            switch (crack.name) {
                case 'BruteSSH.exe':
                    await server.bruteSsh();
                    break;
                case 'FTPCrack.exe':
                    await server.ftpCrack();
                    break;
                case 'relaySMTP.exe':
                    await server.relaySmtp();
                    break;
                case 'HTTPWorm.exe':
                    await server.httpWorm();
                    break;
                case 'SQLInject.exe':
                    await server.sqlInject();
                    break;
                default:
                    break;
            }
            this.logger.log(crack.text);
        }else{ 
            throw new Exception('Infectation failed, ' + crack.name + ' not present while trying to infect ' + server.name + '.', server);
        }
    }
}