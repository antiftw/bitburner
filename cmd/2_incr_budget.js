
import { ExceptionHandler } from '/src/tools/ExceptionHandler'
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { BudgetHandler } from '/src/core/BudgetHandler'
import { Logger } from '/src/tools/Logger';

/** @param {NS} ns **/
export async function main(ns) {
    // This step increases the budget with a specified amount (if applicable)
    let context = 'LOOP_2';
    let eh = new ExceptionHandler(ns, context);
    try{

        let forceRefresh = ns.args[0];
        let amount = ns.args[1];
        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        let verbose = ch.determineVerbosity(config.main.verbosity.overrides.incr_budget);
        let logger = new Logger(ns, verbose, context);
        let bh = new BudgetHandler(ns, verbose);


        if(forceRefresh) {
            bh.init();
        }
        if( typeof amount === 'undefined') {
            amount = 0;
        }
        if(typeof amount !== 'number') {
            // this means we (are expecting to) have an argument like 43k, 2m, 1b or 100t to apply the associated multiplier
            let multiplier = 1;
            if(amount.slice(-1) === 'k') {
                multiplier = 1000;
            }else if(amount.slice(-1) === 'm') {
                multiplier = 1000000;
            }else if(amount.slice(-1) === 'b') {
                multiplier = 1000000000;
            }else if(amount.slice(-1) === 't') {
            multiplier = 1000000000000;
            }else {
                logger.notify(`Unknown multiplier. Type --help for usage options.`);
                return;
            }
            // remove the last character (keeping the number part and removing the string part) + Apply multiplier
            amount =  multiplier * Number(amount.slice(0, amount.length - 1));
            if(amount == 'NaN') {
                logger.notify(`Unknown multiplier. Type --help for usage options.`);
                return;
            }
        }
        
        try{
            // Do the actual work, add the calculated amount to the general budget
            if(amount > 0) {
                let budget = new BudgetHandler(ns);
                await budget.init();
                await budget.increaseBudget(amount);
            }
        }catch(e){
            eh.handle(e, 'INCBUD');
        }
    }catch(e){
        eh.handle(e, 'INCBUD');
    }
}