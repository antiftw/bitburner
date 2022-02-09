import { BotnetScanner } from '/src/scanner/BotnetScanner.js';
import { ExceptionHandler } from '/src/tools/ExceptionHandler'
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
/** @param {NS} ns **/
export async function main(ns) {
    // This step scans the botnet network to identify all botnet (read: "purchased") servers
    let context = 'LOOP_4';
    try{
        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        let verbose = ch.determineVerbosity(config.main.verbosity.overrides.scan_botnet);
        let scanner = new BotnetScanner(ns, verbose);
        await scanner.execute();
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'SCAN-BOT');
    }
}