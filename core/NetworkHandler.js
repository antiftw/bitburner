import { ConfigurationHandler } from '/src/tools/ConfigurationHandler'
import { Logger } from '/src/tools/Logger'
/**
 * Class to wrap the execution of the scan and diagnose functionality
 * @deprecated has issues with the execution order, which is crucial in some parts of this functionality:
 *             the analyzers require the scanners to be done + public scanner needs botnet scanner to be done
 *             
 */
export class NetworkHandler {
    constructor(ns, verbose) {
        this.ns = ns;
        this.verbose = verbose;
        this.ch = new ConfigurationHandler(ns, verbose);
        this.logger = new Logger(ns, verbose, 'NETWRK');
        this.config;
    }
    async run() {
        try {
            this.logger.notify(`Scanning and analyzing networks. (${this.logger.currentTime()})`);
            this.config = this.ch.getConfig('main');
            let path = this.config.process.commandPath;
            await this.ns.run(`${path}data/remove_data.js`);
            await this.ns.asleep(1000);
            await this.ns.run(`${path}nettools/scan_all.js`);
            await this.ns.asleep(1000);
            await this.ns.run(`${path}nettools/diagnose_all.js`);
            await this.ns.asleep(1000);
            this.logger.notify(`Networks scanned and analyzed. (${this.logger.currentTime()})`);
        }catch(e) {
            this.logger.notify(`Error while scanning network: ${JSON.stringify(e)}`)
        }
    }
}