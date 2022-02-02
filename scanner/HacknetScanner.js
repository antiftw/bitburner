import { HacknetServer } from "/src/entity/server/HacknetServer.js";
import { ServerScanner } from "/src/scanner/ServerScanner.js";

/**
 * Class that handles the scanning of the Hacknet network
 */
export class HacknetScanner extends ServerScanner {
    constructor(ns, verbose, context = 'HCKNET') {
        super(ns, verbose, [], context);
        this.structureFile;
    }

    /**
     * @inheritdoc
     */
    init() {
        this.loadConfig();
        this.structureFile = this.config.hacknet.structure_file;
    }

    /**
     * @inheritdoc
     */
    scanNetwork() {
        let amountOfNodes = this.numNodes();
        for(let counter = 0; counter < amountOfNodes; counter++){
            let server = new HacknetServer(this.ns, 'hacknet-node-' + counter);
            this.servers.push(server);
        }
    }

    /**
     * Get the amount of nodes in the Hacknet network
     */
    numNodes(){
        return this.ns.hacknet.numNodes();
    }
}