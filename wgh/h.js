import { Logger } from "/src/tools/Logger";

/** @param {NS} ns **/
export async function main(ns) {
    let server = ns.args[0];
    let verbose = false;
    let context = 'HACKER'
    let logger = new Logger(ns, verbose, context);
    try{
        logger.log(`Started hacking server [ ${server} ] at ${logger.currentTime()}`)
        await ns.hack(server);
    }
    catch(exception) {
        ns.tprint(exception);
    }
}