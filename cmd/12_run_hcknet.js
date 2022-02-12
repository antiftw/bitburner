import { ExceptionHandler } from '/src/tools/ExceptionHandler';
import { HacknetManager } from '/src/manager/HacknetManager';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';

/** @param {NS} ns **/
export async function main(ns) {
    // This step uses the allocated budget to expand/upgrade the Hacknet network
    let context = 'LOOP10';
    try{
        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        let verbose = ch.determineVerbosity(config.main.steps.runHacknet.verbosity);
        let hacknet = new HacknetManager(ns, verbose);
        await hacknet.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'HCKCMD');
    }
}