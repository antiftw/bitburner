import { ExceptionHandler } from '/src/tools/ExceptionHandler'
import { HacknetManager } from '/src/manager/HacknetManager';

/**
 * Execute the HacknetManager, which handles the expansion and upgrading of the Hacknet network 
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    try{
        let hacknet = new HacknetManager(ns);
        await hacknet.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, 'HCKCMD');
        eh.handle(e);
    }
}