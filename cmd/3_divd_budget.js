import { ExceptionHandler } from '/src/tools/ExceptionHandler'
import { BudgetHandler } from '/src/core/BudgetHandler'
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
/** @param {NS} ns **/
export async function main(ns) {
    // This step divides the general budget according to the percentages configured in the ConfigurationHandler
    let context = 'LOOP_3';
    try{

        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        let verbose = ch.determineVerbosity(config.main.verbosity.overrides.divd_budget);
        let budget = new BudgetHandler(ns, verbose);
        await budget.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'DIVBUD');
    }
}