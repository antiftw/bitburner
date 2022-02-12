import {PublicAnalyzer} from '/src/analyzer/PublicAnalyzer.js';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';

/** @param {NS} ns **/
export async function main(ns) {
    // This step diagnoses the public network to fetch all relevant properties for all public servers
    let context = 'LOOP_7';
    try{
        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        let verbose = ch.determineVerbosity(config.main.steps.diagnosePublic.verbosity);
        let analyzer = new PublicAnalyzer(ns, verbose);
        await analyzer.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'DIAPUB');
    }
}


