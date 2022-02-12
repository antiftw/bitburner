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
        let verbose = ch.determineVerbosity(config.main.steps.runBotnet.verbosity);
        let botnet = new BotnetManager(ns, verbose);
        await botnet.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'BOTCMD');
    }
}