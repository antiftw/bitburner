import { ConfigurationHandler } from '/src/tools/ConfigurationHandler';

/**
 * Clear the server structure and data files, used before scanning.
 * @param {*} ns 
 */
/** @param {NS} ns **/
export async function main(ns) {
    try{
        let ch = new ConfigurationHandler(ns);
        let config = ch.getConfig('main');
        let files = [];
        let success = true;
        files.push(config.hacknet.structure_file);
        files.push(config.hacknet.data_file);

        files.push(config.public.structure_file);
        files.push(config.public.data_file);

        files.push(config.botnet.structure_file);
        files.push(config.botnet.data_file);

        files.forEach(file => {
            success = ns.rm(file, 'home')
        })
        if(success) {
            ns.tprint(`Successfully deleted ${files.length} files.`)
        }
    }catch(e){
        ns.tprint(`Something went wrong analyzing the botnet. Exception: ${JSON.stringify(e)}`);
    }
}


