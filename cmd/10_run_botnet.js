import { ExceptionHandler } from '/src/tools/ExceptionHandler';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { BotnetManager } from '/src/manager/BotnetManager';

/** @param {NS} ns **/
export async function main(ns) {
    // This step uses the allocated budget to expand/upgrade the botnet network
    let context = 'LOOP10';
    try{
        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        let botnet = new BotnetManager(ns);
        await botnet.run();
        ns.spawn(`${config.main.cmdPath}${config.main.steps.runPublic}`);
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'BOTCMD');
    }
}