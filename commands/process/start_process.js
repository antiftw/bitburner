import { Exception } from '/src/entity/Exception'
import { ProcessHandler } from '/src/core/ProcessHandler';
/** @param {NS} ns **/
export async function main(ns) {
    try{
        let processName = ns.args[0];
        let server = ns.args[1]
        let threads = ns.args[2];

        let params = [];
        for(let index = 2; index < ns.args.length; index++) {
            params.push(ns.args[index]);
        }
        if (typeof processName === 'undefined') {
            throw new Exception(`First argument (processName) missing. Aborting`);
        }
        if(typeof server === 'undefined') {
            server = 'home'
        }
        if(typeof threads === 'undefined') {
            threads = 1;
        }
        let process = new ProcessHandler(ns, true);
        process.initialize();
        await process.addProcess(processName, server, threads, params);
    }catch(e){
        ns.tprint(`[PROCES] Error encountered while starting process: ${JSON.stringify(e)}`);
    }
}