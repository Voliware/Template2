/**
 * Generates a unique id based on the 
 * timestamp and an internal counter.
 */
class IdGenerator {

    /**
     * Constructor
     * @return {IdGenerator}
     */
    constructor(){
        this.counter = 0;
        this.lastTime = 0;
        return this;
    }

    /**
     * Generates a unique id based on the timestamp,
     * a prefix, and an internal counter.
     * @return {string}
     */
    generateId(){
        let now = microtime.now();
        // if an ID is being generated with the same timestamp as the
        // last request to generate an ID, then increment the counter 
        if(this.lastTime === now){
            this.counter++;
        }
        else {
            this.counter = 0;
        }
        this.lastTime = now;
        return `${now}${this.counter}`;
    }
}