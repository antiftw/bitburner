import { ExceptionHandler } from '/src/tools/ExceptionHandler';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { Logger } from '/src/tools/Logger';
import { HackingHandler } from '/src/core/HackingHandler';

/** @param {NS} ns **/
export async function main(ns) {
    // This step loops through all our servers, and sees if they need to be enslaved
    // (read: wgh files copied + instructed to attack a target)
    let context = 'LOOP13';
    try{
        let force = ns.args[0];
        if(typeof force === 'undefined') {
            force = false;
        }
        let ch = new ConfigurationHandler(ns);
        await ch.init();
        let config = ch.getConfig('main');
        let verbose = ch.determineVerbosity(config.main.steps.runHacker.verbosity);

        let hacker = new HackingHandler(ns, verbose);
        await hacker.execute(force);

    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'HACKER');
    }
}