
import { ExtendedPublicServer } from '/src/entity/server/ExtendedPublicServer';
import { ServerAnalyzer } from '/src/analyzer/ServerAnalyzer'
import { Exception } from '/src/entity/Exception';

/**
 * Public analyzer class, analyzes the public network (from the file saved by the scanner) and saves relevant data to a file
 */
export class PublicAnalyzer extends ServerAnalyzer {
    /** @param {NS} ns **/
    constructor(ns, verbose = false, context = 'PUBLIC') {
        super(ns, verbose, context);
        this.ns = ns;
        this.home = 'home';
        this.verbose = verbose;
        this.scripts = [];
    }

    /**
     * @inheritdoc
     */
    init(){
        try{
            this.loadConfig();
            this.dataFile = this.config.public.data_file;
            this.structureFile = this.config.public.structure_file;
            this.servers = this.file.readJson(this.structureFile);
        }catch(e){
            this.eh.handle(e, 'PUBINI');
        }
    }

    /**
     * @inheritdoc
     */
    async analyze() {
        
        let analyzed = [];
        this.servers.forEach(srv => {
            let server = new ExtendedPublicServer(this.ns, srv.name, srv.source);
            server.update({
                maxRam: server.fetch('maxRam'),
                maxMoney: server.fetch('maxMoney'),
                rootAccess: server.fetch('rootAccess'),
                usedRam: server.fetch('usedRam'),
                money: server.fetch('money'),
                portsRequired: server.fetch('portsRequired'),
                requiredHackingLevel: server.fetch('requiredHackingLevel'),
                security: server.fetch('security'),
                minSecurity: server.fetch('minSecurity'),
            })
            analyzed.push(server);
        });

        // All servers analyzed and visited
        this.servers = analyzed;
    }
}