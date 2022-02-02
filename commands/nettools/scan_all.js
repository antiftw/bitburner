import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
import { Logger } from '/src/tools/Logger';
/**
 * Execute the all scanners
 * Can be executed using the "scan-all" alias
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    let failed = true;
    let context = 'SCANALL';
    if(failed) {
        try{
            let verbose = true;
            let ch = new ConfigurationHandler(ns, verbose);
            let logger = new Logger(ns, verbose);
            let config = ch.getConfig('main');
            let path = config.process.nettoolPath;
            // We need to scan botnet first, since we need it for the public scan
            let botnet = await ns.run(`${path}scan_botnet.js`);
            // we need to make sure botnet is done scanning before we kick off the next one (public requires it to be finished)
            await ns.asleep(1000);
            let hacknet = await ns.run(`${path}scan_hcknet.js`);
            let servers = await ns.run(`${path}scan_public.js`);
            
            if(botnet > 0 && hacknet > 0 && servers > 0) {
                // no errors, so we dont need to try again
                failed = false;
            }
            await ns.asleep(2000);
        }catch(e){
            let eh = new ExceptionHandler(ns, context);
            eh.handle(e);
            failed = true;
        }
    }
}