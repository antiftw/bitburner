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
        let scanner = new BotnetScanner(ns);
        await scanner.run();
        ns.spawn(`${config.main.cmdPath}${config.main.steps.scanPublic}`);
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'SCABOT');
    }
}