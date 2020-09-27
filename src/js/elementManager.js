/**
 * Element Manager.
 * Can create and manage HTMLElements and Templates.
 * Must be passed a cloneable HTMLElement in the constructor to be of any use.
 * @fires ElementManager#clone
 * @fires ElementManager#append
 * @fires ElementManager#remove
 * @fires ElementManager#empty
 * @extends {EventSystem}
 * @example
 * // ElementManager creates, renders, and appends 3 elements to itself
 * let template = document.getElementById('template');
 * let list = document.getElementById('list');
 * let element_manager = new ElementManager(list, template);
 * element_manager.render([
 *    {id: 0, name: "Jim H", status: "online"},
 *    {id: 1, name: "Pam B", status: "offline"},
 *    {id: 2, name: "Michael S", status: "online"},
 * ]);
 * // ElementManager would update Jim and Pam, but, since Michael no longer 
 * // exists in the data, it would remove the element/template with that data.
 * // What is important is that the "id" is matched.
 * element_manager.render([
 *    {id: 0, name: "Jim H", status: "online"},
 *    {id: 1, name: "Pam H", status: "online"},
 * ]);
 */
class ElementManager extends EventSystem {

    /**
     * Constructor
     * @param {HTLMElement} wrapper - Wrapper element where elements are appended
     * @param {HTMLElement} template - A cloneable HTMLElement or Template
     * @param {Object} [params]
     * @param {String} [params.primary_key="id"] - Necessary for rendering data
     * from arrays of objects. Otherwise, ElementManager will just empty itself
     * and rebuild from scratch.
     * @param {Number} [params.max_elements=0] - Max element count
     * @param {Boolean} [params.clone_template=true] - Whether to clone the 
     * initial template from the DOM. Most of the time, you want to do this.   
     * @param {Boolean} [params.remove_template=true] - Whether to remove the 
     * initial template on the DOM. Most of the time, you want to do this,
     * unless there are many ElementManagers using the same template.                  
     * @param {Boolean} [params.remove_dead_templates=true] - Whether to remove
     * dead templates. A template is dead when it does not exist in new data 
     * passed to render()
     */
    constructor({
        wrapper = null,
        template = null,
        primary_key = "id",
        max_elements = 0,
        clone_template = true,
        remove_template = true,
        remove_dead_templates = true
    }){
        super();

        /**
         * The element in which all templates will be appended to.
         * If not defined in the constructor, creates a div element.
         * @type {HTMLElement}
         */
        this.wrapper = wrapper || document.createElement('div');

        /**
         * Whether to clone the initial template from the DOM. Most of the time,
         * you want to do this.
         * @type {Boolean}
         */
        this.clone_template = clone_template;

        /**
         * Whether to remove the initial template on the DOM. Most of the time,
         * you want to do this, unless there are many ElementManagers using the
         * same template. 
         * @type {Boolean}
         */
        this.remove_template = remove_template;

        /**
         * Whether to remove dead templates. A template is dead when it does
         * not exist in new data passed to render() as matched by the
         * primary_key value.
         * @type {Boolean}
         */
        this.remove_dead_templates = remove_dead_templates

        /**
         * Necessary for rendering data from arrays of objects. Otherwise,
         * ElementManager will just empty itself and rebuild from scratch.
         * @type {String}
         */
        this.primary_key = primary_key;

        /**
         * The maximum number of elements to render.
         * @todo Implement
         * @type {Number}
         */
        this.max_elements = max_elements;

        /**
         * A Template HTMLElement to create new templates from.
         * @type {HTMLElement}
         */
        this.template = this.clone_template ? template.cloneNode(true) : template
        this.template.removeAttribute('id');
        this.template.classList.remove('template');
        if(this.remove_template){
            template.remove();
        }

        /**
         * A Map of Templates, such as
         * { "User1" => UserRowTemplate,
         *   "User2" => UserRowTemplate.. }
         * @type {Map}
         */
        this.elements = new Map();

        /**
         * Unmodified data passed to the render function.
         * @type {Array|Map|Object}
         */
        this.cached_data = null;

        /**
         * Processed data passed to the render function.
         * @type {Array|Map|Object}
         */
        this.render_data = null;
    }

    /**
     * Append the entire manager to another element.
     * @param {HTMLElement|Template} element 
     */
    appendTo(element){
        Template.append(this.wrapper, element);
    }

    /**
     * Get the number of elements in the map
     * @returns {Number}
     */
    getElementCount(){
        return this.elements.size;
    }
    
    /**
     * Empty the contents of the template manager
     */
    empty(){
        while (this.wrapper.firstChild) {
            this.wrapper.removeChild(this.wrapper.firstChild);
        }
        this.elements = new Map();
        this.emit("empty");
    }

    /**
     * Attach handlers to an element
     * @param {HTLMElement|Template} element 
     */
    attachElementHandlers(element){
    }

    /**
     * Create a new clone of the template. Attach handlers to it.
     * @returns {HTLMElement|Template}
     */
    cloneTemplate(){
        let element = this.template.cloneNode(true);
        this.attachElementHandlers(element);
        this.emit("clone", element);
        return element;
    }

    /**
     * Append an element to the wrapper
     * @param {HTLMElement|Template} element 
     */
    appendElement(element){
        this.wrapper.appendChild(element);
        this.emit("append", element);
    }

