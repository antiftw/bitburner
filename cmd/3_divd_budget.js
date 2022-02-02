import { ExceptionHandler } from '/src/tools/ExceptionHandler'
import { BudgetHandler } from '/src/core/BudgetHandler'
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
/** @param {NS} ns **/
export async function main(ns) {
    // This step divides the general budget according to the percentages configured in the ConfigurationHandler
    let context = 'LOOP_3';
    try{
        let budget = new BudgetHandler(ns);
        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        await budget.run();
        ns.spawn(`${config.main.cmdPath}${config.main.steps.scanBotnet}`);
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'DIVBUD');
    }
}