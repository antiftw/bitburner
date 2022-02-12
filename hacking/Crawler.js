import { Exception } from '/src/entity/Exception.js';
import { ExceptionHandler } from '/src/tools/ExceptionHandler.js';
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler.js';
import { FileHandler } from '/src/tools/FileHandler.js';
import { Logger } from '/src/tools/Logger.js';

export class Crawler {
    constructor(ns, verbose, exclude = [], excludeTypes = []) {
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
        this.excludeTypes = excludeTypes;
        this.literatureFile = '/src/literature.txt';
        this.contractFile = '/src/contracts.txt';
    }

    init(){
        this.servers = this.file.readJson(this.config.public.structure_file);
        if(this.exclude.length === 0) {
            // add the wgh scripts, so they dont clutter our overview
            this.config.main.hacking.scripts.forEach(script => {
                this.exclude.push(`${this.config.main.hacking.path}${script.file}`);
            })
        }
        if(this.excludeTypes.length === 0) {
            // ignore contract files for less clutter
            this.excludeTypes.push('.cct');
        }
    }

    async crawl(grep = null) {
        if (this.servers.length === 0) {
            this.init();
        }

        let literature = '';
        let contracts = '';

        for(let index = 0; index < this.servers.length; index++) {
            
            let srv = this.servers[index];

            if(srv.name === 'home') {
                continue;
            }
            this.logger.log(srv.name)

            let files = [];
            let filteredFiles = [];
            let literatureFiles = [];
            let contractFiles = [];

            if(grep === null) {
                files = this.ns.ls(srv.name);
            }else {
                files = this.ns.ls(srv.name, grep);
            }

            files.forEach(file => {
                let isExcludedByType = false;
                // check if we can match the filetype (substring of filename)
                this.excludeTypes.forEach(exclude => {
                    if(file.includes(exclude)) {
                        isExcludedByType = true;
                    }
                })
                if(!isExcludedByType && !this.exclude.includes(file)) {
                    filteredFiles.push(file);
                }
                if(file.includes('.lit')) {
                    // collect the literature
                    literatureFiles.push(file);
                }
                if(file.includes('.cct')) {
                    // collect all contracts, might come in use later
                    contractFiles.push(`${srv.name}://${file}`)
                }
            })
            if(literatureFiles.length > 0 ) {
                await this.ns.scp(literatureFiles, srv.name, 'home');
            }

            for(let index = 0; index < literatureFiles.length; index++) {
                 // create one big file containing all literature, for an easier read :)
                let file = literatureFiles[index];
                this.logger.log(`reading file ${file}`)
                let fileData = this.file.read(file);
                this.logger.log(`data read: ${fileData}`)
                literature += `${srv.name} => ${file}\n\n${fileData}\n\n======================\n\n`;
            }
            for(let index = 0; index < contractFiles.length; index++) {
                let file = contractFiles[index];
                contracts += `${file}\n\n`;
            }

            this.logger.notify(`${srv.name}`)
            this.logger.line(`------------------`)
            this.logger.notify(`${JSON.stringify(filteredFiles)}`)

        }
        
        await this.file.write(this.literatureFile, literature);
        await this.file.write(this.contractFile, contracts);
    }
}