export class PlayerHandler {
    constructor(ns, verbose) {
        this.ns = ns;
        this.verbose = verbose;
    }
    getPlayer(){
        return this.ns.getPlayer();
    }
}