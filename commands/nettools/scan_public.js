import { PublicScanner } from '/src/scanner/PublicScanner.js';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
/**
 * Execute the PublicScanner, which walks the network and saves all the names of the public servers in a file
 * Can be executed using the "p-scan" alias
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    let context = 'SCANPUB';
    try{
        let scanner = new PublicScanner(ns, true);
        await scanner.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e);
    }
}