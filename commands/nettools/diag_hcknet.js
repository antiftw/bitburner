import {HacknetAnalyzer} from '/src/analyzer/HacknetAnalyzer.js';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
/**
 * Execute the HacknetAnalyzer, which handles the diagnosis/analysis of the Hacknet network
 * Can be executed using the "h-diag" alias
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    let context = 'HCKDIAG';
    try{
        let analyzer = new HacknetAnalyzer(ns);
        await analyzer.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e);
    }
}