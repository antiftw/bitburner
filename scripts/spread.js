import { Infector } from '/src/hacking/Infector.js' ;
import { FileHandler } from '/src/tools/FileHandler.js'
import { Logger } from '/src/tools/Logger.js' ;
import { ExtendedPublicServer } from '/src/entity/server/ExtendedPublicServer.js';
import { ExtendedBotnetServer } from '/src/entity/server/ExtendedBotnetServer.js';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
/**
 * Startup script. Currently broken due to changes in the infector, 
 * @deprecated the main loop (in /src/cmd) replaces this functionality in step 13
 */
/** @param {NS} ns **/
export async function main(ns) {
    // Get script filename from argumentas
    let script = ns.args[0];
    let parameters = "rothman-uni";
    let verbose = true;
    let logger = new Logger(ns, verbose, 'INFECT');
    let infector = new Infector(ns, verbose);
    let ch = new ConfigurationHandler(ns, verbose);
    let config = ch.getConfig('main');
    let fh = new FileHandler(ns);
    if (typeof script === 'undefined') {
        script = '/src/scripts/hack.js'
    }
    let failedBotnet = [];
    let failedServers = [];

    let botnetInfected = 0;
    let publicInfected = 0;

    let servers = fh.readJson(config.public.data_file);
    let botnet = fh.readJson(config.botnet.data_file);

    for (let index=0; index < servers.length; index++ ) {

        try{
            let server = new ExtendedPublicServer(ns, servers[index].name);
            server.update({
                maxRam: servers[index].maxRam,
                maxMoney: servers[index].maxMoney,
                rootAccess: servers[index].rootAccess,
                usedRam: servers[index].usedRam,
                money: servers[index].money,
                portsRequired: servers[index].portsRequired,
                requiredHackingLevel: servers[index].requiredHackingLevel,
                security: servers[index].security,
                minSecurity: servers[index].minSecurity,
            })
            let infectResult = await infector.infect(server);
            if(infectResult === 0) {
                publicInfected++;
            }

        }catch(exception){
            logger.log(exception.message);
            failedServers.push(exception);
        }
        await ns.sleep(10);
    }
    for (let index=0; index < botnet.length; index++ ) {
        try{
            let server = new ExtendedBotnetServer(ns, botnet[index].name);
            server.update({
                maxRam: botnet[index].maxRam,
                maxMoney: botnet[index].maxMoney,
                rootAccess: botnet[index].rootAccess,
                usedRam: botnet[index].usedRam,
                money: botnet[index].money,
            });
            let infectResult = await infector.executeHackScript(server, script, parameters);
            if(infectResult === 0) {
                botnetInfected++;
            }
        }catch(exception){
            logger.log(exception.message);
            failedBotnet.push(exception);
        }
       await ns.sleep(10);
    }
    logger.log(`Failed bots: ${failedBotnet.length}`);
    if(failedBotnet.length !== 0){
        let string = '';
        let err = [];
        failedBotnet.forEach(exception => {
            let srv = exception.content
            string += `${srv.name}, `
            err.push(exception.message);
        })
        // remove duplicates
        err = [...new Set(err)];
        // remove last chars
        string =  `${string.slice(0, string.length - 2)}`;
        logger.log(`Failed infecting botnet servers: ${string}: ${JSON.stringify(err)}`);
    }
    logger.log(`Failed public: ${failedServers.length}`);
    if(failedServers.length !== 0){
        let string = '';
        let err = [];
        failedServers.forEach(exception => {
            let srv = exception.content
            string += `${srv.name}, `
            err.push(exception.message);
        })
        // remove duplicates
        err = [...new Set(err)];
        // replace last , with .
        string = `${string.slice(0, string.length - 2)}`;
        logger.log(`Failed infecting public servers: ${string}: ${JSON.stringify(err)}`);
    }
    logger.log(`number of infected public servers: ${publicInfected} / ${servers.length}`)
    logger.log(`number of infected botnet servers: ${botnetInfected} /${botnet.length}`)

   
}

