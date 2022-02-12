import { PublicScanner } from '/src/scanner/PublicScanner';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
import { Logger } from '/src/tools/Logger';
/**
 * Execute the PublicScanner, which walks the network and saves all the names of the public servers in a file
 * Can be executed using the "trace" alias
 * @param {*} ns
 */
/** @param {NS} ns **/
export async function main(ns) {

    let context = 'PUBLIC-TRACER';
    try{
        let target = '';
        let mode = 'path';
        let logger = new Logger(ns, 2, 'TRACER');
        for(let index = 0; index < ns.args.length; index++) {
            let arg = ns.args[index];
            if(arg === '--help') {
                mode = 'help';
                break;
            }
            if(arg === '--connect') {
                mode = 'connect';
                continue
            }
            target = arg;
        }
        if(mode === 'help') {
            logger.line(112, true);
            logger.notify('This function can be used to calculate the path to a specified host, providing all the hops inbetween.         |');
            logger.notify('Just pass it a servername, and it will return a path from home towards the server.                             |');
            logger.notify('Accepts optional argument `--connect` to give a string containing a command to actually connect to the server. |');
            logger.line(112, true);
            return 0;
        }
        if(target === '' || target === 'home') {
            logger.notify('Please provide a valid target, or type --help for more information.');
            return 1;
        }
        if(!ns.serverExists(target)) {
            logger.notify(`Server [ ${target} ] cannot be found. Please check the spelling and try again.`);
            return 1;
        }

        // run scanner without writing, to initialize internal datastructure which is needed for the trace function
        let scanner = new PublicScanner(ns, 2);
        await scanner.execute(false);
        logger.line(112, true);
        logger.notify('');
        if(mode === 'path') {
            scanner.printHops(target);
        }else {
            scanner.getConnectString(target, true);
        }
        logger.notify('');
        logger.line(112, true);
        return 0;
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e);
    }
}