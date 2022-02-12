import { PortHandler } from "/src/core/PortHandler";
import { ProcessHandler } from "/src/core/ProcessHandler";
import { BudgetHandler } from "/src/core/BudgetHandler";
import { ConfigurationHandler } from "/src/tools/ConfigurationHandler";
import { FileHandler } from "/src/tools/FileHandler";
import { Logger } from "/src/tools/Logger"
import { HackingHandler } from "/src/core/HackingHandler";
/**
 * Used for testing
 * Can be executed by using the 'test' alias
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {

    try{
       let test1 = new Date();
        let verbose = true;
        let ch = new ConfigurationHandler(ns, verbose);
        let config = new ConfigurationHandler(ns, verbose).getConfig('main');
        
        let fh = new FileHandler(ns, verbose);
        let logger = new Logger(ns, verbose, 'TEST')
        logger.notify('TEST ALIVE')

        //let manager = new BudgetHandler(ns, verbose);
        //let proces = new ProcessHandler(ns, verbose);
        // let port = new PortHandler(ns, verbose);
        // port.initialize('start-process');
        // await port.write(['test', '2']);
        // let data = port.peek();
        // ns.tprint(JSON.stringify(data));
        //ns.exec('/src/commands/handlers/run_budget.js', 'home', 1);
        //let current = ns.getPurchasedServers();
        //let exists = fh.fileExists('/src/wgh/w.js', 'srv12.antiftw.nl')
       // logger.log(`Exists : ${JSON.stringify(ns.ps('home'))}`);
        let port = config.ports.find(port => port.purpose = 'request-reassesment')
       // await ns.tryWritePort(port.id, 1);
        let handle = ns.getPortHandle(port.id);
        ns.tprint(handle.read());
        let player = ns.getPlayer();
        let server = ns.getServer('alpha-ent');
   
        logger.notify(`srv: ${JSON.stringify(server)}`)
        logger.notify(`grow percentage: ${ns.formulas.hacking.growPercent(server, 1, player, 1 )}`)
        logger.notify(`grow time: ${ns.formulas.hacking.growTime(server, player ) / 1000 / 60}`)
        logger.notify(`hack chance: ${ns.formulas.hacking.hackChance(server, player )}`)
        logger.notify(`hack exp: ${ns.formulas.hacking.hackExp(server, player )}`)
        logger.notify(`hack percent: ${ns.formulas.hacking.hackPercent(server, player )}`)
        logger.notify(`hack time: ${ns.formulas.hacking.hackTime(server, player ) / 1000 / 60}`)
        logger.notify(`weaken time: ${ns.formulas.hacking.weakenTime(server, player ) / 1000 / 60}`)
        

        
    
    }catch(e){
        ns.tprint(`Something went wrong T3ST1NG. Exception: ${e}`);
    }
}


