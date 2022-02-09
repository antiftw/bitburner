/**
 * Class to represent a process
 */
export class Process{
    constructor(pid, filename, server, args = {}, threads = 1){
        this.pid = pid
        this.filename = filename;
        this.server = server;
        this.args = args;
        this.threads = threads;
    }
}