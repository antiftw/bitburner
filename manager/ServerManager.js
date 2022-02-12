import { FileHandler } from '/src/tools/FileHandler'
import { Exception } from '/src/entity/Exception'
import { ExceptionHandler } from '/src/tools/ExceptionHandler'
import { Logger} from '/src/tools/Logger'
import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';
import { BudgetHandler } from '/src/core/BudgetHandler'
/**
 * Base class for all the servermanagers
 */
export class ServerManager {
    constructor(ns, verbose = false, context = 'SERVER'){
        this.ns = ns;
        this.verbose = verbose;
        this.budget = 0;
        this.phase;
        this.servers = [];
        this.context = context;
        this.dataFile = '<fill_this_in_extended_class_after_loading_config>';
        this.logger = new Logger(ns, verbose, this.context);
        this.file = new FileHandler(ns, verbose);
        this.ch = new ConfigurationHandler(ns, verbose);
        this.bh = new BudgetHandler(ns, verbose);
        this.eh = new ExceptionHandler(ns, this.context);
        this.config;
        this.budgetFile;
        this.priceOfLastAction = 0;
        this.performedActions = [];
        this.enabled = true;
    }

    /**
     * Main function. Keep upgrading network, until we run out of budget
     */
    async run(){
        try{
            // Load configuration, budget, and set other variables
            this.loadData();
            let counter = 0;
            while(this.budget >= this.priceOfLastAction && this.enabled) {

                // Spend all available budget
                let actResult = false;
                this.determinePhase();
                actResult = this.act();
                if(actResult) {
                    this.logger.log(`Action result: [ ${actResult.message} ] `)
                }
                this.logger.line(50, false);
                counter++;
                await this.ns.asleep(10);
                
            }
            if(this.performedActions.length > 0 && this.performedActions[0].name !== 'wait'){
                // print results of run
                this.displayActionResult();
                await this.ns.asleep(1000);
                // write the new network data and budgets to file
                await this.writeData();
                await this.ns.asleep(1000);
            }

        }catch(e) {
            this.eh.handle(e, 'SRVRUN');
        }
    }

    loadData() {
        // This function will load all ManagerType specific data
        // This is just and example / stub for the base functions
        // It will not be run, since the specific managers will overrride this function
        this.loadConfig();
        this.performedActions = [];
        this.loadBudget();
    }

    /**
     * Write away all data (budgets, serverstructure)
     */
    async writeData() {
        try{
            this.logger.log(`Writing new servers (${this.servers.length}) and budget (${this.budget.toLocaleString('en')}) to file`)
            await this.file.writeJson(this.dataFile, this.servers);
            if(typeof this.budgetFile !== 'undefined') {
                await this.bh.writeBudgetFile(this.budgetFile, this.budget);
            }
            this.logger.log(`Files written`)
        }catch(e) {
            this.eh.handle(e, 'SRVWRI')
        }
    }

    loadConfig(name = 'main') {
        this.config = this.ch.getConfig(name);
    }
    /**
     * Analyze and register action, used for displaying results afterwards
     * @param {obj} action the action to analyze
     */
    analyzeAction(action) {
        let index = this.performedActions.findIndex( element => {
            if (element.name === action.name) {
              return true;
            }
        });

        let amount = 1;

        let cost = action.price;
        if(index > -1) {
            let search = this.performedActions[index];
            amount = search.amount + 1
            cost = search.cost + action.price;
        }

        let obj = {
            name: action.name,
            amount: amount,
            cost: cost
        }
        if(index === -1) {
            this.performedActions.push(obj)
        }else{
            this.performedActions[index] = obj;
        }
    }

    /**
     * Display all executed actions from the last run
     */
    displayActionResult(){
        let output = [];
        let maxLength = 0;
        this.performedActions.forEach(action => {
            let line = `| ${action.name} => amount: ${action.amount}, cost: ₿ ${action.cost.toLocaleString('en')} |`
            maxLength = maxLength < line.length ? line.length : maxLength;
            output.push(line)
        });
        
        this.logger.notify('')
        this.logger.notify(`Run completed:`)
        this.logger.line(maxLength, true)
        output.forEach( line => {
            this.logger.notify(`${line}`);
        })
        this.logger.line(maxLength, true)
        this.logger.notify('')
    }

