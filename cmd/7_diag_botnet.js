import {BotnetAnalyzer} from '/src/analyzer/BotnetAnalyzer.js';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';

/** @param {NS} ns **/
export async function main(ns) {
    // This step diagnoses the botnet network to fetch all relevant properties for all botnet (read: "purchased") servers
    let context = 'LOOP_7';
    try{
        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        let verbose = ch.determineVerbosity(config.main.verbosity.overrides.diag_botnet);
        let analyzer = new BotnetAnalyzer(ns, verbose);
        await analyzer.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'DIABOT');
    }
}