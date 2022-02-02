import {HacknetAnalyzer} from '/src/analyzer/HacknetAnalyzer.js';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
/** @param {NS} ns **/
export async function main(ns) {
    // This step diagnoses the Hacknet network to fetch all relevant properties for all Hacknet servers
    let context = 'LOOP_9';
    try{
        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        let analyzer = new HacknetAnalyzer(ns);
        await analyzer.run();
        ns.spawn(`${config.main.cmdPath}${config.main.steps.runBotnet}`);
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'DIAHCK');
    }
}