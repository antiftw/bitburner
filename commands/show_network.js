import { DisplayHandler } from '/src/core/DisplayHandler';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
/**
 * Show relevant network information
 * Can be executed by using the 'show-network' alias. Accepts two arguments:
 * @param {*} ns
 * @argument {string} queryType: Allows you to search the networks, can be either 'all' (default), 'server' or 'network'
 *                               - All will show all networks, however it excludes the non-rooted public servers
 *                               - Network will show an entire network specified by the 'query' argument
 *                               - Server will also show an entire network, and highlight the specified server in 'query'
 * @argument {string} query: the query to search for, can be 'botnet', 'hacknet', or 'public', when queryType = 'network'
 *                           or any (partial) servername when queryType = 'server' (e.g. 'srv13.anti', or 'node-14')
 * @returns void
 */
/** @param {NS} ns **/
export async function main(ns) {
    let context = 'SHOWNET'
    try{
        let queryType = ns.args[0];
        let query = ns.args[1];

        if(typeof queryType !== 'undefined' && typeof query === 'undefined') {
            ns.tprint(`The second argument cannot be missing when the first is given, please provide a query for your search`);
            return;
        }

        if(typeof queryType === 'undefined') {
            queryType = 'all';
        }else if(queryType !== 'network' && queryType !== 'server' && queryType !== 'all') {
            ns.tprint(`The first argument can only be 'network', 'server', or 'all'`);
            return;
        }

        let display = new DisplayHandler(ns, true);
        await display.init();
        await display.showNetwork(queryType, query);

    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e);
    }
}