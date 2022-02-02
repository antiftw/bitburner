import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
/**
 * Execute the all analyzers, can be executed using the "diagnose-all" alias
 * Can be executed using the "diagnose-all" alias
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    let context = 'DIAGALL';
    try{
        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        let path = config.process.nettoolPath;
        await ns.run(`${path}diag_botnet.js`);
        await ns.run(`${path}diag_public.js`);
        await ns.run(`${path}diag_hcknet.js`);
        
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e);
    }
}