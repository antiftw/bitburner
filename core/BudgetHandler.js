import { ConfigurationHandler } from "/src/tools/ConfigurationHandler";
import { FileHandler } from "/src/tools/FileHandler"
import { Logger } from "/src/tools/Logger"
import { Exception } from '/src/entity/Exception'
import { ExceptionHandler } from '/src/tools/ExceptionHandler'
/**
 * Handles the budget related functionality
 */
export class BudgetHandler {
    constructor(ns, verbose, enabled = true) {
        this.ns = ns;
        this.verbose = verbose;
        this.context = 'BUDGET'
        this.ch = new ConfigurationHandler(ns, verbose);
        this.file = new FileHandler(ns, verbose);
        this.logger = new Logger(ns, verbose, this.context)
        this.eh = new ExceptionHandler(ns, this.context)
        this.config;
        // Budget variables
        this.totalFunds = 0;
        this.botnetBudget = 0;
        this.generalBudget = 0;
        this.hacknetBudget = 0;
        this.programBudget = 0;
        // The following are just variables to save configuration values, to clean up the code a bit
        this.hacknetPercentage;
        this.botnetPercentage;
        this.programPercentage;
        this.home = 'home'
        this.botnetFile;
        this.hacknetFile;
        this.programFile;
        this.generalFile;
    }
    /**
     * Run the actual Handler, divide and assign the budgets
     */
    async run(){
        await this.init();
        if(this.generalBudget > 0) {
            try{
                this.logger.log(`Dividing budget: ${this.generalBudget} to spend ...`)
                // Divide budget between the different managers
                this.divideBudget();
                // Write to file, so other programs can pick it up.
                await this.writeBudgetFiles();
            }catch(e) {
                this.eh.handle(e, 'RUN')
            }
        }else{
            this.logger.notify(`No budget to divide, skipping`)
        }
    }
    /**
     * Initialize Handler, also initializing the budgetfiles if specified
     * @param {bool} force if we want to overwrite the files
     */
    async init(force = false){
        this.logger.log(`Initializing`);
        this.loadData();
        if(!this.ns.fileExists(this.botnetFile, this.home) || force){
            await this.writeBudgetFile(this.botnetFile, 0);
        }
        if(!this.ns.fileExists(this.generalFile, this.home) || force){
            await this.writeBudgetFile(this.generalFile, 0);
        }
        if(!this.ns.fileExists(this.hacknetFile, this.home) || force){
            await this.writeBudgetFile(this.hacknetFile, 0);
        }
        if(!this.ns.fileExists(this.programFile, this.home) || force){
            await this.writeBudgetFile(this.programFile, 0);
        }
        this.logger.log(`BudgetHandler initialized`);
    }

    /**
     * Loads all required data
     */
    loadData() {
        this.logger.log(`Loading configuration`)
        this.loadConfig();
        this.logger.log(`Loading Budgetfiles`)
        this.readBudgetFiles();
          // Get the actual available funds of the player

        this.funds = this.getTotalFunds();
        if(this.hacknetPercentage + this.botnetPercentage + this.programPercentage !== 100) {
            let actualSum = this.hacknetPercentage + this.botnetPercentage + this.programPercentage;
            let sum = `${this.hacknetPercentage} + ${this.botnetPercentage} + ${this.programPercentage} = ${actualSum}`
            throw new Exception(`Error with percentages, total must add up to exactly 100, while: ${sum}`)
        }
        this.logger.log(`Data loaded`);
    }
    /**
     * Loads configuration and creates local variables
     */
    loadConfig() {
        try{
            // read the configuration file
            this.config = this.ch.getConfig('main');
            // assign local variables, mostly for better readability
            this.botnetFile = this.config.budgets.botnet_file;
            this.hacknetFile = this.config.budgets.hacknet_file;
            this.programFile = this.config.budgets.program_file;
            this.generalFile = this.config.budgets.general_file;
            this.hacknetPercentage = Number(this.config.budgets.hacknet_percentage);
            this.botnetPercentage = Number(this.config.budgets.botnet_percentage);
            this.programPercentage = Number(this.config.budgets.program_percentage);
        }catch(e) {
            throw new Exception(`Error loading configuration: ${JSON.stringify(e)}`)
        }
    }

