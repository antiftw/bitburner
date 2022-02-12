import { ExceptionHandler } from '/src/tools/ExceptionHandler';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { PublicManager } from '/src/manager/PublicManager';

/** @param {NS} ns **/
export async function main(ns) {
    // This step checks if there are new servers that can be rooted and are not rooted yet, and if so, tries to root them
    let context = 'LOOP11';
    try{
        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        let verbose = ch.determineVerbosity(config.main.steps.runPublic.verbosity);
        let publicManager = new PublicManager(ns, verbose);
        await publicManager.run();
    }catch(e){
        let eh = new ExceptionHandler(ns, context);
        eh.handle(e, 'PUBCMD');
    }
}