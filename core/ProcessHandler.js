import { Exception } from "/src/entity/Exception"
import { PortHandler } from "/src/core/PortHandler";
import { Process } from "/src/entity/Process";
import { ConfigurationHandler } from "/src/tools/ConfigurationHandler";
import { Logger } from "/src/tools/Logger";
/**
 * Class to wrap the whole execution of processes - needs work
 * @notused at the moment
 */
export class ProcessHandler {
    constructor(ns, verbose) {
        this.ns = ns;
        this.verbose = verbose;
        this.processes;
        this.ch = new ConfigurationHandler(ns);
        this.ph = new PortHandler(ns, verbose);
        this.logger = new Logger(ns, verbose, 'PROCES');
        this.config = {};
        this.handlerPath;
        this.portPurpose = 'start-process'
        
    }
    async run() {
        this.initialize();
        this.ph.initialize(this.portPurpose);
        while(true) {
            try{
                if(!this.ph.empty()){
                    let process = this.ph.read();
                    let processName = process[0];
                    let threads = Number(process[1]);
                    let server = process[2];
                    let params = this.ph.read();
                    this.logger.notify(`Starting proces ${name}`)
                    this.startProcess(processName, threads, server, params);
                }else {
                    this.logger.log('No process requests present, hibernating...')
                    await this.ns.asleep(this.processConfig.processes.processHandler.param.sleepDuration);
                }
            }catch(e){
                this.logger.log(`Error while running ProcessHandler: ${JSON.stringify(e)}`)
            }
            await this.ns.asleep(1000);
        }
    }
    initialize(){
        this.config = this.ch.getConfig('main');
        this.processConfig = this.config.process;
        this.handlerPath = this.processConfig.handlerPath;
        this.processes = [];
    }

    async addProcess(name, threads = 1, server = 'home', params = []) {
        if(this.config === {}) {
            // make sure we are initialized
            this.initialize();
        }
        await this.ph.write([name, String(threads), server])
        await this.ph.write(params);
        this.logger.log(this.ph.peek());
    }

    async startProcess(name, threads = 1, server = 'home', params = []){
        if(this.config === {}) {
            // make sure we are initialized
            this.initialize();
        }
        try{
            let executable = this.getExecutable(name);

            this.logger.notify(`Starting process [${name}] on [${server}] with [${threads}] threads`)
            // these need to be formatted, since it is an object, not a string[]
            let allParameters = this.formatParams(executable.param);
            allParameters = allParameters.join(params);
            // start the process
            let pid = await this.ns.exec(`${this.handlerPath}${executable.file}`, server, threads, allParameters);

            let process = new Process(pid, name, threads, server);
            this.processes.push(process);

            return pid;
        }catch(e){
            this.logger.notify(`Error starting process ${name}: ${JSON.stringify(e)}`)
        }
    }
    getExecutable(name) {
        let processes = this.config.process.processes;
        let result = {};
        processes.forEach(process => {
            if(process.name === name) {
                result = { file: process.file, param: process.param } ;
            }
        })
        if(result === {}) {
            throw new Exception(`No configuration found for ${name}`)
        }else {
            return result;
        }
    }
    formatParams(params){
        let result = []
        Object.values(params).forEach(param => {
            result.push(param)
        })
        return result;
    }
    killProcesses(){

    }
}