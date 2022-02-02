import { ExceptionHandler } from '/src/tools/ExceptionHandler';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { Logger } from '/src/tools/Logger';
import { HackingHandler } from '/src/core/HackingHandler';

/** @param {NS} ns **/
export async function main(ns) {
    // This step loops through all our servers, and sees if they need to be enslaved
    // (read: wgh files copied + instructed to attack a target)
    let context = 'LOOP10';
    try{
        let verbose = false;
        let context = 'LOOP13'
        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        let hacker = new HackingHandler(ns, verbose);
        let logger = new Logger(ns, verbose, context)
        let force = false;
        await hacker.run(force);
        logger.line(50, true, '-')
        logger.notify(`Iteration finished at ${logger.currentTime()}`)
        logger.line(50, true, '-')
        ns.spawn(`${config.main.cmdPath}${config.main.steps.divdBudget}`);
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'HACKER');
    }
}