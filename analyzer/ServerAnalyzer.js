import { FileHandler } from "/src/tools/FileHandler";
import { ServerManager } from "/src/manager/ServerManager";
import { ConfigurationHandler } from "/src/tools/ConfigurationHandler";
import { ExceptionHandler } from '/src/tools/ExceptionHandler'
import { Logger } from '/src/tools/Logger'

/**
 * Base class for all analyzers
 */
export class ServerAnalyzer {
    constructor(ns, verbose = false, context = 'SERVER'){
        this.ns = ns;
        this.verbose = verbose;
        this.context = context;
        this.manager = new ServerManager(ns, verbose);
        this.servers = [];
        this.file = new FileHandler(ns, verbose);
        this.ch = new ConfigurationHandler(ns, verbose);
        this.eh = new ExceptionHandler(ns, context);
        this.logger = new Logger(ns, verbose, context);
        this.structureFile;
        this.dataFile;
    }

    /**
     * Run the analyzer => read structure files, lookup relevant values and write data files
     */
    async run(){
        try{
            this.init();
            this.logger.log(`Starting networkanalysis, servers to analyze: [ ${this.servers.length} ]`);
            this.analyze();
            this.logger.notify(`Analysis complete -> ${this.servers.length} servers analyzed`);
            await this.file.writeJson(this.dataFile, this.servers);
        }catch(e) {
             this.eh.handle(e, 'RUN');
        }
    }

    /**
     * Initialize all settings, read configruation and serverstructure
     */
    init() {
        // this is a stub/template and will itself not be run, but rather overwritten in the extended analyzers.
        this.loadConfig();
    };

    /**
    * Do the analysis, implementation in extended classes
    */
    analyze(){}

    /**
     * Read the configuration file
     */
    loadConfig(){
        try{
            this.config = this.ch.getConfig('main');
        }catch(e) {
            this.eh.handle(e, 'LOAD-CONFIG');
        }
    }
}