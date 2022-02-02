import {ProcessHandler} from '/src/core/ProcessHandler';
import { ExceptionHandler } from '/src/tools/ExceptionHandler'
/**
 * Execute the HacknetManager, which handles the execution of processes
 * This is not actively used, but was an idea to also encapsulate all the processmanagement in its own class
 * @param {*} ns
 */

/** @param {NS} ns **/
export async function main(ns) {
    try{
        let process = new ProcessHandler(ns, true);
        await process.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, 'PROCES');
        eh.handle(e);
    }
}