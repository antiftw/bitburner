import { FileHandler } from "/src/tools/FileHandler.js";
import { ExceptionHandler } from "/src/tools/ExceptionHandler.js";
import { Logger } from "/src/tools/Logger.js";
/**
 * Handles all the configuration that is used between seperate parts of the application
 */
export class ConfigurationHandler {
    constructor(ns, verbose = false) {
        this.ns = ns;
        this.verbose = verbose;
        this.context = 'CONFIG'
        this.config = {};
        this.logger = new Logger(ns, verbose, this.context);
        this.eh = new ExceptionHandler(ns, this.context);
        this.file = new FileHandler(ns, verbose);
        this.configs = ['main']
    }
    /**
     * Writes the configuration to a file so other parts of the application can use it
     * @returns void
     */
    async init() {

        try{
            await this.writeConfig({
                ports: [
                    {
                        id: 1,
                        purpose: 'start-process',
                        payload: ['string', 'object'],
                    },
                    {
                        id: 2,
                        purpose: 'kill-loop',
                        payload: ['int']
                    },
                ],
                main: {
                    cmdPath: '/src/cmd/',
                    // @todo: integrate this instead of the current solution, maybe allowing specific scripts to overwrite this value
                    // Manage the level of verbosity of the scripts
                    verbosity:1,
                    hacking: {
                        path: '/src/wgh/',
                        scripts: [
                            {
                                name: 'weaken',
                                file: 'w.js',
                            },
                            {
                                name: 'grow',
                                file: 'g.js',
                            },
                            {
                                name: 'hack',
                                file: 'h.js'
                            },
                        ],
                    },
                    steps: {
                        initLoop: '0_init_looper.js',
                        initConfig: '1_init_config.js',
                        incrBudget: '2_incr_budget.js',
                        divdBudget: '3_divd_budget.js',
                        scanBotnet: '4_scan_botnet.js',
                        scanPublic: '5_scan_public.js',
                        scanHacknet: '6_scan_hcknet.js',
                        diagnoseBotnet: '7_diag_botnet.js',
                        diagnosePublic: '8_diag_public.js',
                        diagnoseHacknet: '9_diag_hcknet.js',
                        runBotnet: '10_run_botnet.js',
                        runPublic: '11_run_public.js',
                        runHacknet: '12_run_hcknet.js',
                        runHacker: '13_run_hacker.js',
                
                    },
                },
                botnet : {
                    data_file: '/src/data/botnet_data.txt',
                    structure_file: '/src/data/botnet_structure.txt',
                    name_template: 'srv[id].antiftw.nl',
                    // the minimum amount of ram the BotnetManager is allowed to buy new nodes with
                    min_ram_amount: 16,  // MUST BE power of 2
                    // the multiplier the user BotnetManager is will upgrade nodes with
                    // Note: if the old amount * max_ram_multiplier > 1024 * 1024, it will just max out to that, since that's
                    //       the highest allowed amount
                    max_ram_multiplier: 2 // must be >= 1 and integer
                },
                hacknet: {
                    data_file: '/src/data/hacknet_data.txt',
                    structure_file: '/src/data/hacknet_structure.txt',
                    min_ram_amount: 1,
                    min_lvl_amount: 1,
                    min_cpu_amount: 1
                },
                public: {
                    data_file:  '/src/data/public_data.txt',
                    structure_file: '/src/data/public_structure.txt',
                },
                // change to budget and split files, percentages and managers (like the process config)
                budgets: {
                    managers: ['hacknet', 'botnet', 'program'],
                    general_file: '/src/budget/general.txt',
                    hacknet_file: '/src/budget/hacknet.txt',
                    botnet_file: '/src/budget/botnet.txt',
                    program_file: '/src/budget/program.txt',
                    // Budgets added up must total to 100 exactly or the BudgetHandler will keep running
                    hacknet_percentage:50,
                    botnet_percentage: 50,
                    program_percentage:0
                },
                process: {
                    commandPath: '/src/commands/',
                    handlerPath: '/src/commands/handlers/',
                    nettoolPath: '/src/commands/nettools/',
                    processFile: '/src/proc.txt',
                    logDirectory: '/src/logs/',
                    defaults : {
                        sleepDuration : 60 * 5 * 1000 // default 5 min
                    },
                    processes: {
                        addBudget: {
                            file: 'add_budget.js'
                        },
                        initialize: {
                            file: 'initialize.js'
                        },
                        // Namely, one that is not managed by the processHandler. However, we do need a place to configure the sleepduration.
                        processHandler: {
                            file: 'run_process.js',
                            param: { } 
                        },
                        budgetHandler: {
                            file: 'run_budget.js',
                            // only one param atm. if these increase we need to think about how to properly pass these to the process
                            param: { } 
                        },
                        networkHandler: {
                            file: 'run_netwrk.js',
                            param: { }
                        },
                        botnetManager: {
                            file: 'run_botnet.js',
                            param: {}
                        },
                        hacknetManager: {
                            file: 'run_hcknet.js',
                            param: { }
                        },
                        programmingManager: {
                            file: 'run_program.js',
                            param: {}
                        },
                        publicManager: {
                            file: 'run_public.js',
                            param: { }
                        },
                    }
                }
            }, this.configs[0]);
            this.logger.notify(`Main Configuration file "${this.configs[0]}" written`)
        }catch(e){
            return this.eh.handle(e, 'INITCFG');
        }
    }
    /**
     * Wrapper for the FileHandler writeJson function
     * @param {object} configuration configuration values to write
     * @param {string} name name of the configuration(file)
     * @returns void
     */
    async writeConfig(configuration, name) {
        try{
            await this.file.writeJson('/src/config/' + name + '.txt', configuration);
        }catch(e) {
            return this.eh.handle(e, 'WRITECFG');
        }
    }

    /**
     * Reads the config from file into local variable
     * @param {string} name name of the configuration(file)
     * @returns 
     */
    readConfig(name) {
        try{
             this.config = this.file.readJson('/src/config/' + name + '.txt');
        }catch(e) {
            return this.eh.handle(e, 'READCFG');
        }
    }
    /**
     * Get the config, either from cache or from file
     * @param {string} name name of the configuration(file)
     * @param {*} cacheReload whether we want to reload from file or from cache
     * @returns the configuration
     */
    getConfig(name, cacheReload = true){
        try{
            if(cacheReload) {
                this.readConfig(name);
            }
            return this.config;
        }catch(e){
            return this.eh.handle(e, 'GETCFG');
        }
    }

}