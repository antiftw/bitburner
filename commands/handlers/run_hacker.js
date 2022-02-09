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
        let hacker = new HackingHandler(ns, verbose);
        let force = false;
        await hacker.run(force);
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'HACKER');
    }
}