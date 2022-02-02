import { ExceptionHandler } from '/src/tools/ExceptionHandler'
import { PublicManager } from '/src/manager/PublicManager';

/**
 * Execute the PublicManager, which handles the expansion and upgrading of the public network, the hackable servers
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    try{
        let publicManager = new PublicManager(ns, true);
        await publicManager.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, 'PUBCMD');
        eh.handle(e);
    }
}