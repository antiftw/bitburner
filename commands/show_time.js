import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { Logger } from '/src/tools/Logger';
import { MainLoopHandler } from '/src/core/MainLoopHandler';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
/**
 * Main loop
 * Can be executed using the 'start' alias
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    let full = ns.args [0];
    let context = 'TIME'

    if(typeof full === 'undefined') {
        full = false
    }else {
        full = true;
    }
    try {
        let logger = new Logger(ns, true, context);
        logger.notify(logger.currentTime(full));
    }catch(e) {
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e);
    }
}