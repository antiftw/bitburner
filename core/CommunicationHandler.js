/**
 * Class created to handle port interactions
 * Not actively used at the moment and probably not finished yet.
 * @todo: expand / finish this (maybe once we require some more port interaction?)
 */
export class CommunicationHandler {
    constructor(ns, verbose) {
        this.ns = ns;
        this.verbose = verbose;
    }
    /**
     * Queue a pushnotification (message in lower right part of the screen)
     * @param {string} msg
     * @param {string} type  Type of toast, must be one of success, info, warning, error. Defaults to success.
     */
     pushNotification(msg, type){
        this.ns.toast(msg,type);
    }
    async prompt(txt) {
        try{
            await this.ns.prompt(txt);
        }catch(e) {
            throw new Exception(`Error creating prompt: ${JSON.stringify(e)}` )
        }
    }
    clearPort(handle){
        this.ns.clearPort(handle);
    }
    
    async writePort(port, data){
        try{
            await this.ns.writePort(port, data)
        }catch(e) {
            throw new Exception(`Error writing data to port ${port}: ${JSON.stringify(e)}` )
        }
    }
    async tryWritePort(port, data) {
        let result;
        try{
            result = await this.ns.tryWritePort(port, data);
        }catch(e) {
            throw new Exception(`Error writing data to port ${port}: ${JSON.stringify(e)}` )
        }finally{
            return result;
        }
    }
    readPort(port) {
        let result = this.ns.read(port);
        if(result === 'NULL PORT DATA') {
            return null;
        }
        return result;
    }
    /**
     * Get a copy of the data from a port without popping it
     * @param {int} port Port to check out
     * @returns data from specified port
     */
    peak(port){
        let result = this.ns.peek(port);
        if(result === 'NULL PORT DATA') {
            return null;
        }
        return result;
    }
}


