import { Crawler } from '/src/hacking/Crawler.js';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
/**
 * Execute the BotnetScanner, which walks the network and saves all the names of the botnet (purchased) servers in a file
 * Can be executed using the "b-scan" alias
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    let grep = ns.args[0];
    let context = 'CRAWL-CMD';
    try{
        let crawler = new Crawler(ns, 2);
        await crawler.crawl(grep);
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e);
    }
}