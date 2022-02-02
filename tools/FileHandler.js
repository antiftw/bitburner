import {Exception} from '/src/entity/Exception'
import { ExceptionHandler } from '/src/tools/ExceptionHandler'
/**
 * Handles file manipulation
 */
export class FileHandler {
    constructor(ns, verbose = false) {
            this.ns = ns;
            this.verbose = verbose;
            this.context = 'FILE'
            this.eh = new ExceptionHandler(ns, this.context);
    }
    async write(file, data, mode = 'w'){
        try{
            await this.ns.write(file, data, mode);
        }catch(e){
            throw new Exception(`Error writing file ${file}: ${JSON.stringify(e)}`)
        }
    }
    read(file) {
        if (!this.fileExists(file)) {
            throw new Exception('Error reading file, ' + file + ' does not exist');
        }
        try {
            return this.ns.read(file);
        } catch (e)
         {
            throw new Exception('Error reading file: [ ' + file + ' ]: ' + e);
        }
    }
    serialize(obj) {
        try{
            return JSON.stringify(obj);
        }catch(e){
            throw new Exception('Error stringifying object [ ' + obj + ' ]: ' + e);
        }
    }
    unserialize(str) {
        try{
            return JSON.parse(str);
        }catch(e){
            throw new Exception('Error parsing string ' + str + ' ]: ' + e);
        }
    }
    readJson(file) {
        try{
            return this.unserialize(this.read(file));
        }catch(e){
            throw new Exception("Error reading JSON file " + file + " : " + JSON.stringify(e));
        }
    }

    async writeJson(file, data, mode = 'w'){
        try{
            let str = this.serialize(data);
            await this.write(file, str, mode);
        }catch(e){
            throw new Exception("Error writing JSON file " + file + ' ]: ' + e.message)
        }
    }
    fileExists(fileName, server = null) {
        if(server === null) {
            return this.ns.fileExists(fileName);
        }
        return this.ns.fileExists(fileName, server);
    }

  
}
