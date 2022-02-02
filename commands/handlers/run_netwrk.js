import { NetworkHandler } from '/src/core/NetworkHandler';
import { ExceptionHandler } from '/src/tools/ExceptionHandler'
/**
 * Execute the NetworkHandler, which handles the scanning and diagnosis/analysis of the network
 * @param {*} ns
 */
/** @param {NS} ns **/
/** @param {NS} ns **/
export async function main(ns) {
    try{
        let network = new NetworkHandler(ns);
        await network.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, 'NETCMD');
        eh.handle(e);
    }
}