    /**
     * Remove an element by id. Removes from the DOM and collection.
     * @param {String} id 
     */
    removeElement(id){
        let element = this.elements.get(id);
        if(element){
            this.wrapper.removeChild(element);
            this.elements.delete(id);
            this.emit("remove", element);
        }
    }

    /**
     * Remove dead elements. 
     * Cross reference the list of current elements with an object of data. 
     * If the template object's name is not found in the data, then the
     * template is considered dead (old).
     * @example 
     * // The following objects currently exists in this.elements
     * {user1:Template, user2:Template, user3:Template}
     * // The following objects exist in the passed in data object
     * {user2: {...}, user3: {...}}
     * // user1 is missing in the data. Therefore, the template named
     * // "user1" is no longer relevant, and is removed.
     * @param {Object} data
     */
    removeDeadElements(data){
        for(let [key, element] of this.elements){
            if(!this.getData(data, key)){
                element.remove();
                this.elements.delete(key);
                this.emit("remove", element);
            }
        }
    }

    /**
     * Get the type of the data parameter.
     * @param {Object[]|Object|Map} data 
     * @returns {String|Null}
     */
    getDataType(data){
        if(data instanceof Map){
            return "map";
        }
        else if(Array.isArray(data)){
            return "array";
        }
        else if(typeof data === "object"){
            return "object";
        }
        return null;
    }

    /**
     * Cache data as-is in case the original data is required.
     * todo: handle array, map, and object
     * @param {Array|Map|Object} data 
     */
    cacheData(data){
        return Object.extend({}, data);
    }

    /**
     * Process data to be used for rendering.
     * @param {Array|Map|Object} data 
     * @returns {Array|Map|Object}
     */
    processRenderData(data){
        return data;
    }

    /**
     * Get an object of data from a data parameter based on a key. If the data 
     * is an array of objects, match the key with an object.id property. 
     * Otherwise, just match the name of the key in a map of objects or object
     * of objects.
     * @todo rename.. to something better
     * @param {Object[]|object|Map} data 
     * @param {String} key 
     * @returns {Null|Object}
     */
    getData(data, key){
        switch(this.getDataType(data)){
            case "array":
                let el = data.filter((e) =>{
                    return e[this.primary_key] === key;
                });
                return el && el.length ? el[0] : null;
            case "map":
                return data.get(key);
            case "object":
                return data[key];
            default:
                return null;   
        }
    }

    /**
     * Run through each object of data and render the object into an element.
     * If the data is new, the element will be appended to the wrapper.
     * @param {Object[]|Object|Map} data 
     */
    render(data){
        this.cached_data = this.cacheData(data);
        this.render_data = this.processRenderData(data);
        switch(this.getDataType(data)){
            case "array":
                this.renderArray(data);
                break;
            case "map":
                this.renderMap(data);
                break;
            default:
            case "object":
                this.renderObject(data);
                break;
        }
        if(this.remove_dead_templates){
            this.removeDeadElements(data);
        }
    }

    /**
     * Render elements from an array of data. Each object must have an "id"
     * property.
     * @param {Object[]} data 
     */
    renderArray(data){
        for(let i = 0; i < data.length; i++){
            let id = data[i][this.primary_key];
            if(typeof id === "undefined"){
                console.error("Data must have a primary key property");
                return;
            }
            this.renderElement(id, data[i], i);
        }
    }

    /**
     * Render elements from a map of objects.
     * @param {Map} data 
     */
    renderMap(data){
        let i = 0;
        for(let [key, value] of data){
            this.renderElement(key, value, i);
            i++;
        }
    }

    /**
     * Render elements from an object of objects.
     * @param {Object} data 
     */
    renderObject(data){
        let i = 0;
        for(let k in data){
            this.renderElement(k, data[k], i);
            i++;
        }
    }

    /**
     * Render a single object of data by faking it as an object of objects.
     * Note that if removeDeadElements is set to true (by default), this will
     * remove all other elements.
     * @param {String} id 
     * @param {Object} object 
     */
    renderSingle(id, object){
        let obj = {};
        obj[id] = object;
        this.render(obj);
    }

    /**
     * Render an element found in the element collection.
     * If the element does not exist, create it.
     * @param {Number|String} id - Element and data identifier
     * @param {Object} data - Object of data
     * @param {Number} index - The numerical index of the element
     */
    renderElement(id, data, index){
        let is_new =  false;
        let element = this.elements.get(id);
        if(!element){
            is_new = true;
            element = this.cloneTemplate();
        }
           
        if(element){
            this.appendElement(element);  

            if(element instanceof Template){
                element.render(data);
            }
            else {
                Template.render(element, data);
            }  
            if(is_new){
                this.elements.set(id, element); 
            }
        }        
    }

    /**
     * Convert an array of objects into an object of objects. Each object in 
     * the array must have a primary key.
     * @param {Object[]} data_arr 
     * @param {String} [primary_key="id"] - The key that identifies each data object
     * @returns {Object}
     */
    static dataArrayToDataObject(data_arr, primary_key = 'id'){
        let data_obj = {};
        for(let i = 0; i < data_arr.length; i++){
            let id = data_arr[i][primary_key];
            if(typeof id === "undefined"){
                console.error(`dataArrayToDataObject: object does not have required "${primary_key}" value`)
            }
            else {
                data_obj[id] = data_arr[i];
            }
        }
        return data_obj;
    }
}