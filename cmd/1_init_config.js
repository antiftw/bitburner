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
        await ch.init();
        let config = ch.getConfig('main');
        let verbose = ch.determineVerbosity(config.main.verbosity.overrides.init_config);

        let logger = new Logger(ns, verbose, context);
        
        logger.log(`Configuration initialized`);
        let port = config.ports.find(port => port.purpose = 'kill-loop')
        let killSignalFromCommand = ns.readPort(port.id);
        if(killSignalFromCommand !== 'NULL PORT DATA') {
            logger.notify(`Kill signal received: terminating...`)
            return 1;
        }
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