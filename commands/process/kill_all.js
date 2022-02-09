import { FileHandler } from '/src/tools/FileHandler';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { ExceptionHandler } from '/src/tools/ExceptionHandler';
import { Logger } from '/src/tools/Logger';
/** @param {NS} ns **/
export async function main(ns) {
    let context = 'KILALL';
    let eh = new ExceptionHandler(ns, context);
    try{
        let mode = ns.args[0];
        let allowedArguments = ['--home', '--remote', '--all' ];
        if(typeof mode === 'undefined' || !allowedArguments.includes(mode)) {
            mode = '--home';
        }

        let verbose = true;
        let homeServer = 'home';
        
        // todo: encapsulate all this in the processhandler
        //let process = new ProcessHandler(ns, verbose);
        //await process.killProcesses();
        let ch = new ConfigurationHandler(ns, verbose);
        
        let file = new FileHandler(ns, verbose);
        let config = ch.getConfig('main');
        let logger = new Logger(ns, verbose, context);
        let port = config.ports.find(port => port.purpose = 'kill-loop');
        let handlerPath = config.process.handlerPath;
        let commandPath = config.process.commandPath;
        let cmdPath = config.main.cmdPath;
       logger.log(`mode:  ${mode}`)
       
        if(mode === '--all' || mode == '--home' ) {
             // signal the loop to stop looping. sometimes the kill wont do the trick
             // we listen for this interrupt in the beginning of the loop (1_init_config.js)
             await ns.tryWritePort(port.id, 1);
             await ns.kill(`${handlerPath}run_budget.js`, homeServer);
             // //await ns.kill(`${handlerPath}run_process.js`, homeServer);
             await ns.kill(`${handlerPath}run_hcknet.js`, homeServer);
             await ns.kill(`${handlerPath}run_netwrk.js`, homeServer);
             await ns.kill(`${handlerPath}run_botnet.js`, homeServer);
             await ns.kill(`${commandPath}start.js`, homeServer);
             await ns.kill(`${handlerPath} '0_init_looper.js`, homeServer);
             await ns.kill(`${handlerPath} '1_init_config.js`, homeServer);
             await ns.kill(`${handlerPath} '2_incr_budget.js`, homeServer);
             await ns.kill(`${handlerPath} '3_divd_budget.js`, homeServer);
             await ns.kill(`${handlerPath} '4_scan_botnet.js`, homeServer);
             await ns.kill(`${handlerPath} '5_scan_public.js`, homeServer);
             await ns.kill(`${handlerPath} '6_scan_hcknet.js`, homeServer);
             await ns.kill(`${handlerPath} '7_diag_botnet.js`, homeServer);
             await ns.kill(`${handlerPath} '8_diag_public.js`, homeServer);
             await ns.kill(`${handlerPath} '9_diag_hcknet.js`, homeServer);
             await ns.kill(`${handlerPath} '10_run_botnet.js`, homeServer);
             await ns.kill(`${handlerPath} '11_run_public.js`, homeServer);
             await ns.kill(`${handlerPath} '12_run_hcknet.js`, homeServer);
        }

        if(mode === '--all' || mode === '--remote') {
            logger.notify(`Reading files`);
            let botnetServers = file.readJson(config.botnet.data_file);
            let publicServers = file.readJson(config.public.data_file);
            logger.notify(`Files read, botnet servers: ${botnetServers.length} public servers found: ${publicServers.length}`)
            botnetServers.forEach(bot => {
                let result = ns.killall(bot.name);
                logger.log(`Killing all scripts on ${bot.name}, success: [ ${result} ]`);
            })
            publicServers.forEach(pub => {
                // if we dont exclude the homeserver, this script will kill itself
                if(pub.name !== homeServer) {
                    let result = ns.killall(pub.name);
                    logger.log(`Killing all scripts on ${pub.name}, success: [ ${result} ]`);
                }
            })
        }
        ///asdasdasd
    }catch(e){
       eh.handle(e, 'KILLAL');
    }
}