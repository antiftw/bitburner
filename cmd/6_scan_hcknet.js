import { HacknetScanner } from '/src/scanner/HacknetScanner';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';

/** @param {NS} ns **/
export async function main(ns) {
    // This step scans the Gacknet network to identify all Hacknet servers
    let context = 'LOOP_6';
    try{
        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        let scanner = new HacknetScanner(ns);
        await scanner.run();
        ns.spawn(`${config.main.cmdPath}${config.main.steps.diagnoseBotnet}`);
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'SCAHCK');
    }
}