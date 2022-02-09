/** @param {NS} ns **/
import { Infector } from 'infector.js'
/**
 * Just an idea, nothing concrete yet, write a script that acts like a worm, instead of using the current C&C structure
 * @param {mixed} ns
 */

export class Worm{
    availableServers;
    visitedServers;
    payload;
    infector;
    Worm(payload){
        this.addLinkedHosts('home')
        this.visitedServers = [];
        this.payload = payload;
        this.infector = new Infector();
    }
    analyze(){
        for(server in this.servers) {
            if(!this.visitedServers.includes(server)) {
                this.addLinkedHosts(server);
            }
            this.visitedServers.push(server);
        }
        return this.availableServers;
    }

    addLinkedHosts(host) {
        let linkedHosts = scan(host);
        for(linkedHosts in linkedHosts) {
            if(!this.availableServers.includes(linkedHosts)){
                this.availableServers.push(linkedHosts);
            }
        }
    }

    ghost(host){
        for(script in this.scriptsToCheck) {
            if(ns.isRunning(script)) {
                kill(script);
            }
        }
        this.ghostedServers.push(host);
    }
}
