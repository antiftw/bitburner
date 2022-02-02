import { Logger } from "/src/tools/Logger";

/** @param {NS} ns **/
export async function main(ns) {
    let server = ns.args[0];
    let verbose = false;
    let context = 'GROWER'
    let logger = new Logger(ns, verbose, context);
    try{
        logger.log(`Started growing server [ ${server} ] at ${logger.currentTime()}`)
        await ns.grow(server);
    }
    catch(exception) {
        ns.tprint(exception);
    }
}