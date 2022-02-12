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
        let verbose = true;
        let ch = new ConfigurationHandler(ns, verbose);
        // Initialize the Configuration, writing the config options to a file
        await ch.init();
        // initialize BudgetHandler with enabled set to 'false', because we don't need the running part of the Handler here
        let budget = new BudgetHandler(ns, verbose, false);
        // Pass 'true' to force initialize, resetting the budgets to zero
        await budget.init(true);
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e);
    }
}