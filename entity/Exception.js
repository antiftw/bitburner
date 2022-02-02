/**
 * Class so we can throw Exceptions
 */
export class Exception{
    constructor(message, content = null){
        this.message = message;
        this.name = 'Exception'
        this.content = content;
    }
}
