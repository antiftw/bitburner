import { Exception } from '/src/entity/Exception.js';
import { ExceptionHandler } from '/src/tools/ExceptionHandler.js';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler.js';
import { FileHandler } from '/src/tools/FileHandler.js';
import { Logger } from '/src/tools/Logger.js';

export class Crawler {
    constructor(ns, verbose, exclude = []) {
        this.ns = ns;
        this.verbose = verbose;
        this.context = 'CRAWLER';
        this.ch = new ConfigurationHandler(ns, verbose);
        this.config = this.ch.getConfig('main');
        this.eh = new ExceptionHandler(ns, this.context);
        this.logger = new Logger(ns, this.context);
        this.file = new FileHandler(ns, verbose);
        this.servers = [];
        this.exclude = exclude;
    }

    init(){
        this.servers = this.file.readJson(this.config.public.structure_file);
        if(this.exclude.length === 0) {
            // add the wgh scripts
            this.config.main.hacking.scripts.forEach(script => {
                this.exclude.push(`${this.config.main.hacking.path}${script.file}`);
            })
            
        }
    }

    crawl() {
        if (this.servers.length === 0) {
            this.init();
        }

        this.servers.forEach(srv => {
            let files = this.ns.ls(srv.name);
            let filteredFiles = [];
            files.forEach(file => {
                if(!this.exclude.includes(file)) {
                    filteredFiles.push(file);
                }
            })

            this.ns.tprint(`${srv.name}`)
            this.ns.tprint(`------------------`)
            this.ns.tprint(`${JSON.stringify(filteredFiles)}`)
        })
    }
}