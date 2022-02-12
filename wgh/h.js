import { Logger } from "/src/tools/Logger";

/** @param {NS} ns **/
export async function main(ns) {
    let server = ns.args[0];
    let delay = ns.args[1];
    let verbose = false;
    let context = 'HACKER'
    let logger = new Logger(ns, verbose, context);

    if(typeof server === 'undefined') {
        logger.notify('Cannot call hack without passing a server');
        return;
    }

    if(typeof delay === 'undefined') {
        delay = 0;
    }

    try{
        logger.log(`Script started at ${logger.currentTime()}`)
        if(delay > 0) {
            this.logger.log(`Waiting for ${delay / 60 / 1000} minutes`)
            await  ns.asleep(delay);
        }
        logger.log(`Started hacking server [ ${server} ] at ${logger.currentTime()}`)
        await ns.hack(server);
        logger.log(`Finished hacking server [ ${server} ] at ${logger.currentTime()}`)
    }
    catch(exception) {
        ns.tprint(exception);
    }
}