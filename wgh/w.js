import { Logger } from "../tools/Logger";

/** @param {NS} ns **/
export async function main(ns) {
    let server = ns.args[0];
    let verbose = false;
    let context = 'WEAKEN'
    let logger = new Logger(ns, verbose, context);
    try{
        logger.log(`Started weakening server [ ${server} ] at ${logger.currentTime()}`)
        await ns.weaken(server);
    }
    catch(exception) {
        ns.tprint(exception);
    }
}