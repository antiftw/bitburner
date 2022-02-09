import { Exception } from "/src/entity/Exception"
import { PublicServer } from "/src/entity/server/PublicServer.js";
import { ServerScanner } from "/src/scanner/ServerScanner.js";

/**
 * Class that handles the scanning of the public network
 */
export class PublicScanner extends ServerScanner {
    constructor(ns, verbose, context = 'PUBLIC') {
        super(ns, verbose, [], context);
    }
    /**
     * @inheritdoc
     */
    init(){
        try{
            this.loadConfig();
            this.structureFile =  this.config.public.structure_file;
            // We want to exclude the 'home' and 'darkweb' servers from this scan
            this.exclude.push(new PublicServer(this.ns, this.home));
            this.exclude.push(new PublicServer(this.ns, 'darkweb'));
            
            // As well as the Botnetservers
            let botnetData = this.file.readJson(this.config.botnet.structure_file);
            botnetData.forEach(bot => {
                let srv = new PublicServer(this.ns, bot.name);
                this.exclude.push(srv);
            });
        }catch(e) {
            this.logger.log(`Error initializing exclude list for PublicScanner: ${JSON.stringify(e)}`);
            return 1;
        }
    }

    /**
     * @inheritdoc
     */
    scanNetwork() {

        let toVisit = this.scan(this.home);
        let analyzedServers = [];
        let homeServer = new PublicServer(this.ns, this.home, null);
        analyzedServers.push(homeServer);

        while(toVisit.length > 0) {
            let current = toVisit.shift();
            let hosts = this.scan(current.name)
            for(let index = 0; index < hosts.length; index++) {
                let server = hosts[index];
                if(!this.exclude.some(exclude => exclude.name === server.name)
                    && !analyzedServers.some(analyzed => analyzed.name === server.name)
                ){
                    toVisit.push(server);
                }
            }
            analyzedServers.push(current);
        }
        this.servers = analyzedServers;
    }

    /**
     * @inheritdoc
     */
    scan(host) {
        let scanResult = this.ns.scan(host);

        let servers = [];
        for(let index = 0; index < scanResult.length; index++){ 
            let server = new PublicServer(this.ns, scanResult[index], host); 
            if(!this.exclude.some(exclude => exclude.name === server.name)){
                servers.push(server);
            }
        }
        return servers;
    }


    /**
     * Given a specified host, find the hops that are between home and that host
     * @param {string} host to find a path to
     */
    trace(host) {

        // See if we can find the target host
        let target = this.servers.find(server => server.name === host);
        if(typeof target === 'undefined') {
            throw new Exception('Host ' + host + ' not found.')
        }
        let hops = [];
        let arrivedHome = false;
        while(!arrivedHome){
            // add the target itself
            hops.push(target);

            // set the new target to the source of the old target
            let source = target.source;
            target = this.servers.find(server => server.name === source);

            if(target.name === 'home') {
                let home = new PublicServer(this.ns, 'home', null);
                hops.push(home);
                arrivedHome = true;
            }
        }
        return hops;
    }

    printHops(target) {
        let hops = this.trace(target);
        
        let output = '';
        for(let index = 0; index < hops.length; index++) {
            let srv = hops[index];
           if(typeof srv !== 'undefined') {
                output = `[ ${srv.name} ] => ${output}`;
           }
        }
        // remove the last => before printing
        this.ns.tprint(output.substring(0, output.length - 3));
    }

    /**
     * Create a string with connect statements that will connect the user to the host through the intermediate hops
     * @param {string} host to get a connectstring for
     * @returns the string that can be used to connect to the specified host
     */
    getConnectString(host, print = false){
        let hops = this.trace(host);
        // remove last server, since that is the home server itsself, and we cont need to connect there
        hops.pop();
        this.ns.tprint(hops.length);
        let string = '';
        for(let index = hops.length -1; index >= 0; index--) {
            let hop = hops[index];
            string = string +  ' connect ' +  hop.name + ';'
        }
        if(print) {
            this.ns.tprint(string);
        }
        return string;
    }
}