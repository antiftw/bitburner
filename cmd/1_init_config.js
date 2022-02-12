import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { ExceptionHandler } from '/src/tools/ExceptionHandler'
import { Logger } from '/src/tools/Logger';

/** @param {NS} ns **/
export async function main(ns) {
    // This step writes the configuration file, calculates the budget to be added (if applicable)
    let context = 'LOOP_1';
    try{
        // Read arguments
        let forceRefresh = ns.args[0];
        let resupply = ns.args[1];
        let resupplyAmount = '1b';
        let ch = new ConfigurationHandler(ns);
        // Action of this step => initialize configuration and write that config to a file
        await ch.init();
        // Fetch the config so we can use it, since we need it to determine the verbosity for this step
        let config = ch.getConfig('main');
        let verbose = ch.determineVerbosity(config.main.steps.initConfig.verbosity);
        let logger = new Logger(ns, verbose, context);

        // Check the arguments
        if(typeof forceRefresh === 'undefined') {
            forceRefresh = false;
        }else if(forceRefresh ==='--force' || forceRefresh === '--f'){
            forceRefresh = true;
        }
     
        logger.log(`resupply: ${resupply}`)
        if(typeof resupply === 'undefined') {
            resupply = false;
        }else if(resupply.includes('--resupply') || resupply.includes('--r')) {
            
            if(resupply.includes('=')) {
                let parts = resupply.split('=');
                logger.log(parts[0] + ' ' + parts[1])
                resupplyAmount = parts[1]
            }
            resupply = true;
        }
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'INICFG');
    }
}