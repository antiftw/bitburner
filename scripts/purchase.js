/**
 * Startup script.
 * @deprecated
 */
/** @param {NS} ns **/
export async function main(ns) {
    // How much RAM each purchased server will have. In this case, it'll
    // be 8GB.
    var ram = 8;
    var serverName = "antiftw-srv-";

    // Iterator we'll use for our loop
    var i = 0;
    var script = "hack.js";
    // Continuously try to purchase servers until we've reached the maximum
    // amount of servers
    while (i < ns.getPurchasedServerLimit()) {
        // Check if we have enough money to purchase a server
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            
            // If we have enough money, then:
            //  1. Purchase the server
            //  2. Copy our hacking script onto the newly-purchased server
            //  3. Run our hacking script on the newly-purchased server with 3 threads
            //  4. Increment our iterator to indicate that we've bought a new server
            var hostname = purchaseServer(serverName + i, ram);
            console.log('Buying server: ' + hostname + '.\n')
            console.log('Copying File ' + script + ' to ' + hostname + '.\n')
            scp(script, hostname);
            console.log('Excecuting file ' + script + ' on ' + hostname + '.\n')
            exec(script, hostname, 3);
            
            ++i;
        }
    }

    console.log('Purchase script terminated.\n')
}