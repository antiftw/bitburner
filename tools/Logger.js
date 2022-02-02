/**
 * Used to log and print output to the terminal
 * 
 */
export class Logger{
    /**
     * Constructor
     * @param {mixed} ns 
     * @param {bool} verbose whether we want output
     * @param {string} context where the logger is created
     * @param {bool} timestamp whether we want to timestamp the messages
     */
    constructor(ns, verbose = false, context = '', timestamp = false){
        this.ns = ns;
        this.context = context;
        this.verbose = verbose;
        this.prefix = `[${this.context}] - `;
        this.timestamp = timestamp;
    }

    /**
     * Log message to script logs, and output it to the terminal if this.verbose === true
     * @param {string} msg the message to log
     * @param {bool} timestamp whether we want to prepend a timestamp
     */
    log(msg, timestamp = false){
        let stamp = '';
        let line = stamp + '[LOGGER] ' + this.prefix + msg;
        if(timestamp || this.timestamp)
            stamp = `[ ${this.currentTime()} ] `;
        if(this.verbose)
            this.ns.tprint(line);
        this.ns.print(line);
    }

    /**
     * Write a line to the terminal
     * @param {int} length length of the line
     * @param {bool} notify if we want to show it in 'log()' or 'notify();
     * @param {string} symbol the symbol the line is constructed from
     */
    line(length = 30, notify = false, symbol = '=') {
        let line = '';
        for(let index = 0; index < length; index++) {
            line = `${line}${symbol}`
        }
        
        if(notify) {
            this.notify(line);
        }else{
            this.log(line);
        }
    }
    /**
     * Show a message to the user
     * @param {string} msg the message to show the user
     * @param {bool} timestamp whether we want to prepend the message with a timestamp
     * @param {bool} fullStamp whether we want just the time or time + date
     */
    notify(msg, timestamp = false, fullStamp = false){
        let stamp = '';
        if(timestamp || this.timestamp)
            stamp = `[ ${this.currentTime()} ] `;

        let line = stamp + '[NOTIFY] ' + this.prefix + msg;
        this.ns.tprint(line)
    }

    /**
     * Pad a string
     * @param {int} amount amount to pad to
     * @param {string} str the string to pad
     * @param {bool} padLeft whether we want to pad on the left side
     * @param {string} padding the character to pad with
     * @returns the padded string
     */
    pad(amount, str, padLeft = false, padding = ' ') {
        let output = '';
        if(typeof str !== 'undefined'){
            if(str.length === amount)
            return str;
            while((str + output).length < amount) {
                output = output + padding;
            }
            if(padLeft) {
                return output + str;
            }
            return str + output;
        }
        return '';
    }

    /**
     * Generate a human readable timestamp string
     * @param {bool} full whether we want just time or time + date
     * @returns a human readable string with the current (date +) time
     */
    currentTime(full = false) {
        let currentDate = new Date();
        let cDay   = this.pad(2, currentDate.getDate(), true, '0');
        let cMonth = this.pad(2, currentDate.getMonth() + 1, true, '0');
        let cHour  = this.pad(2, currentDate.getHours(), true, '0');
        let cMin   = this.pad(2, currentDate.getMinutes(), true, '0');
        let cSec   = this.pad(2, currentDate.getSeconds(), true, '0');
        if(full) 
            return `${cDay} / ${cMonth} T ${cHour}:${cMin}:${cSec}`
        
        return `${cHour}:${cMin}:${cSec}`
    }

    /**
     * Disable logging for specific functions. Use 'ALL' to disable logging for all functions.
     * NOTE(1): this does not completely disable logging, just the successful return logs. Failures will still be logged.
     * NOTE(2): Notable functions that cannot have logs disabled: run, exec, exit
     * @param {*} fn function for which to disable logging
     */
    disableLog(fn) {
        this.ns.disableLog(fn)
    }
    /**
     * Enables log for specific function, or revert effects of disableLog('ALL') when called with fn: 'ALL'
     * @param {string} fn function for which to enable logging
     */
    enableLog(fn) {
        this.ns.enableLog(fn);
    }
}