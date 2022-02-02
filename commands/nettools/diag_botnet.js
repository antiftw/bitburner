import {BotnetAnalyzer} from '/src/analyzer/BotnetAnalyzer.js';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
/**
 * Execute the BotnetAnalyzer, which handles the diagnosis/analysis of the botnet network
 * Can be executed using the "b-diag" alias
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    let context = 'BOTDIAG';
    try{
        let analyzer = new BotnetAnalyzer(ns);
        await analyzer.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e);
    }
}


