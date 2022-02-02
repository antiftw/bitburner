import { Exception } from "/src/entity/Exception"
import { Process } from "/src/entity/Process";
import { ConfigurationHandler } from "/src/tools/ConfigurationHandler";
import { Logger } from "/src/tools/Logger";
/**
 * Wrapper to wrap the games port handling functionality
 * @notused at the moment
 */
export class PortHandler {
    constructor(ns, verbose) {
        this.ns = ns;
        this.verbose = verbose;
        this.ports = [];
        this.queue = [];
        this.ch = new ConfigurationHandler(ns);
        this.logger = new Logger(ns, verbose, 'PORT');
        this.config;
        this.details;
    }
    initialize(purpose){
        this.logger.log(`Initializing portHandler`);
        this.config = this.ch.getConfig('main');
        this.ports = this.config.ports;
        this.logger.log(`PortHandler Initialized: ${this.ports.length} ports found`)
        this.details = this.getPortDetails(purpose);
    }
    getPortDetails(purpose) {
        this.logger.log(`Fetching port details`);
        this.logger.log(JSON.stringify(this.ports))
        let result = null;
        this.ports.forEach( port => {
            result = null;
            this.logger.log(`${port.purpose}, ${purpose}`)
            if(port.purpose == purpose) {
                this.logger.log(`Match found for port [${purpose}]`)
                result = port;
            }
        });
        return result;
    }
    checkPurpose(id) {
        this.logger.log(`Checking ports: ${this.ports.length} configured ports available.`)
        let result = null;
        this.ports.forEach( port => {
            if(port.id === id) {
                this.logger.log(`Match found for port ${id}`)
                result = port;
            }
        });
       return result;
    }

    async write(data, id = null){
        this.logger.log(this.details)
        if(id === null) {
            // No id given, means we are going for the default port, configured by calling this.initialize()
            id = this.details.id
        }
        let port = this.checkPurpose(id);
        if (port === null) {
            throw new Exception(`Port with ${id} id not defined in configuration. Aborting writing to port.`)
        }
        this.logger.log(JSON.stringify(port))
        
        let dataType = typeof data;
        if(!port.payload.includes(dataType)) { 
            throw new Exception(`Can only write data of type [${port.payload}] to port ${id}, [${dataType}] given. Aborting writing to port.`)
        }
        try {
            this.logger.log(`Writing to port ${id}`)
            let port = this.getPortHandle(id);

            if(!port.full()){
                this.logger.log(`Port ${id} not full, trying to write`)
                await port.tryWrite(data);
            }else{
                this.logger.notify(`Not writing ${data} to port ${id}: port is full.`)
            }
        }catch(e) {
             this.logger.notify(`Error writing port: ${JSON.stringify(e)}`)
        }
    }
    read(id = null, pop = true){
        try {
            if(id === null) {
                // No id given, means we are going for the default port, configured by calling this.initialize()
                id = this.details.id
            }
            let port = this.getPortHandle(id);
            if(port.empty()) {
                this.logger.log(`No data from port ${id}: port is emtpy`)
                return null;
            }
           if(pop) {
               return port.read();
            }
            return  port.peek();
        }catch(e){
            this.logger.notify(`Error reading port ${id}: ${JSON.stringify(e)}`)
        }
    }
    empty(id = null){
        if(id === null) {
            // No id given, use default id
            id = this.details.id
        }
        let port = this.getPortHandle(id);
        return port.empty();
    }
    peek(id = null){
        if(id === null) {
            // No id given, use default id
            id = this.details.id
        }
        let port = this.getPortHandle(id);
        return port.peek();
    }
    clear(id) {
        let port = this.ns.getPortHandle(id);
        port.clear();
    }

    getPortHandle(id) {
        return this.ns.getPortHandle(id);
    }

}