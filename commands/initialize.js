import { BudgetHandler } from '/src/core/BudgetHandler';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
/**
 * Initializes the application, generating configuration and budget files
 * Can be executed using the 'init' alias
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    let context = 'INITCMD'
    try{
        let ch = new ConfigurationHandler(ns);
        // Initialize the Configuration, writing the config options to a file
        await ch.init();
        // initialize BudgetHandler with enabled set to 'false', because we don't need the running part of the Handler here
        let budget = new BudgetHandler(ns, false, false);
        // Pass 'true' to force initialize, resetting the budgets to zero
        await budget.init(true);
        let config = ch.getConfig('main');
        
        let path = config.process.commandPath;
        // Clear previous data to prevent unexpected behaviour
        await ns.run(`${path}data/remove_data.js`)
        await ns.run(`${path}nettools/scan_all.js`);
        // Wait a bit to make sure scan is complete
        await ns.asleep(2000);
        await ns.run(`${path}nettools/analyze_all.js`);

    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e);
    }
}