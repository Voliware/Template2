/**
 * Element Manager.
 * Can create and manage HTMLElements and Templates.
 * Must be passed a cloneable HTMLElement element 
 * in the constructor to be of any use.
 * @extends {EventSystem}
 * @example
 * // ElementManager would create 3 elements,
 * // render them, and append them to itself
 * let userTempalte = document.getElementById('userTemplate');
 * let userList = document.getElementById('userList');
 * let userElementManager = new ElementManager(userList, userTemplate);
 * userElementManager.render([
 *    {id:0, name: "Jim H", status: "online"},
 *    {id:1, name: "Pam B", status: "offline"},
 *    {id:2, name: "Michael S", status: "online"},
 * ]);
 * // ElementManager would update Jim and Pam, 
 * // but, since Michael no longer exists in the data,
 * // it would remove the element/template with that data.
 * // What is important is that the "id" is matched.
 * userElementManager.render([
 *    {id:0, name: "Jim H", status: "online"},
 *    {id:1, name: "Pam H", status: "online"},
 * ]);
 */
class ElementManager extends EventSystem {

    /**
     * Constructor
     * @param {HTLMElement} wrapper - wrapper element where elements are appended
     * @param {HTMLElement} template - a cloneable HTMLElement or Template
     * @param {object} [options]
     * @param {string} [options.primaryKey="id"] - necessary for rendering data from
     *                  arrays of objects. Otherwise, ElementManager will just empty
     *                  itself and rebuild from scratch.
     * @param {number} [options.maxElements=0] - max element count
     * @param {boolean} [options.cloneTemplate=true] - whether to clone the initial
     *                  template from the DOM. Most of the time, you want to do this.   
     * @param {boolean} [options.removeTemplate=true] - whether to remove the initial
     *                  template on the DOM. Most of the time, you want to do this,
     *                  unless there are many ElementManagers using the same template.                  
     * @param {boolean} [options.removeDeadTemplates=true] - whether to remove dead 
     *                  templates. A template is dead when it does not exist 
     *                  in new data passed to render()
     * @returns {ElementManager}
     */
    constructor(wrapper, template, options){
        super();
        let defaults = {
            primaryKey: "id",
            maxElements: 0,
            cloneTemplate: true,
            removeTemplate: true,
            removeDeadTemplates: true
        };
        this.options = Object.extend(defaults, options);

        /**
         * The element in which all templates will be appended to.
         * @type {HTMLElement}
         */
        this.wrapper = wrapper;

        /**
         * A Template HTMLElement to create new templates from.
         * @type {HTMLElement}
         */
        this.template = this.options.cloneTemplate ? template.cloneNode(true) : template
        this.template.removeAttribute('id');
        this.template.classList.remove('template');

        /**
         * A Map of Templates, such as
         * { "User1" => UserRowTemplate,
         *   "User2" => UserRowTemplate.. }
         * @type {Map}
         */
        this.elements = new Map();

        // remove the original template from the DOM
        // it will always be cloneable from this.template
        if(this.options.removeTemplate){
            template.remove();
        }

        this.cachedData = {};
        this.processedRenderData = {};

        return this;
    }

    /**
     * Cache data as-is in case the 
     * original data is required.
     * @param {object} data 
     */
    cacheData(data){
        return Object.extend({}, data);
    }

    /**
     * Process data to be used for rendering.
     * @param {object} data 
     * @returns {object}
     */
    processRenderData(data){
        return data;
    }
    
    /**
     * Empty the contents of the template manager
     * @returns {ElementManager}
     */
    empty(){
        while (this.wrapper.firstChild) {
            this.wrapper.removeChild(this.wrapper.firstChild);
        }
        this.elements = new Map();
        return this;
    }

    /**
     * Attach handlers to an element
     * @param {HTLMElement} element 
     * @returns {ElementManager}
     */
    attachElementHandlers(element){
        return this;
    }

    /**
     * Create a new clone of the template.
     * Attach handlers to it.
     * @returns {HTLMElement}
     */
    cloneTemplate(){
        let element = this.template.cloneNode(true);
        this.attachElementHandlers(element);
        return element;
    }

    /**
     * Append an element to the wrapper
     * @param {HTLMElement} element 
     * @returns {ElementManager}
     */
    appendElement(element){
        this.wrapper.appendChild(element);
        return this;
    }

    /**
     * Append an element before an element
     * @param {HTLMElement} element 
     * @param {HTMLElement} elementTo
     * @returns {ElementManager}
     */
    appendElementBefore(element, elementTo){
        elementTo.before(element);
        return this;
    }

    /**
     * Append an element after an element
     * @param {HTLMElement} element 
     * @param {HTMLElement} elementTo
     * @returns {ElementManager}
     */
    appendElementAfter(element, elementTo){
        elementTo.after(element);
        return this;
    }