    /**
     * Reads the current general budget from file and updates local values
     * @returns {float} the current budget
     */
    loadBudget() {
        this.budget = Number(this.file.read(this.budgetFile));
        if(this.budget > 0) {
            this.logger.log(`budget: ${this.budget} / price: ${this.priceOfLastAction ? this.priceOfLastAction : 0}`)
            if(this.budget < this.priceOfLastAction || this.budget === 0) {
                this.enabled = false;
                this.logger.log(`Budget: [ ${this.budget} ] < Price: [ ${this.priceOfLastAction ? this.priceOfLastAction : 0} ] || Budget === 0`)
            }else if(this.budget >= this.priceOfLastAction && this.budget > 0) {
                this.enabled = true;
                this.logger.log(`Budget: [ ${this.budget} ] >= Price: [ ${this.priceOfLastAction ? this.priceOfLastAction : 0} ]`)
            }
        }
        return this.budget;
    }

    /**
     * Determine and perform the next optimal action
     * @returns {obj} = {success, message}
     */
    act() {
        try{
            this.logger.log(`Determining optimal action. Budget: ₿ [ ${this.budget.toLocaleString('en')} ]`)
            let action = this.determineOptimalAction();
            let price = action.price;
            this.logger.log(JSON.stringify(action))
            if(price > this.budget) {
                
                let length = String(price).length;
                let required = price - this.budget;
                // logging rules,
                this.logger.log(`Cannot perform action [ ${action.name} ]. Need more funds:`);
                this.logger.log(`cost: ₿ ${(action.price.toFixed(0)).toLocaleString('en')} `)
                this.logger.log(`have: ₿ ${this.logger.pad(length, (this.budget.toFixed(0)).toLocaleString('en'), true)} `)
                this.logger.line();
                this.logger.log(`need: ₿ ${this.logger.pad(length, required, true)}`)
                this.logger.notify(`Insufficient funds, need ${required.toLocaleString('en') } extra (${action.price.toLocaleString('en')} - ${this.budget.toLocaleString('en')})`)

                // disable the loop
                this.enabled = false;
                this.priceOfLastAction = action.price;
                // return failure
                return {
                    success: false,
                    message: `Price of optimal action to high for budget`
                }
            }
            this.logger.log(`budget: ${this.budget}`)
            let amountOfCharacters = String(this.budget).length;
            // more logging
            this.logger.log(`Optimal action determined: '${action.name}'`)
            this.logger.log(`This would amount to:`)
            this.logger.log(`have: ₿ ${this.budget}`)
            this.logger.log(`cost: ₿ ${price} -`)
            this.logger.line();
            this.logger.log(`left: ₿ ${this.logger.pad(amountOfCharacters, (this.budget - price), true)}`)

            // do the actual thing
            let result = this.performAction(action);
            // do some processing for reporting purposes
            this.analyzeAction(action);
            // update the local budget
            this.budget = this.budget - action.price;
            // return success
            return result;
        }catch (e) {
            this.eh.handle(e, 'SRVACT');
        }
    }

    toggle(){ this.setEnabled(!this.enabled); }
    enable(enabled = true){ this.enabled = enabled; }
    addBudget(amount) { this.budget += amount; }

    // stub functions => implementation located in extended Managers
    determineOptimalAction(){}
    determinePhase(){}
    performAction(action){}

    /**
     * Function to get a commom interface for the functionality
     * @param {string} name unique string to identify
     * @param {float} price the amount the action costs
     * @param {?Server} node (if applicable) the server/node the action affects
     * @returns {obj}
     */
    formatAction(name, price, node = null) {
        return {
            name: name,
            price: price,
            node: node
        };
    }

    /**
     * Check if a server exists
     * @param {string} host servername
     * @returns {bool}
     */
    serverExists(host){
        return this.ns.serverExists(host);
    }

    /**
     * Check if a script is running on a specific host with specific arguments
     * @param {string} file name of the script
     * @param {string} host name of the host
     * @param {array} args array with argument
     * @returns {bool}
     */
    isRunning(file, host, args){
        return this.ns.isRunning(file, host, args);
    }

    /**
     * Check if a process is active given a process id
     * @param {int} pid process id
     * @returns {bool}
     */
    isRunning(pid){
        return this.ns.isRunning(pid);
    }
    /**
     * Get all runnning scripts (and all arguments) on a specific server
     * @param {string} host servername
     * @returns a list with running scripts and arguments
     */
    ps(host) {
        return this.ns.ps(host);
    }
}