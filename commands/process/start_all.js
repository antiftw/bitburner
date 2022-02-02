export async function main(ns) {
    try{
       // let pid = await ns.exec('/src/commands/porcess/start_process.js', 'home', 1, 'budgetHandler')
        // if(pid !== 0) {
        //     this.ns.tprint(`Process started pid: [${pid}]`)
        // }
       //ns.run(`${path}run_process.js`);
    }catch(e){
        ns.tprint(`Error starting all processes: ${e}`)
    }
}