    /**
     * Remove an element by id.
     * Removes from the DOM and collection.
     * @param {string} id 
     * @returns {ElementManager}
     */
    removeElement(id){
        let element = this.elements.get(id);
        if(element){
            this.wrapper.removeChild(element);
            this.elements.delete(id);
        }
        return this;
    }

    /**
     * Remove dead elements. 
     * Cross reference the list of current elements
     * with an object of data. If the template object's name
     * is not found in the data, then the template is considered dead (old).
     * @example // The following objects currently exists in this.elements
     *           { user1:Template, user2:Template, user3:Template }
     *          // The following objects exist in the passed in data object
     *           { user2: {...}, user3: {...} }
     *          // user1 is missing in the data. Therefore, the template named
     *          // "user1" is no longer relevant, and is removed.
     * @param {object} data
     * @returns {ElementManager}
     */
    removeDeadElements(data){
        for(let [key, element] of this.elements){
            if(!this.getData(data, key)){
                element.remove();
                this.elements.delete(key);
            }
        }
        return this;
    }

    /**
     * Get the type of the data parameter.
     * @param {object[]|object|Map} data 
     * @returns {string}
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
     * Get an object of data from a data
     * parameter based on a key. 
     * If the data is an array of objects,
     * match the key with an object.id property.
     * Otherwise, just match the name of the key
     * in a map of objects or object of objects.
     * todo: rename.. to something better
     * @param {object[]|object|Map} data 
     * @param {string} key 
     * @returns {null|object}
     */
    getData(data, key){
        switch(this.getDataType(data)){
            case "array":
                let el = data.filter(function(e){
                    return e.id === key;
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
     * Run through each object of data and render the object
     * into an element. If the data is new, the
     * element will be appended to the wrapper.
     * @param {object[]|object|Map} data 
     * @returns {ElementManager}
     */
    render(data){
        this.cachedData = this.cacheData(data);
        this.processedRenderData = this.processRenderData(data);
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
        if(this.options.removeDeadTemplates){
            this.removeDeadElements(data);
        }
        return this;
    }

    /**
     * Render elements from an array of data.
     * Each object must have an "id" property.
     * @param {object[]} data 
     * @returns {ElementManager}
     */
    renderArray(data){
        for(let i = 0; i < data.length; i++){
            let id = data[i][this.options.primaryKey];
            if(typeof id === "undefined"){
                console.error("ElementManager.renderArray: data must have a primary key property");
                return;
            }
            this.renderElement(id, data[i], i);
        }
        return this;
    }

    /**
     * Render elements from a map of objects.
     * @param {Map} data 
     * @returns {ElementManager}
     */
    renderMap(data){
        let i = 0;
        for(let [key, value] of data){
            this.renderElement(key, value, i);
            i++;
        }
        return this;
    }

    /**
     * Render elements from an object of objects.
     * @param {object} data 
     * @returns {ElementManager}
     */
    renderObject(data){
        let i = 0;
        for(let k in data){
            this.renderElement(k, data[k], i);
            i++;
        }
        return this;
    }

    /**
     * Render a single object of data by faking
     * it as an object of objects.
     * Note that if removeDeadElements is 
     * set to true (by default), this will 
     * remove all other elements.
     * @param {string} id 
     * @param {object} object 
     * @returns {ElementManager}
     */
    renderSingle(id, object){
        let obj = {};
        obj[id] = object;
        this.render(obj);
        return this;
    }

    /**
     * Render an element found in the element collection.
     * If the element does not exist, create it.
     * @param {number|string} id - element and data identifier
     * @param {object} data - object of data
     * @param {number} index - the numerical index of the element
     * @returns {ElementManager}
     */
    renderElement(id, data, index){
        let isNew =  false;
        let element = this.elements.get(id);
        if(!element){
            isNew = true;
            element = this.cloneTemplate();
            this.appendElement(element);             
        }
        
        if(element){
            if(element instanceof Template){
                element.render(data);
            }
            else {
                Template.render(element, data);
            }  
            if(isNew){
                this.elements.set(id, element); 
            }
        }

        return this;
    }

    /**
     * Convert an array of objects into an 
     * object of objects. Each object in the
     * array must have a primary key.
     * @param {object[]} dataArr 
     * @param {string} [primaryKey="id"] - the key that identifies each data object
     * @returns {object}
     */
    static dataArrayToDataObject(dataArr, primaryKey = 'id'){
        let dataObj = {};
        for(let i = 0; i < dataArr.length; i++){
            let id = dataArr[i][primaryKey];
            if(typeof id === "undefined"){
                console.error(`dataArrayToDataObject: object does not have required "${primaryKey}" value`)
            }
            else {
                dataObj[id] = dataArr[i];
            }
        }
        return dataObj;
    }
}