    /**
     * Divide the budget between the different managers to spend.
     */
    divideBudget(){

        if(this.generalBudget === 0) {
            throw new Exception(`Cannot divide funds when this.generalBudget is zero.`)
        }
        this.logger.log(`Sufficient budget available: ${this.generalBudget}`)
        try{
            this.logger.log(`Calculating assigned budgets`)
            let botnetAmount = Number(this.botnetPercentage) / 100 * Number(this.generalBudget);
            let hacknetAmount = Number(this.hacknetPercentage) / 100 * Number(this.generalBudget);
            let programAmount = Number(this.programPercentage) / 100 * Number(this.generalBudget);
            this.logger.log(`Calculated: assigning budgets`)
            this.assignBudget(botnetAmount, 'botnet');
            this.assignBudget(hacknetAmount, 'hacknet');
            this.assignBudget(programAmount, 'program');
            this.logger.notify(`Budgets assigned: [ HACKNET: ${hacknetAmount} ][ BOTNET: ${botnetAmount} ][ PROGRAM: ${programAmount} ] `)
            this.logger.log(`Budget left: ${this.generalBudget} (should be 0)`)
        }catch(e) {
            throw new Exception(`Error dividing budget between Managers: ${JSON.stringify(e)}`)
        }
    }

    /**
     * Assign budget to a certain Manager, so it can spend it.
     * @param {int} amount
     * @param {string} managerName
     */
    assignBudget(amount, managerName) {
        amount = Number(amount);
        this.logger.log(`Assigning ₿ ${amount} to ${managerName}`)
        try{
            if(managerName === 'botnet') {
                this.botnetBudget = this.botnetBudget + amount;
            } else if (managerName === 'hacknet') {
                this.hacknetBudget = this.hacknetBudget + amount;
            } else if (managerName === 'program') {
                this.programBudget = this.programBudget + amount;
            }
            this.generalBudget = this.generalBudget - amount;
            this.logger.log(`Budget assigned, funds left: ₿ ${this.generalBudget}`)
        }catch(e){
            throw new Exception(`Error assigning budget: ${JSON.stringify(e)}`)
        }
    }
    /**
     * Increases this.generalBudget, so that the BudgetHandler can divide it between the different parts of the Application
     * @param {int} amount
     * @returns
     */
    async increaseBudget(amount){

        if(amount > this.funds) {
            throw new Exception(`Cannot add ${amount} to budget, only ₿ ${this.funds.toFixed(0)} available`)
        }
        this.generalBudget = Number(this.generalBudget) + Number(amount);

        try{
            await this.writeBudgetFile(this.generalFile, String(this.generalBudget));
            this.logger.notify(
                `Succesfully added ${amount.toLocaleString('en')} to the budget, which is now a total of ${this.generalBudget.toLocaleString('en')}`
            )
        }catch(e){
            throw new Exception(`Error writing new budget to file: ${JSON.stringify(e)}`)
        }

    }

    /**
     * Get the amount of money currently available by the player
     * @returns {float} amount
     */
    getTotalFunds(){
        return this.getServerMoneyAvailable(this.home);
    }
    /**
     * Get the amount of money currently available on the server
     * @param {string} hostname the name of the server to check
     * @returns {float} amount
     */
    getServerMoneyAvailable(hostname){
        return this.ns.getServerMoneyAvailable(hostname)
    }

    /**
     * Reads the budget files, saving the budgets in our local datastructure
     */
    readBudgetFiles() {
        try{
            this.loadConfig();
            this.botnetBudget = Number(this.file.read(this.botnetFile));
            this.generalBudget = Number(this.file.read(this.generalFile));
            this.hacknetBudget = Number(this.file.read(this.hacknetFile));
            this.programBudget = Number(this.file.read(this.programFile));
            if(this.generalBudget > 0) {
                // If the budget was increased, we need to split it up, so we break the handler out of sleep mode
                this.enabled = true;
            }
        }catch(e){
            throw new Exception(`Error reading budget files: ${JSON.stringify(e)}`)
        }

    }
    /**
     * Write the local budgets to file, so other parts of the application can use them
     */
    async writeBudgetFiles(){
       try{
            this.logger.log(`Writing new budgetdata to file`);
            await this.writeBudgetFile(this.botnetFile, this.botnetBudget);
            await this.writeBudgetFile(this.generalFile, this.generalBudget);
            await this.writeBudgetFile(this.hacknetFile, this.hacknetBudget);
            await this.writeBudgetFile(this.programFile, this.programBudget);
            this.logger.log(`New budgetdata written to file`);
       }catch(e) {
           throw new Exception(`Error while saving budget files: ${JSON.stringify(e)}`)
       }
    }

    /**
     * Write a specific amount to a certain budgetfile
     * @param {string} file path + name of the file to write
     * @param {int} amount allocated budget
     */
    async writeBudgetFile(file, amount) {
        try{
            this.logger.log(`Writing  ${amount} to ${file}`)
            await this.file.write(file, amount, 'w');
        }catch(e) {
            throw new Exception(`Error while saving budget files: ${JSON.stringify(e)}`)
        }
    }

    toggle(){
        this.enabled = !this.enabled;
    }

}