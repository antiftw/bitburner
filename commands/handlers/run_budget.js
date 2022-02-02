import { ExceptionHandler } from '/src/tools/ExceptionHandler'
import { BudgetHandler } from '/src/core/BudgetHandler.js';

/**
 * Execute the BudgetHandler, which handles the increasing and assigning of the budgets
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    try{
        let budget = new BudgetHandler(ns);
        await budget.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, 'BUDCMD');
        eh.handle(e);
    }
}