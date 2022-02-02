import { ExceptionHandler } from '/src/tools/ExceptionHandler'
import { BotnetManager } from '/src/manager/BotnetManager';

/**
 * Execute the BotnetManager, which handles the expansion and upgrading of the botnet network (read "purchased servers")
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    try{
        let botnet = new BotnetManager(ns);
        await botnet.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, 'BOTCMD');
        eh.handle(e);
    }
}