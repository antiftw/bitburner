import { BotnetServer } from "/src/entity/server/BotnetServer";
import { ServerScanner } from "/src/scanner/ServerScanner";
import { BotnetManager } from "/src/manager/BotnetManager";
/**
 * Class that handles the scanning of the botnet network
 */
export class BotnetScanner extends ServerScanner {

    constructor(ns, verbose, exclude = ['darknet'], context = 'BOTNET') {
        super(ns, verbose, exclude, context);
        this.manager = new BotnetManager(ns, verbose);
    }

    /**
     * @inheritdoc
     */
    init() {
        this.loadConfig();
        this.structureFile = this.config.botnet.structure_file;
    }

    /**
     * @inheritdoc
     */
    scanNetwork() {
        let servers = this.manager.getPurchasedServers();
        for(let index = 0; index < servers.length; index++){
            let server = new BotnetServer(this.ns, servers[index], 'home');
            this.servers.push(server);
        }
    }

    /**
     * @inheritdoc
     */
    scan(host) {
        let servers = this.ns.scan(host);
        let result = [];
        for(let index = 0; index < servers.length; index++) {
            let server = new BotnetServer(ns, servers[index], host);
            if(this.exclude.some(exclude => exclude.getName() === server.getName())){
                result.push(server);
            }
        }
        return result;
    }

}