/**
 * Class to represent a process to be handled by the ProcessHandler
 * @notused
 */
export class Process{
    constructor(pid, name, threads, server){
        this.pid = pid
        this.name = name;
        this.threads = threads;
        this.server = server;
    }
}