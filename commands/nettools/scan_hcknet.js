import { HacknetScanner } from '/src/scanner/HacknetScanner';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
/**
 * Execute the HacknetScanner, which walks the network and saves all the names of the Hacknet servers in a file
 * Can be executed using the "h-scan" alias
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    let context = 'SCANHCK';
    try{
        let scanner = new HacknetScanner(ns);
        await scanner.execute();
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e);
    }
}