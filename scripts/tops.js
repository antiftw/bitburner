export async function main(ns, hostname = 'pserv-1'){
    let requiredHackingLevel = ns.getServerRequiredHackingLevel(hostname);
    let portsRequired = ns.getServerNumPortsRequired(hostname);
    let serverGrowth = ns.getServerGrowth(hostname);
    let maxMoney = ns.getServerMaxMoney(hostname);
    let money = ns.getServerMoneyAvailable(hostname);
    let maxRam = ns.getServerMaxRam(hostname);
    let usedRam = ns.getServerUsedRam(hostname);
    let minSecurityLevel = ns.getServerMinSecurityLevel(hostname);
    let securityLevel = ns.getServerSecurityLevel(hostname);

    ns.tprint(requiredHackingLevel + ";" + portsRequired + ";" + serverGrowth + ";" + maxMoney + ";" + money + ";" + 
        maxRam + ";" + usedRam + ";" + minSecurityLevel + ";" + securityLevel)
}