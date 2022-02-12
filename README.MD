# AntiFTW's BitBurner implementation

## Contents 
- Introduction
- Important commands
- Project overview

## Introduction

This is an attempt to tackle the Bitburner game, by automating ... everything (!) (well it does not actually - yet - but that is / was the goal at least :) )

There's a lot still to be done, but the start is there, there is a main loop (boot it up with the command ```start```, see optional options below) that awaits budget (which you can add using the command ```budget-add```) and then divides it between the configured managers, which will spend it to upgrade and/or expand their respective networks. Then the final handler looks if there are servers that require infection and runs scripts on them. And then it starts all over again, until inifinity... ^^

### Next on the list:
- Optimization of the enslavement process (ongoing)
- Central config for the verbosity (done)
- Optimization of the BotnetManager 
- ...

## Project overview
The project is divided in several parts:
- cmd (contains the main loop) (FUNCTIONING)
- commands (to interact with the code from the command line) (FUNCTIONING)
- scanners (to scan the networks, and save the structure of the network to files) (DONE)
- analyzers (to use the scanned network files and look up all relevant data per network type) (DONE)
- managers (to expand and upgrade the networks) (Hacknet DONE, Botnet DONE, Public DONE, Programming TODO)
- hacking:
    - infector (to make sure servers are rooted (when required) and fitted with the wgh scripts ) (WIP)
    - worm (brainfart, might be fun to create an actual worm, instead of our current C&C structure) (TODO)
- handlers (other functionality):
    - display (DONE-ISH)
    - budget (DONE)
    - configuration (DONE)
    - file (DONE)
    - logging (output to screen and logs) (DONE-ISH)
    - exceptions (DONE-ISH)
    - processes (EARLY STAGE)
    - ports (EARLY STAGE)
    - hacking (DONE-ISH)
- entities (objects):
    - servers (DONE) (to contain al server specific data + functionality, organized per type and requirements)
    - exception (DONE) (to handle errors)
    - player (WIP) (to handle player functionality + data)
    - process (WIP) (to encapsulate the whole script execution)
- 'wgh' scripts (stands for the three possible actions: w(eaken), g(row) and h(ack)) (DONE-ISH)
- old scripts (from learning the game, and some quick start scripts, inspirational)

## Important commands
For a full overview, there is a text file in the project root (/aliases.txt) where all the custom aliases are listed. This section will shortly mention and explain the most important ones. Do note that you will have to manually create these aliases before they work (```alias="run /path/to/script.js"```).

- ```start```: runs the main loop (```run /src/commands/start.js```)
    - optional arguments: 
        - ```--force```: 
        whether we want to rewrite the configuration file, (re)-initialize the budget files
        - ```--resupply[=<amount>]```:
        whether we want to allocate an amount to the budget automatically when starting up default value: ```'1b'``` for 1 billion
        
- ```init```: initializes the system, by writing a config file
- ```kill-all```: [deprecated] custom kill script -> tries and kill the handlers - which are looping scripts - without killing the hack scripts running on the home server

- ```budget-add <amount>```: adds a certain amount to the general budget, so that the budgetmanager can pick 
                         it up and distribute it. Certain multipliers allowed (type ```budget-add --help``` for more info)
- ```scan-all```: scans all the different networks, saving the structure to a file
- ```diagnose-all```: diagnoses/analyzes all networks, savind the structure + server properties to a file
- ```scan-diag```: combines the '```scan-all```' and '```diagnose-all```' commands
- ```show-network```: shows the servers and their properties (from all the different networks )
    - optional arguments:
        - queryType: ```['all', 'network', 'server']```:
            - ```all```: will show all networks (excluding the non-rooted public servers for overview)
            - ```network```: will show an entire network (including the rooted servers when ```query === public```)
            - ```server```: will also show an entire network, but will highlight the server specified in query
        - query: 
            - (partial) ```['botnet', 'hacknet', 'public']``` when ```queryType === 'network'```
            - (partial) ```<servername>``` when ```queryType === 'server'```

  
# Configuration settings

// todo: write short explanation of most important config