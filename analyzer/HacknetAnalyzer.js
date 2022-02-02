import { ServerAnalyzer } from "/src/analyzer/ServerAnalyzer";
import { ExtendedHacknetServer } from "/src/entity/server/ExtendedHacknetServer"
/**
 * Hacknet analyzer class, analyzes the Hacknet network (from the file saved by the scanner) and saves relevant data to a file
 */
export class HacknetAnalyzer extends ServerAnalyzer {
    constructor(ns, verbose = false, context = 'HCKNET'){
        super(ns, verbose, context);
        this.ns = ns;
    }
    /**
     * @inheritdoc
     */
    init(){
        try{
            this.loadConfig();
            this.structureFile = this.config.hacknet.structure_file;
            this.dataFile = this.config.hacknet.data_file;
            this.servers = this.file.readJson(this.structureFile);
        }catch(e){
            this.eh.handle(e, 'HCKINI');
        }
    }

    /**
     * @inheritdoc
     */
    async analyze() {

        let analyzed = [];
        this.servers.forEach(srv => {
            let server = new ExtendedHacknetServer(this.ns, srv.name);

            server.update({
                name: server.fetch('name'),
                level: server.fetch('level'),
                ram: server.fetch('ram'),
                cores: server.fetch('cores'),
                isServer: server.isServer,
                production: server.fetch('production'),
                totalProduction: server.fetch('totalProduction'),
                timeOnline: server.fetch('timeOnline'),
                cache: server.fetch('cache'),
                hashCapacity: server.fetch('hashCapacity'),
            })
            analyzed.push(server);
        });

        // All servers analyzed and visited
        this.servers = analyzed;
    }
}