import {PublicAnalyzer} from '/src/analyzer/PublicAnalyzer.js';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
/**
 * Execute the PublicAnalyzer, which handles the diagnosis/analysis of the public network
* Can be executed using the "p-diag" alias
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    let context = 'PUBDIAG';
    try{
        let analyzer = new PublicAnalyzer(ns);
        await analyzer.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e);
    }
}


