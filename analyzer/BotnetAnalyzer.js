
import { ExtendedBotnetServer } from '/src/entity/server/ExtendedBotnetServer';
import { ServerAnalyzer } from '/src/analyzer/ServerAnalyzer'
/**
 * Botnet analyzer class, analyzes the botnet network (from the file saved by the scanner) and saves relevant data to a file
 */
export class BotnetAnalyzer extends ServerAnalyzer {
    constructor(ns, verbose = false, context = 'BOTNET'){
        super(ns, verbose, context);
        this.ns = ns;
    }

    /**
     * @inheritdoc
     */
    init(){
        try{
            this.loadConfig();
            this.structureFile = this.config.botnet.structure_file;
            this.dataFile = this.config.botnet.data_file;
            this.servers = this.file.readJson(this.structureFile);
        }catch(e){
            this.eh.handle(e, 'BOTINI');
        }
    }

    /**
     * @inheritdoc
     */
    async analyze() {
        let analyzed = [];
        this.servers.forEach(srv => {
            let server = new ExtendedBotnetServer(this.ns, srv.name, srv.source);
            server.update({
                maxRam: server.fetch('maxRam'),
                maxMoney: server.fetch('maxMoney'),
                rootAccess: server.fetch('rootAccess'),
                usedRam: server.fetch('usedRam'),
                money: server.fetch('money'),
            });
            analyzed.push(server);
        });

        // All servers analyzed and visited
        this.servers = analyzed;
    }
}