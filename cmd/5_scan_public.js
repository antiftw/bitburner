import { PublicScanner } from '/src/scanner/PublicScanner.js';
import { ExceptionHandler } from '/src/tools/ExceptionHandler'
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';

/** @param {NS} ns **/
export async function main(ns) {
    // This step scans the public network to identify all public servers
    let context = 'LOOP_5';
    try{
        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        let verbose = ch.determineVerbosity(config.main.verbosity.overrides.scan_public);
        let scanner = new PublicScanner(ns, verbose);
        await scanner.execute();
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'SCAN-PUB');
    }
}