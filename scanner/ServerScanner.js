import { ConfigurationHandler } from "/src/tools/ConfigurationHandler";
import { Server } from "/src/entity/server/Server";
import { FileHandler } from "/src/tools/FileHandler";
import { Logger } from "/src/tools/Logger"
/**
 * Base class for all scanners
 */
export class ServerScanner {
    constructor(ns, verbose, exclude = [], context = 'SERVER'){
        this.ns = ns;
        this.home = 'home';
        this.exclude = exclude;
        this.servers = [];
        this.context = context;
        this.logger = new Logger(ns, verbose, context)
        this.file = new FileHandler(ns, verbose);
        this.ch = new ConfigurationHandler(ns, verbose);
        this.structureFile;
    }
    /**
     * Run the actual scanner, traversing the network and saving the names of all servers that were observed
     */
    async run(){
        try{
            this.init();
            this.scanNetwork();
            this.logger.notify(`Scan complete -> ${this.servers.length} server(s) detected.`);
            await this.file.writeJson(this.structureFile, this.servers);
        }catch(e) {
            this.logger.log(`Error scanning network, exception:  ${e}`)
        }
    }
    /**
     * Initialize data required to run
     */
    init(){
        // This is a stub and will not actually be run. Its more of a template where network specific functions can be placed
        // Which will be overridden in the extended versions
        this.loadConfig();
    }
    /**
     * Load configuration from file
     */
    loadConfig(){
        this.config = this.ch.getConfig('main');
    }
    /**
     * Scan a host to get its neighbours
     * @param {string} host to scan
     * @returns neighbouring servers to the specified host
     */
    scan(host){
        let hosts = this.ns.scan(host);
        let result = [];
        hosts.forEach(srv => {
            let server = new Server(ns, srv, host);
            result.push(server);
        });
        return result;
    }
    /**
     * Scan the network
     */
    scanNetwork(){};
}