import { Logger } from "/src/tools/Logger";

/** @param {NS} ns **/
export async function main(ns) {
    let server = ns.args[0];
    let delay = ns.args[1];
    let verbose = false;
    let context = 'GROWER'
    let logger = new Logger(ns, verbose, context);

    if(typeof server === 'undefined') {
        logger.notify('Cannot call grow without passing a server');
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
        logger.log(`Started growing server [ ${server} ] at ${logger.currentTime()}`)
        await ns.grow(server);
        logger.log(`Finished growing server [ ${server} ] at ${logger.currentTime()}`)
    }
    catch(exception) {
        ns.tprint(exception);
    }
}