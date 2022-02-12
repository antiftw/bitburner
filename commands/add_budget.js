import {BudgetHandler} from '/src/core/BudgetHandler.js';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
/**
 * Used to increase the general budget, so that the BudgetHandler can divide it according to the configuration
 * Can be executed using the "budget-add <amount>" alias. Use "budget-add --help" for more information on the command
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    let amount = ns.args[0];
    let context = 'ADDBUD';
    if( typeof amount === 'undefined') {
       ns.tprint(`[BUDGET] Please specify an amount as argument for this command. Type --help for usage options.`)
       return;
    }
    if(amount === '--help') {
        ns.tprint(`Use this command to allocate an amount to the general budget.`);
        ns.tprint(`Give an amount or use the following suffixes to apply multipliers:`);
        ns.tprint(`'k(ilo)'     : x 1.000`);
        ns.tprint(`'m(illion)'  : x 1.000.000`);
        ns.tprint(`'b(illion)'  : x 1.000.000.000`);
        ns.tprint(`'t(rillion)  : x 1.000.000.000.000`);
        ns.tprint(`Example: 'budget-add 1b'`);
        return;
    }
    if(typeof amount !== 'number') {
        // this means we (are expecting to) have an argument like 10k, 10m or 10b, to apply the associated multiplier
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
            ns.tprint(`Unknown multiplier. Type --help for usage options.`);
            return;
        }
        // remove the last character (keeping the number part and removing the string part) + Apply multiplier
        amount =  multiplier * Number(amount.slice(0, amount.length - 1));
        if(amount == 'NaN') {
            ns.tprint(`Unknown multiplier. Type --help for usage options.`);
            return;
        }
    }

    try{
        // pass 1 because we want to force the notification output to terminal on this command
        let budget = new BudgetHandler(ns, 1);
        await budget.init();
        await budget.increaseBudget(amount);
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e);
    }
}