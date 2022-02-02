/**
 * Class that will be used to automate the writing of new programs
 * @todo implement
 */
export class ProgrammingManager {
    constructor(ns, verbose) {
        this.ns = ns;
        this.verbose = verbose;
        this.budget = 0;
        this.logger = new Logger(ns, verbose, 'PROGRM');
    }
}