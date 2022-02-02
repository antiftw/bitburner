
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
/**
 * Script used while testing, not in active use by anything
 * WARNING: Handle with care, since it can cost quite a bit of money deleting all the servers
 * @param {*} ns 
 */
/** @param {NS} ns **/
export async function main(ns) {
    try{
        
        let verbose = true;
        let ch = new ConfigurationHandler(ns, verbose);
        let config = ch.getConfig('main');
        let botnet = fh.readJson(config.botnet.structure_file);
        // delete all the botnet servers
        botnet.forEach(bot => {
            let result = ns.killall(bot.name);
            ns.tprint(`Killed: ${result} -> Deleting ${bot.name}`)
            
           result = ns.deleteServer(bot.name)
           ns.tprint(`Deleted: ${result}`)
        })


    }catch(e){
        ns.tprint(`Error starting all processes: ${e}`)
    }
}