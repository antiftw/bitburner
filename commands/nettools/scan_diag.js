import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
/**
 * Execute the all scanners + analyzers
 * Can be executed using the "scan-diag" alias
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    let failed = true;
    let context = 'SCANDIAG';
    while(failed) {
        try{
            let verbose = false;
            let ch = new ConfigurationHandler(ns, verbose);
            let config = ch.getConfig('main');
            let path = config.process.nettoolPath;
            // We need to scan botnet first, since we need it for the public scan
            let scan = await ns.run(`${path}scan_all.js`);
            // we need to make sure botnet is done scanning before we kick off the next one (public requires it to be finished)
            await ns.asleep(2000);
            let diagnose = await ns.run(`${path}diagnose_all.js`);
            if(scan > 0 && diagnose > 0) {
                // no errors, so we dont need to try again
                failed = false;
            }
        }catch(e){
            let eh = new ExceptionHandler(ns, context);
            eh.handle(e);
            failed = true;
        }
    }
}