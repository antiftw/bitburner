import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { Logger } from '/src/tools/Logger';
import { MainLoopHandler } from '/src/core/MainLoopHandler';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
/**
 * Main loop
 * Can be executed using the 'start' alias
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {
    let context = 'LOOPCMD'
    try{
        let forceRefresh = false;
        let resupply = false;
        let resupplyAmount = 0;
        let initConfig = false;

        let logger = new Logger(ns);
        ns.args.forEach(arg => {
            if(arg === '--force' || arg === '--f') {
                forceRefresh = true;
            }else if (arg.includes('--resupply') || arg.includes('--r')) {
                if(arg.includes('=')) {
                    let parts = arg.split('=');
                    logger.log(parts[0] + ' ' + parts[1]);
                    resupplyAmount = parts[1];
                }
                resupply = true;
            }else if(arg === '--init' || arg === '--i') {
                initConfig = true;
            }
        })
        let args = {};
        args.initConfig = initConfig;
        args.resupplyAmount = resupplyAmount;
        args.forceRefresh = forceRefresh;
        
        // initialize MainLoopHandler;
        let loop = new MainLoopHandler(ns);
        await loop.execute(args);
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e);
    }
}