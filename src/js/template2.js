/*
 * Template v2.0.0
 * By Anthony Agostino - anthagostino|at|gmail[dot]com
 * GPL 3.0 license
 * 
 * Template is a front-end library used to render and
 * create re-useable HTMLElements. It relies on the 
 * Custom Elements system. Custom elements are a way to 
 * define new HTMLElements with your own behaviours. 
 * For example, you can define a custom HTMLElement in 
 * your HTML page like so. 
 * 
 * <!-- html -->
 * <my-element>
 *    <div class="popup">
 *        <div class="message"></div>
 *    </div>
 * </my-element>
 * 
 * // js
 * class MyElement extends HTMLElement {
 *     connectedCallback(){
 *         this.innerHTML = "Some text";
 *         this.addHandlers();
 *     }
 *     addHandlers(){
 *         this.addEventListner('click', function(){
 *             console.log("clicked!");
 *         });
 *     }
 * }
 * // this line hooks up the element to your class
 * customElements.define('my-element', MyElement);
 * 
 * Suggested, but not necessary reading: https://tinyurl.com/y7vqn4df.
 * 
 * Template is built on the notion that your HTML stays in your .html 
 * files, and your javascript and logic stays in your .js files.
 * Template is extremely simple, and is not like learning a new
 * language or system like the complex render systems of today.
 * If you know the basics of vanilla JS in the browser, Template
 * is really just a wrapper for that, in many ways like jQuery is.
 * The difference is that Template has no animation system
 * (suggested library is anime.js) and uses much simpler code.
 * This version of Template is also built to use all of the latest
 * browser APIs and ES6. There is absolutely no guarentee of 
 * supporting older browsers.
 * 
 * Template comes with many static functions, such as 
 * Template.show(element), Template.addClass(element, className),
 * and so on. These static functions are just vanilla JS wrappers.
 * That means that Template does not need to convert the entire
 * element to a super-element of some sort. It performs the action
 * in the fastest way possible. All static Template functions are
 * also available as object functions when you create an actual 
 * Template element, such as myTemplate.addClass('hidden').
 * 
 * The Template class itself extends HTMLElement. It provides
 * methods to render the entire contents of the HTMLElement
 * with one function and one object of data, render(). Data is 
 * matched to HTMLElements based on some HTML attribute, typically 
 * "data-name". Template also provides a few common HTML 
 * and CSS manipulating methods like setting attributes.
 * Any time you extend the Template class to create your own
 * custom element, you simply extend Template, and at the bottom
 * of the class definition, register it with customElements.
 * 
 * class MyElement extends Template { 
 *     connectedCallback(){
 *         this.hide();
 *     }
 * }
 * customElements.define('my-element', MyElement);
 * 
 * Template does not use the shadow dom. It is preferred that
 * DOM is accessible, especially to make developer's lives easy.
 * 
 * Template also wraps up a custom EventSystem, which perfectly mimics
 * jQuery's namespace-style events. That is, events can be namespaced
 * such as .on("click.dropdown") or further .on("click.dropdown.ev").
 * This EventSystem can also be used standalone.
 * 
 * The Template library also has a ElementManager, which, when
 * given an array of objects, map of objects, or object of objects,
 * automagically creates, updates (renders), or destroys HTMLElements.
 * This can be used to easily generate a table of rows, where each
 * row is built off of the same Template that ElementManager
 * knows about. Of course, ElementManager can also render Templates. 
 * This can be much more powerful because, when rendering, the 
 * Template's render() function will be called. 
 * Otherwise, if it is just an HTMLElement, the static method
 * Template.render(element, data) will be callled.
 * 
 * Template and ElementManager both have the notion of 
 * preserving data and processing data. When either are
 * fed data to render(), the data is always cached as-is in an 
 * object called cachedData, and then processed into an object
 * called renderData. That ensures that your data is never mutated.
 * 
 * This library also comes with some predefined classes that
 * extend Template: FormTemplate, TableTemplate, FeedbackTemplate, 
 * PopupTemplate, and StatusTemplate. 
 * FormTemplate wraps a basic <form> element and provides some 
 * improved serialization and submission functionality. 
 * TableTemplate wraps a basic <table> element and  provides easy
 * ways to build tables.
 * PopupTemplate is a very simple popup or modal.
 * FeedbackTemplate and StatusTemplate are basic elements that 
 * provide an easy way to indicate the status of something, or to give
 * feedback on an action.
 */

 // helpers

/**
 * Set all properties of an object from
 * another object, if both objects have
 * matching properties.
 * @param {object} obj - the object to alter
 * @param {object} data - an object of data
 * @return {object} the original object
 */
Object.setProperties = function(obj, data){
    for(let k in data){
        if(obj.hasOwnProperty(k)){
            obj[k] = data[k];
        }
    }
    return obj;
}

/**
 * Check if an object is empty
 * @param {object} obj - the object to check
 * @return {boolean}
 */
Object.isEmpty = function(obj){
    return !Object.keys(obj).length;
}

/**
 * Extends an object into another
 * @return {object}
 */
Object.extend = function(){
    for(let i = 1; i < arguments.length; i++) {
        for(let key in arguments[i]) {
            if(arguments[i].hasOwnProperty(key)) { 
                if (typeof arguments[0][key] === 'object' && typeof arguments[i][key] === 'object') {
                    Object.extend(arguments[0][key], arguments[i][key]);
                }
                else {
                    arguments[0][key] = arguments[i][key];
                }
            }
        }
    }
    return arguments[0];	
}

/**
 * Flatten a nested object into a more simple object.
 * https://tinyurl.com/y6oe2ebq
 * @param {object} obj
 * @return {object}
 * @example 
 * Object.flatten({a: {b: 1, c: 2}}); // {"a.b": 1, "a.c": 2}
 */
Object.flatten = function(obj){
    var toReturn = {};

    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if ((typeof obj[i]) == 'object' && obj[i] !== null) {
            var flatObject = Object.flatten(obj[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;
                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = obj[i];
        }
    }
    return toReturn;
}

/**
 * Unflatten an object into a nested object
 * https://tinyurl.com/y536fqrf
 * @param {object} obj
 * @return {object}
 * @example
 * Object.unflatten({"a.b": 1, "a.c": 2}); // {a: {b: 1, c: 2}}
 */
Object.unflatten = function(obj){
    let result = {};
    for (let i in obj) {
        let keys = i.split('.');
        keys.reduce(function(r, e, j) {
            return r[e] || (r[e] = isNaN(Number(keys[j + 1])) ? (keys.length - 1 == j ? obj[i] : {}) : []);
        }, result);
    }
    return result;
};

/**
 * Creates a random string of characters
 * @param {number} len - length of the string
 * @return {string}
 */
String.random = function(len){
    var s = '';
    var randomchar = function() {
      var n = Math.floor(Math.random() * 62);
      if (n < 10) return n; //1-10
      if (n < 36) return String.fromCharCode(n + 55); //A-Z
      return String.fromCharCode(n + 61); //a-z
    }
    while (s.length < len) s += randomchar();
    return s;
}

/**
 * Get a set of matching elements by data-name attribute
 * @param {string} dataname - the data-name attribute value
 * @return {HTMLElement[]}
 */
document.getElementsByDataName = function(dataName){
    return document.querySelectorAll(`[data-name="${dataName}"]`);
};

/**
 * Get the first matching element by data-name attribute
 * @param {string} dataname - the data-name attribute value
 * @return {HTMLElement}
 */
document.getElementByDataName = function(dataName){
    let elements = document.getElementsByDataName(dataName);
    if(elements.length){
        return elements[0];
    }
    return null;
};

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

/**
 * An event system identical to jQuery's with namespace handling.
 * @example
 * let es = new EventSystem();
 * es.on('click', function(){
 *     console.log("click!");
 * });
 * es.on('click.you', function(){
 *     console.log("click you!")
 * });
 * es.emit("click"); // click! click you!
 * es.off("click.you");
 * es.emit("click"); // click!
 */
class EventSystem  {

    /**
     * Constructor
     * @return {EventSystem}
     */
    constructor(){
        this.events = {};
        return this;
    }

    /**
     * Get the number of handlers for an event.
     * Will look through all namespaced events as well.
     * @param {string} event 
     * @return {number}
     */
    getHandlersCount(event){
        let eventObject = this.events[event];
        if(!eventObject){
            return 0;
        }

        let count = 0;
        countHandlers(eventObject);
        return count;

        /**
         * Recursively count all handlers
         * @param {object} obj 
         */
        function countHandlers(obj){
            for(let k in obj){
                if(k === "_handlers"){
                    count += obj[k].length;
                }
                else if(typeof obj[k] === 'object') {
                    countHandlers(obj[k])
                }
            }
        }
    }

    /**
     * Attach an event.
     * Supports namespace handling.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {function} callback - a function to run when the event is emitted
     * @return {EventSystem}
     */
    on(event, callback) {
        let eventArray = event.split('.');
  
        let lastObject = this.events;
        for (let i = 0; i < eventArray.length; i++) {
            let currentEventNamespace = eventArray[i];
            if (!lastObject[currentEventNamespace]) {
                lastObject[currentEventNamespace] = {};
            }
            if (i === eventArray.length - 1) {
                if (!Array.isArray(lastObject[currentEventNamespace]._handlers)) {
                    lastObject[currentEventNamespace]._handlers = [];
                }
                lastObject[currentEventNamespace]._handlers.push(callback);
            } 
            else {
                lastObject = lastObject[currentEventNamespace];
            }
        }
        return this;
    }

    /**
     * Attach and event that only runs once.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {function} callback - a function to run when the event is emitted
     * @return {EventSystem}
     */
    one(event, callback) {
        let self = this;
        let newEventName = event + "." + String.random(8);
        let newCallback = function(data) {
            callback(data);
            self.off(newEventName);
        }
        this.on(newEventName, newCallback);
        return this;
    }
  
    /**
     * Remove an event.
     * If removeAllChildren is set to true, it will also remove any namespaced handlers.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {boolean} [removeAllChildHandlers=true] - whether to remove all child events
     * @return {EventSystem}
     */
    off(event, removeAllChildHandlers = true) {
        let eventArray = event.split('.');

        let lastObject = this.events;
        for (let i = 0; i < eventArray.length; i++) {
            let currentEventNamespace = eventArray[i];
            if (i === eventArray.length - 1) {
                if (removeAllChildHandlers) {
                    delete lastObject[currentEventNamespace];
                } else {
                    delete lastObject[currentEventNamespace]._handlers;
                    if (Object.keys(lastObject[currentEventNamespace]).length === 0) {
                        delete lastObject[currentEventNamespace];
                    }
                }
            } else {
                lastObject = lastObject[currentEventNamespace];
            }
        }

        // todo: add a cleanup method to remove empty parents

        return this;
    }

    /**
     * Emit an event.
     * This will emit all namespaced child events.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {*} data - data to pass along with the event
     * @return {EventSystem}
     */
    emit(event, data) {
        let eventArray = event.split('.');

        let lastObject = this.events;
        for (let i = 0; i < eventArray.length; i++) {
            let currentEventNamespace = eventArray[i];
			lastObject = lastObject[currentEventNamespace];
            if (i === eventArray.length - 1) {
                _emit(lastObject, data);
            } 
        }

        /**
         * Recursively emit event handlers 
         * through the handler tree.
         * @param {object} obj 
         * @param {*} data 
         */
        function _emit(obj, data) {
            for (let k in obj) {
                if (k === "_handlers") {
                    for (let x = 0; x < obj[k].length; x++) {
                        obj[k][x](data);
                    }
                } else {
                    _emit(obj[k], data);
                }
            }
        }

        return this;
    }
}
  
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
     * @return {ElementManager}
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
     * @return {object}
     */
    processRenderData(data){
        return data;
    }
    
    /**
     * Empty the contents of the template manager
     * @return {ElementManager}
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
     * @return {ElementManager}
     */
    attachElementHandlers(element){
        return this;
    }

    /**
     * Create a new clone of the template.
     * Attach handlers to it.
     * @return {HTLMElement}
     */
    cloneTemplate(){
        let element = this.template.cloneNode(true);
        this.attachElementHandlers(element);
        return element;
    }

    /**
     * Append an element to the wrapper
     * @param {HTLMElement} element 
     * @return {ElementManager}
     */
    appendElement(element){
        this.wrapper.appendChild(element);
        return this;
    }

    /**
     * Append an element before an element
     * @param {HTLMElement} element 
     * @param {HTMLElement} elementTo
     * @return {ElementManager}
     */
    appendElementBefore(element, elementTo){
        elementTo.before(element);
        return this;
    }

    /**
     * Append an element after an element
     * @param {HTLMElement} element 
     * @param {HTMLElement} elementTo
     * @return {ElementManager}
     */
    appendElementAfter(element, elementTo){
        elementTo.after(element);
        return this;
    }

    /**
     * Remove an element by id.
     * Removes from the DOM and collection.
     * @param {string} id 
     * @return {ElementManager}
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
     * @return {ElementManager}
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
     * @return {string}
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
     * @return {null|object}
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
     * @return {ElementManager}
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
     * @return {ElementManager}
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
     * @return {ElementManager}
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
     * @return {ElementManager}
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
     * @return {ElementManager}
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
     * @return {ElementManager}
     */
    renderElement(id, data, index){
        let isNew =  false;
        let element = this.elements.get(id);
        if(!element){
            isNew = true;
            element = this.cloneTemplate();
        }
        
        if(element){
            if(isNew){
                this.elements.set(id, element);
                this.appendElement(element);              
            }
            if(element instanceof Template){
                element.render(data);
            }
            else {
                Template.render(element, data);
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
     * @return {object}
     */
    static dataArrayToDataObject(dataArr, primaryKey = 'id'){
        let dataObj = {};
        for(let i = 0; i < dataArr.length; i++){
            let id = dataArr[i][primaryKey];
            dataObj[id] = dataArr[i];
        }
        return dataObj;
    }
}

/**
 * An enhanced HTMLElement.
 * Has more control over its child elements
 * by capturing them during initialization 
 * into the local "elements" object. Each child element
 * is captured by any desired element attribute and,
 * if named appropriately, can be rendered with data via render().
 * Provides a namespaced EventSystem with on/off handlers.
 * Has a render function that takes in an object of data and
 * populates child elements with same-named attributes.
 * @extends {HTMLElement}
 */
class Template extends HTMLElement {

    /**
     * Constructor
     * @param {object} [options={}]
     * @param {object} [options.elements={}] - a collection of element selectors
     *                  to capture child elements of the Template
     * @param {boolean} [options.createHtml=false] - whether to run the
     *                  createHtml() function on connectedCallback(). 
     *                  Note that it will also run if innerHTML is empty. 
     * @param {string} [options.renderAttribute="data-name"] - the attribute of
     *                  each child element to match data in render() with
     * @param {boolean} [options.displayBlock=true] - whether to add the 
     *                  'template-block' class to the template on connectedCallback()
     * @return {Template}
     */
    constructor(options = {}){
        super();
        let defaults = {
            elements: {},
            createHtml: false,
            renderAttribute: 'data-name',
            displayBlock: true
        };
        this.options = Object.extend(defaults, options);
        this.eventSystem = new EventSystem();
        this.elements = {};
        this.cachedData = {};
        this.renderData = {};
        return this;
    }

    /**
     * This callback is fired when the element is appended
     * to the DOM, or when it is loaded if it's already there.
     * This is where HTML can be modified, and attributes
     * can be modified. That cannot happen in the constructor.
     */
    connectedCallback(){
        if(this.options.createHtml || this.innerHTML === ""){
            this.createHtml();
        }
        this.findElements(this.options.elements);
        // by default, templates have no display
        if(this.options.displayBlock){
            this.classList.add('template-block');
        }
        if(this.htmlTemplate){
            this.setAttributes(this.htmlTemplate.attributes);
        }
    }


    /**
     * Add an event handler. If this is a native
     * DOM event, such as click, it will be added to
     * and called by the native event system.
     * @param {string} event 
     * @param {function} callback 
     * @return {Template}
     */
    on(event, callback) {
        let self = this;
        let baseEvent = event.split('.')[0];

        // always add to native DOM event handler
        // if it doesn't exist it is harmless
        if(this.eventSystem.getHandlersCount(baseEvent) === 0){
            this.addEventListener(baseEvent, function(e){
                self.emit(baseEvent, e);
            });
        }

        this.eventSystem.on(event, callback);
        return this;
    }

    /**
     * Add an event handler that firwa once.
     * @param {string} event 
     * @param {function} callback 
     * @return {Template}
     */
    one(event, callback) {
        let self = this;
        let baseEvent = event.split('.')[0];

        // always add to native DOM event handler
        // if it doesn't exist it is harmless
        if(this.eventSystem.getHandlersCount(baseEvent) === 0){
            this.addEventListener(baseEvent, function(e){
                self.emit(baseEvent, e);
                self.removeEventListener(baseEvent, callback);
            });
        }

        this.eventSystem.one(event, callback);
        return this;
    }
  
    /**
     * Remove an event. Also removes it from the native event system.
     * If removeAllChildren is set to true, it will also remove any namespaced handlers.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {boolean} [removeAllChildHandlers=true] - whether to remove all child events
     * @return {Template}
     */
    off(event, removeAllChildHandlers = true) {
        let baseEvent = event.split('.')[0];
        this.eventSystem.off(event, removeAllChildHandlers);
        if(this.eventSystem.getHandlersCount(event) > 0){
            this.removeEventListener(baseEvent);
        }
        return this;
    }

    /**
     * Emit an event.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {*} data - data to pass along with the event
     * @return {EventSystem}
     */
    emit(event, data){
        this.eventSystem.emit(event, data);
        return this;
    }
    
    /**
     * Construct some HTML.
     * @return {Template}
     */
    createHtml(){
        return this;
    }

    /**
     * Set attributes from a NamedNodeMap
     * @param {NamedNodeMap} attributes 
     * @return {Template}
     */
    setAttributes(attributes){
        for(let i = 0; i < attributes.length; i++){
            let attr = attributes[i];
            this.setAttribute(attr.name, attr.value);
        }
        return this;
    }

    /**
     * Find and register elements into the elements object.
     * @return {object}
     */
    findElements(elements){
        for(let k in elements){
            this.elements[k] = this.querySelector(elements[k]);
        }
        return this.elements;
    }
        
    // tree

    /**
     * Find the first matching child element of another element.
     * @param {HTMLElement} element - HTMLElement to search through
     * @param {string} selector - any valid css selector
     * @return {HTMLElement|undefined}
     */
    static find(element, selector){
        return element.querySelectorAll(selector)[0];
    }

    /**
     * Find the first matching child element of another element.
     * @param {string} selector - any valid css selector
     * @return {HTMLElement|undefined}
     */
    find(selector){
        return Template.find(this, selector);
    }

    /**
     * Find all matching child elements of another element.
     * @param {HTMLElement} element - HTMLElement to search through
     * @param {string} selector - any valid css selector
     * @return {HTMLElement|undefined}
     */
    static findAll(element, selector){
        return element.querySelectorAll(selector);
    }

    /**
     * Find all matching child elements of another element.
     * @param {string} selector - any valid css selector
     * @return {HTMLElement|undefined}
     */
    findAll(selector){
        return Template.findAll(this, selector);
    }

    /**
     * Find the last matching child element of another element.
     * @param {HTMLElement} element - HTMLElement to search through
     * @param {string} selector - any valid css selector
     * @return {HTMLElement|undefined}
     */
    static findLast(element, selector){
        let el = element.querySelectorAll(selector);
        return el[el.length - 1];
    }

    /**
     * Find the last matching child element of another element.
     * @param {string} selector - any valid css selector
     * @return {HTMLElement|undefined}
     */
    findLast(selector){
        return Template.findLast(selector);
    }

    /**
     * Append one element to another element
     * @param {HTMLElement} element - the element to append
     * @param {HTMLElement} toElement - the element to append to
     * @return {Template}
     */
    static append(element, toElement){
        toElement.appendChild(element);
    }

    /**
     * Append an element 
     * @param {HTMLElement} element 
     * @return {Template}
     */
    append(element){
        Template.append(element, this);
        return this;
    }

    /**
     * Append to another element
     * @param {HTMLElement} element 
     * @return {Template}
     */
    appendTo(element){
        Template.append(this, element);
        return this;
    }

    /**
     * Prepend an element to another element
     * @param {HTMLElement} element - the element to prepend
     * @param {HTMLElement} toElement - the element to prepend to
     */
    static prepend(element, toElement){
        toElement.insertBefore(element, toElement.firstChild);
    }

    /**
     * Prepend another element
     * @param {HTMLElement} element 
     * @return {Template}
     */
    prepend(element){
        Template.prepend(element, this);
        return this;
    }

    /**
     * Prepend to another element
     * @param {HTMLElement} element 
     * @return {Template}
     */
    prependTo(element){
        Template.prepend(this, element);
        return this;
    }

    /**
     * Empty the contents of an element
     * @param {HTMLElement} element 
     */
    static empty(element){
        while (this.element) {
            element.removeChild(element.firstChild);
        }
    }

    /**
     * Empty the contents of the Template
     * @return {Template}
     */
    empty(){
        Template.empty(this);
        return this;
    }

    // visibility

    /**
     * Determine if an element is visible
     * @param {HTMLElemet} element 
     * @return {boolean}
     */
    static isVisible(element){
        // taken from jquery
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    }

    /**
     * Determine if the Template is visible
     * @return {boolean}
     */
    isVisible(){
        return Template.isVisible(this);
    }

    /**
     * Hide an element 
     * @param {HTMLElemet} element 
     */
    static hide(element){
        element.style.display = "none";
    }

    /**
     * Hide the Template
     * @return {Template}
     */
    hide(){
        Template.hide(this);
        return this;
    }

    /**
     * Show an element 
     * @param {HTMLElemet} element 
     */
    static show(element){
        element.style.display = "block";
    }

    /**
     * Show the Template 
     * @return {Template}
     */
    show(){
        Template.show(this);
        return this;
    }

    /**
     * Toggle the display of an element by 
     * adding or removing the hidden class
     * @param {HTMLElement} element 
     * @param {boolean} state 
     */
    static toggle(element, state){
        if(typeof state === "undefined"){
            state = !Template.isVisible(element);
        }
        return state ? Template.show(element) : Template.hide(element);
    }

    /**
     * Toggle the display of the Template by 
     * adding or removing the hidden class
     * @param {boolean} state 
     * @return {Template}
     */
    toggle(state){
        Template.toggle(this, state);
        return this;
    }

    // styles

    /**
     * Get the value of a style of an element
     * @param {HTMLElement} element 
     * @param {string} style - style such as opacity, height, etc
     * @return {string}
     */
    static getStyle(element, style){
        return window.getComputedStyle(element).getPropertyValue(style);
    }

    /**
     * Get the value of a style of the Template
     * @param {string} style - style such as opacity, height, etc
     * @return {string}
     */
    getStyle(style){
        return Template.getStyle(this, style);
    }

    // dimensions

    /**
     * Set the height of an element
     * @param {HTMLElement} element 
     * @param {number} height 
     */
    static setHeight(element, height){
        element.style.height = height + 'px';
    }

    /**
     * Set the height of the Template
     * @param {number} height 
     * @return {Template}
     */
    setHeight(height){
        Template.setHeight(this, height);
        return this;
    }

    /**
     * Set the width of an element
     * @param {HTMLElement} element 
     * @param {number} width 
     */
    static setWidth(element, width){
        element.style.width = width + 'px';
    }

    /**
     * Set the width of the Template
     * @param {number} width 
     * @return {Template}
     */
    setWidth(width){
        Template.setWidth(this, width);
        return this;
    }

    // class

    /**
     * Add a class to an element
     * @param {HTMLElement} element 
     * @param {string} clazz 
     */
    static addClass(element, clazz){
        element.classList.add(clazz);
    }

    /**
     * Add a class to the Template
     * @param {string} clazz 
     * @return {Template}
     */
    addClass(clazz){
        Template.addClass(this, clazz);
        return this;
    }

    /**
     * Determine if an element has a class
     * @param {HTMLElement} element 
     * @param {string} clazz 
     * @return {boolean}
     */
    static hasClass(element, clazz){
        return element.classList.contains(clazz);
    }

    /**
     * Determine if the Template has a class
     * @param {string} clazz 
     * @return {boolean}
     */
    hasClass(clazz){
        return Template.hasClass(this, clazz);
    }

    /**
     * Remove a class from an element
     * @param {HTMLElement} element 
     * @param {string} clazz 
     */
    static removeClass(element, clazz){
        element.classList.remove(clazz);
    }

    /**
     * Remove a class from the Template
     * @param {string} clazz 
     * @return {Template}
     */
    removeClass(clazz){
        Template.removeClass(this, clazz);
        return this;
    }

    /**
     * Replace a class of an element with another
     * @param {HTMLElement} element 
     * @param {string} oldClass - class to replace
     * @param {string} newClass - class to add
     */
    static replaceClass(element, oldClass, newClass){
        element.classList.replace(oldClass, newClass);
    }

    /**
     * Replace a class of the Template with another
     * @param {string} oldClass - class to replace
     * @param {string} newClass - class to add
     * @return {Template}
     */
    replaceClass(oldClass, newClass){
        Template.replaceClass(this, oldClass, newClass);
        return this;
    }

    /**
     * Toggle a class of an element.
     * If no state boolean is passed, set the
     * class state to its opposite
     * @param {HTMLElement} element 
     * @param {string} clazz 
     * @param {boolean} [state]
     */
    static toggleClass(element, clazz, state){
        element.classList.toggle(clazz, state);
    }
    
    /**
     * Toggle a class of the Template.
     * If no state boolean is passed, set the
     * class state to its opposite
     * @param {string} clazz 
     * @param {boolean} [state]
     * @return {Template}
     */
    toggleClass(clazz, state){
        Template.toggleClass(this, clazz, state);
        return this;
    }

    // enable/disable

    /**
     * Set an element to enabled by
     * setting the disabled state to false.
     * @param {HTMLElement} element 
     */
    static enable(element){
        element.disabled = false;
    }

    /**
     * Set the Template to enabled by
     * setting the disabled state to false.
     * @return {Template}
     */
    enable(){
        Template.enable(this);
        return this;
    }

    /**
     * Set an element to disabled.
     * @param {HTMLElement} element 
     */
    static disable(element){
        element.disabled = true;
    }

    /**
     * Set the Template to disabled.
     * @return {Template}
     */
    disable(){
        Template.disable(this);
        return this;
    }

    // render

    /**
     * Cache data as-is in case the 
     * original data is required.
     * @param {object} data 
     */
    cacheData(data){
        return this.cachedData = Object.extend({}, data);
    }

    /**
     * Process data to be used for rendering.
     * @param {object} data 
     * @return {object}
     */
    processRenderData(data){
        return this.renderData = data;
    }

    /**
     * Render an element from an object of data.
     * This only renders (sets values, sets text, etc) elements
     * that are children of the element. 
     * If the element has any inputs or selects, this will set their
     * values in the most appropriate manner.
     * Otherwise, the element must have child elements who have
     * [data-name] attributes set. Each element with a 
     * [data-name] attribute will have its input value
     * or its innerHTML set to the data found in the data object.
     * This data is found by matching the value of the [data-name]
     * attribute to the key of a value in the object.
     * If the HTMLElement is a Template, the render() function
     * will be called instead.
     * If the element has an options.renderAttribute set, then render()
     * can use that value instead of the [data-name]. For example,
     * if htmlElement.options.renderAttribute="name", then instead of 
     * looking for an element's [data-name] attribute, it will look for
     * its [name] attribute.
     * @param {HTMLElement} htmlElement 
     * @param {object} data 
     * @example
     * // fill a div with data
     * let myDiv = document.getElementById('myDiv');
     * Template.render(myDiv, {name: "Bob", status: "online"});
     * // <div id="myDiv">
     * //    <span data-name="name">Bob</span>
     * //    <span data-name="status">online</span>
     * // </div>
     * @example
     * // fill a form with data
     * let myForm = document.getElementById('myForm');
     * myForm.options = myForm.options || {};
     * myForm.options.renderAttribute = "name";
     * Template.render(myForm, {name: "Bob", status: "online"});
     * // the input value will be "Bob"
     * // the select value will be "online"
     * // <form id="myForm">
     * //     <input name="name" type="text">
     * //     <select name="status">
     * //         <option value="offline">Offline</option>
     * //         <option value="online">Online</option>
     * //     </select>
     * // </form>
     */
    static render(htmlElement, data){
        let renderAttribute = htmlElement.options && htmlElement.options.renderAttribute 
            ? htmlElement.options.renderAttribute 
            : 'data-name';

        let _data = Object.flatten(data);
        for(let k in _data){
            let value = _data[k];
            let elements = htmlElement.querySelectorAll(`[${renderAttribute}="${k}"]`);
            for(let i = 0; i < elements.length; i++){
                let element = elements[i];
                if(element instanceof Template){
                    element.render(value);
                }
                else if(element instanceof HTMLInputElement){
                    let type = element.getAttribute('type');
                    if(type === 'checkbox'){
                        if(value){
                            element.checked = true;
                        }
                    }
                    else if(type === 'radio'){
                        if(element.getAttribute('value') === value){
                            element.checked = true;
                        }
                    }
                    else {
                        element.value = value;
                    }
                }
                else if (element instanceof HTMLSelectElement){
                    element.value = value;
                }
                else {
                    elements[i].innerHTML = value;
                }
            }
        }
    }

    /**
     * Render the Template.
     * Cache and process the render data.
     * @param {object} data 
     * @return {Template}
     */
    render(data){
        this.cacheData(data);
        this.processRenderData(Object.extend({}, data));
        Template.render(this, this.renderData);
        return this;
    }
}
Template.__global__ = {
    es: new EventSystem(),
    idg: new IdGenerator(),
    events: {}
};
customElements.define('template-element', Template);

/**
 * Form Template
 * @extends {Template}
 */
class FormTemplate extends Template {

    /**
     * Constructor
     * @param {object} [options] 
     * @param {function} [options.getRequest]
     * @param {function} [options.submitRequest]
     * @param {function} [options.validateRequest]
     * @param {number} [options.checkboxMode]
     * @param {number} [options.serializeMode]
     * @param {string[]} [options.excludedFields=['disalbed']]
     * @param {boolean} [options.useTemplate=true]
     * @param {string} [options.renderAttribute]
     * @param {object} [options.elements]
     * @param {string} [options.elements.form]
     * @param {string} [options.elements.resetButton]
     * @param {string} [options.elements.submitButton]
     * @return {FormTemplate}
     */
    constructor(options = {}){
        let defaults = {
            getRequest: null,
            submitRequest: null,
            validateRequest: null,
			checkboxMode: FormTemplate.checkboxMode.number,
            serializeMode: FormTemplate.serializeMode.toObject,
            excludedFields: ['disabled'],
            useTemplate: true,
            renderAttribute: 'name',
            elements: {
                form: 'form',
                submitButton: 'button[type="submit"]',
                resetButton: 'button[type="reset"]'
            }
        };
        super(Object.extend(defaults, options));
        this.serializedData = {};
        this.formattedSerializedData = null;
        return this;
    }

    /**
     * Connected callback
     */
    connectedCallback(){
        super.connectedCallback();
        this.attachFormHandlers();
    }
        
    /**
     * Set form options
     * @param {object} options 
     * @return {Form}
     */
    setOptions(options){
        for(let k in options){
            if(this.options.hasOwnProperty(k)){
                this.options[k] = options[k];
            }
        }
        return this;
    }

    /**
     * Attach handlers to the default form events.
     * @return {FormTemplate}
     */
    attachFormHandlers(){
        let self = this;
        this.elements.form.addEventListener('submit', function(event){
            event.preventDefault();
            self.submit();
        });
        this.elements.form.addEventListener('reset', function(event){
            if(!Object.isEmpty(self.cachedData)){
                event.preventDefault();
                self.reload();
            }
        });
        return this;
    }

    reload(){
        
    }

    /**
     * Convert a checkbox into a boolean,
     * string, or number.
     * @param {HTMLElement} checkbox 
     * @param {number} mode 
     * @return {boolean|string|number}
     */
    convertCheckbox(checkbox, mode){
		let checked = checkbox.checked
		switch(mode){
			case FormTemplate.checkboxMode.boolean:
                return checked;
			case FormTemplate.checkboxMode.string:
				return checked ? '1' : '0';
			case FormTemplate.checkboxMode.onOff:
				return checked ? 'on' : 'off';
            default:
            case FormTemplate.checkboxMode.number:
                return checked ? 1 : 0;
		}
    }
    
    /**
     * Determine if a field is not excluded
     * @param {string} field 
     * @return {FormTemplate}
     */
    isNotExcluded(field){
        for(let i = 0; i < this.options.excludedFields.length; i++){
            let attribute = this.options.excludedFields[i];
            if(attribute === "disabled"){
                if(field.hasAttribute("disabled")){
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Serialize the form 
     * @return {object}
     */
    serialize(){
        this.serializedData = {};
        
        let inputs = Array.from(this.getElementsByTagName('input'));
        let selects = Array.from(this.getElementsByTagName('select'));
        let textareas = Array.from(this.getElementsByTagName('textarea'));
        let all = inputs.concat(selects, textareas);
        for (let i = 0; i < all.length; i++) {
            if(this.isNotExcluded(all[i])){
                this.serializeInput(all[i]);
            }
        }

        return this.serializedData;
    }

    /**
     * Serialize an input
     * @param {HTMLElement} input 
     * @return {object}
     */
    serializeInput(input){
        let name = input.getAttribute('name');
        let type = input.getAttribute('type');
        let val = null;
        switch(type){
            case 'checkbox':
                val = this.convertCheckbox(input, this.options.checkboxMode);
                break;
            case 'radio':
                if(input.checked){
                    val = input.value;
                }
                break;
            case 'file':
                if (input.files.length > 0) {
                    val = input.files[0];
                }
                break;
            case 'number':
                val = Number(input.value);
                break;
            default:
                val = input.value;
                break;
        }

        return this.serializedData[name] = val;
    }

    /**
     * Serialize a textarea
     * @param {HTMLElement} input 
     * @return {object}
     */
    serializeTextarea(textarea){
        return this.serializeSelect(textarea);        
    }

    /**
     * Serialize a select
     * @param {HTMLElement} input 
     * @return {object}
     */
    serializeSelect(select){
        let name = select.getAttribute('name');
        return this.serializedData[name] = select.value;
    }

    /**
     * Format the already serialized data
     * into a string or an object
     * @param {object} data 
     * @param {number} mode
     * @return {string|object}
     */
    formatSerializedData(data, mode){
		switch(mode){
			case FormTemplate.serializeMode.toString:
				return this.serializedDataToString(data);
            default:
            case FormTemplate.serializeMode.toObject:
                this.serializedData = Object.unflatten(this.serializedData);
                return this.serializedData;
		}
    }

    /**
     * Serialize data into a string
     * @param {object} data 
     * @return {string}
     */
	serializedDataToString(data){
		let str = "";
		let c = 0;
		let len = Object.keys(data).length;
		for(let k in data){
			str += k + "=" + data[k];
			if(c++ < len - 1){
                str += "&";
            }
		}
		return str;
	}

    /**
     * Submit the form.
     * Serialize data and pass the data
     * to the submitRequest function.
     * @return {Promise}
     */
    submit(){
        let self = this;
        this.serializedData = this.serialize();
        this.formattedSerializedData = this.formatSerializedData(this.serializedData, this.options.serializeMode);
        return this.options.submitRequest(this.formattedSerializedData)
            .then(function(data){
                self.emit('success', data);
            })
            .catch(function(err){
                self.emit('fail', err);
            });
    }
}
FormTemplate.checkboxMode = {
	boolean : 0,
	number : 1,
	string : 2,
	onOff : 3
};
FormTemplate.serializeMode = {
	toString : 0,
	toOrderedString : 1,
	toObject : 2,
	toValue : 3
};
customElements.define('template-form', FormTemplate);

/**
 * Table Template.
 * Builds rows of data with the render() function.
 * @extends {Template}
 */
class TableTemplate extends Template {

    /**
     * Constructor
     * @param {object} [options={}] 
     * @param {boolean} [options.alwaysRebuild=false] - whether to always wipe
     * and then rebuild the table
     * @param {string[]} [options.columns=[]] - array of column names, required for a
     * table that is not defined first in HTML
     * @param {string[]} [options.columnTitles=[]] - array of column titles, optional if
     * you want the header to display a different title for each column instead of its name
     * @param {object} [options.elements] - the table elements
     * @param {string} [options.elements.table="table"] - the table element selector
     * @param {string} [options.elements.thead="thead"] - the thead element selector
     * @param {string} [options.elements.theadTr="theadTr"] - the thead row element selector
     * @param {string} [options.elements.tbody="tbody"] - the thead element selector
     * @param {string} [options.elements.tfoot="tfoot"] - the tfoot element selector
     * @param {string} [options.elements.tr="tr"] - the tbody row element selector
     * @return {TableTemplate}
     */
    constructor(options = {}){
        let defaults = {
            alwaysRebuild: false,
            columns: [],
            columnTitles: [],
            elements: {
                table: 'table',
                thead: 'thead',
                theadTr: 'thead > tr',
                tbody: 'tbody',
                tfoot: 'tfoot',
                tr: 'tbody > tr'
            }
        };
        super(Object.extend(defaults, options));
        this.schema = {};
        this.rowManager = null;
        return this;
    }

    /**
     * Called when the element is 
     * connected to the DOM.
     */
    connectedCallback(){
        super.connectedCallback();
        if(this.elements && this.elements.tr instanceof HTMLElement){
            this.columnCount = this.elements.tr.querySelectorAll('td').length;
            // remove the default row, it will be used as a template
            this.elements.tr.remove();
        }
        this.createRowManager();
    }

    /**
     * Create the row manager.
     * If the tbody does not exist, this
     * manager will exist only virtually
     * until it is appended somewhere.
     * @return {ElementManager}
     */
    createRowManager(){
        let wrapper = (this.elements && this.elements.tbody instanceof HTMLElement)
            ? this.elements.tbody
            : document.createElement('div');
        return this.rowManager = new ElementManager(wrapper, this.elements.tr);
    }

    /**
     * Create HTML. In the very least,
     * we have a table and a tbody.
     * @return {TableTemplate}
     */
    createHtml(){
        this.innerHTML = '<table><tbody></tbody></table>';
        return this;
    }

    /**
     * Render the table.
     * Essentially, pass the data to rowManager
     * who will take care of rendering the rows.
     * @param {object} data 
     * @return {TableTemplate}
     */
    render(data){
        this.cacheData(data);
        this.processRenderData(data);

        // empty the table if the option is set
        // or if the data is an array and there is no primary key
        // without a primary key, we don't know how to manage rows
        if(this.options.alwaysRebuild){
            this.empty();
        }
        else if(Array.isArray(this.renderData)){
            if(typeof this.renderData[0][this.options.primaryKey] === 'undefined'){
                this.empty();
            }
        }

        this.rowManager.render(this.renderData);
        return this;
    }

    /**
     * Empty the table tbody
     * @return {TableTemplate}
     */
    empty(){
        this.rowManager.empty();
        return this;
    }

    // header

    /**
     * Create a header element
     * @return {HTMLElement}
     */
    createHeader(){
        return document.createElement('thead');
    }

    /**
     * Create a header column element
     * @return {HTMLElement}
     */
    createHeaderColumn(){
        return document.createElement('th');
    }

    /**
     * Add a header element
     * @param {HTMLElement} header
     * @return {TableTemplate}
     */
    addHeader(header){
        Template.prepend(header, this.elements.table);
        return this;
    }

    /**
     * Generate the header with a row of th columns.
     * The header is generated from the column names
     * set in this.options.columns
     * @param {string[]} columnNames - a string array of column names
     * @param {string[]} [columnTitles] - a string array of column titles
     * @return {TableTemplate}
     */
    generateHeader(columnNames, columnTitles){
        this.elements.thead = this.createHeader();
        let row = this.createRow();
        for(let i = 0; i < columnNames.length; i++){
            let col = this.createHeaderColumn();
            col.innerHTML = columnTitles ? columnTitles[i] : columnNames[i];
            row.appendChild(col);
        }
        this.elements.thead.appendChild(row);
        this.addHeader(this.elements.thead);
        return this;
    }

    // row

    /**
     * Create a row element
     * @return {HTMLElement}
     */
    createRow(){
        return document.createElement('tr');
    }

    /**
     * Create a row by cloning the tbody tr.
     * @return {HTMLElement}
     */
    cloneRow(){
        return this.elements.tr.cloneNode(true);
    }

    /**
     * Append a row to the tobdy.
     * @param {HTMLElement} row
     * @return {TableTemplate}
     */
    appendRow(row){
        this.elements.tbody.appendChild(row);
        return this;
    }

    /**
     * Remove a row
     * @param {HTMLElement} row 
     * @return {TableTemplate}
     */
    removeRow(row){

    }

    /**
     * Generate the cloneable row that all other
     * rows in the table are cloned from. This is not
     * used to create a new row to add to the table.
     * Each column in this row has it's data-name attribute
     * set to the name of the column in this.options.columns.
     * @return {TableTemplate}
     */
    generateRow(){
        this.elements.tr = this.createRow();
        for(let i = 0; i < this.options.columns.length; i++){
            let col = this.createColumn();
            col.setAttribute("data-name", this.options.columns[i]);
            this.elements.tr.appendChild(col);
        }
        this.elements.tbody.appendChild(this.elements.tr);
        return this;
    }

    // column

    /**
     * Create a column
     * @return {HTMLElement}
     */
    createColumn(){
        return document.createElement('td');
    }

    /**
     * Append a column to a row
     * @param {HTMLElement} row
     * @param {HTMLElement} column
     * @return {TableTemplate}
     */
    appendColumnToRow(row, column){
        row.appendChild(column);
        return this;
    }

    /**
     * Reset the DOM object.
     * This walks through the extracted DOM object
     * and removes each element. Then, it resets
     * the DOM object to a blank object. 
     * @return {TableTemplate}
     */
    resetDom(){
        if(this.elements){
            for(let k in this.elements){
                let el = this.elements[k];
                if(el instanceof HTMLElement){
                    el.remove();
                }
            }
        }
        this.elements = {};
        return this;
    }

    /**
     * Set the table's schema.
     * Wipe the entire table and rebuild
     * the header and the main tr.
     * @param {object} schema
     * @param {string[]} schema.columns
     * @param {string[]} [schema.columnTitles]
     * @param {string} [schema.primaryKey]
     * @return {TableTemplate} 
     */
    setSchema(schema){
        this.options.columns = schema.columns;
        if(schema.columnTitles){
            this.options.columnTitles = schema.columnTitles;
        }
        if(schema.primaryKey){
            this.options.primaryKey = schema.primaryKey;
        }
        this.resetDom();
        this.createHtml();
        this.findElements(this.options.elements);
        this.generateHeader(this.options.columns, this.options.columnTitles);
        this.generateRow();
        return this;
    }
}
customElements.define('template-table', TableTemplate);

/**
 * Popup Template
 * @extends {Template}
 */
class PopupTemplate extends Template {

    /**
     * Constructor
     * @param {object} options 
     * @param {string} [options.size="medium"]
     * @param {boolean} [options.showHeader=true]
     * @param {boolean} [options.showClose=true]
     * @param {boolean} [options.showFooter=true]
     * @param {object} [options.elements]
     * @param {string} [options.elements.header=".popup-header"]
     * @param {string} [options.elements.title=".popup-title"]
     * @param {string} [options.elements.close=".template-popupcloseBtn"]
     * @param {string} [options.elements.body=".popup-body"]
     * @param {string} [options.elements.footer=".popup-footer"]
     * @return {PopupTemplate}
     */
    constructor(options = {}){
        let defaults = {
            displayBlock: false,
            size: 'medium',
            showHeader: true,
            showClose: true,
            showFooter: true,
            elements: {
                header: '.popup-header',
                title: '.popup-title',
                close: '.popup-close',
                body: '.popup-body',
                footer: '.popup-footer'
            }
        }
        super(Object.extend(defaults, options));
        return this;
    }

    /**
     * Connected callback
     */
    connectedCallback(){
        super.connectedCallback();
        this.applyOptions(this.options);
        this.attachButtonHandlers();
    }

    /**
     * Attach button handlers
     * @return {PopupTemplate}
     */
    attachButtonHandlers(){
        let self = this;
        this.elements.close.addEventListener('click', function(e){
            self.close();
        });
        return this;
    }

    /**
     * Set the PopupTemplate's innerHTML from the default layout
     * @return {PopupTemplate}
     */
    createHtml(){
        this.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <div class="popup-title"></div>
                    <button type="button" class="btn-none popup-close">
                        X
                    </button>
                </div>
                <div class="popup-body"></div>
                <div class="popup-footer"></div>
            </div>`.trim();
        return this;
    }

    /**
     * Apply options to the PopupTemplate
     * @param {object} options 
     * @return {PopupTemplate}
     */
    applyOptions(options){
        if(!options.showHeader && this.elements.header){
            this.elements.header.remove();
        }
        if(!options.showClose && this.elements.close){
            this.elements.close.remove();
        }
        if(!options.showFooter && this.elements.footer){
            this.elements.footer.remove();
        }
        return this;
    }

    /**
     * Open the popup by adding the 'popup-open' class.
     * Fade in the PopupTemplate.
     * @return {PopupTemplate}
     */
    open(){
        document.body.classList.add('popup-open');
        this.show();
        return this;
    }

    /**
     * Close the popup by removing the 'popup-open' class
     * Fadeout in the PopupTemplate.
     * @return {PopupTemplate}
     */
    close(){
        document.body.classList.remove('popup-open');
        this.hide();
        return this;
    }

    /**
     * Render the title
     * @param {string} html 
     * @return {PopupTemplate}
     */
    renderTitle(html){
        this.elements.title.innerHTML = html;
        return this;
    }

    /**
     * Render the body
     * @param {string} html 
     * @return {PopupTemplate}
     */
    renderBody(html){
        this.elements.body.innerHTML = html;
        return this;
    }

    /**
     * Render the footer
     * @param {string} html 
     * @return {PopupTemplate}
     */
    renderFooter(html){
        this.elements.footer.innerHTML = html;
        return this;
    }
}
customElements.define('template-popup', PopupTemplate);

const Status = {
    none: "none",
    error: "error",
    success: "success",
    processing: "processing",
    info: "info",
    warning: "warning"
};
Status.class = {};
Status.class[Status.none] = "status-none";
Status.class[Status.error] = "status-error";
Status.class[Status.success] = "status-success";
Status.class[Status.processing] = "status-processing";
Status.class[Status.info] = "status-info";
Status.class[Status.warning] = "status-warning";
Status.classArray = [
    Status.class.none,
    Status.class.error,
    Status.class.success,
    Status.class.processing,
    Status.class.info,
    Status.class.warning
];
// background class
Status.bgclass = {};
Status.bgclass[Status.none] = "status-bg-none";
Status.bgclass[Status.error] = "status-bg-error";
Status.bgclass[Status.success] = "status-bg-success";
Status.bgclass[Status.processing] = "status-bg-processing";
Status.bgclass[Status.info] = "status-bg-info";
Status.bgclass[Status.warning] = "status-bg-warning";
Status.bgclassArray = [
    Status.bgclass.none,
    Status.bgclass.error,
    Status.bgclass.success,
    Status.bgclass.processing,
    Status.bgclass.info,
    Status.bgclass.warning
];
Status.icon = {};
Status.icon[Status.none] = "";
Status.icon[Status.error] = '';
Status.icon[Status.info] = '';
Status.icon[Status.processing] = '<div class="spinner-container"><div class="spinner-wheel"></div></div>';
Status.icon[Status.success] = '';
Status.icon[Status.warning] = '';

/**
 * Feedback Template
 * @extends {Template}
 */
class FeedbackTemplate extends Template {
    static get observedAttributes() {return ['status', 'text'];}

    /**
     * Constructor
     * @param {object} [options={}] 
     * @param {string} [options.elements.icon=".feedback-icon"]
     * @param {string} [options.elements.text=".feedback-text"]
     * @param {string} [options.elements.close=".feedback-close"]
     * @return {FeedbackTemplate}
     */
    constructor(options = {}){
        let defaults = {
            elements: {
                icon: '.feedback-icon',
                text: '.feedback-text',
                close: '.feedback-close'
            }
        };
        super(Object.extend(defaults, options));
        return this;
    }

    /**
     * Connected callback
     */
    connectedCallback(){
        super.connectedCallback();
        this.attachButtonHandlers();
    }

    /**
     * Attach button handlers
     * @return {FeedbackTemplate}
     */
    attachButtonHandlers(){
        let self = this;
        this.elements.close.addEventListener('click', function(){
            self.remove();
        });
        return this;
    }

    /**
     * Set the innerHTML to the default layout
     * @return {FeedbackTemplate}
     */
    createHtml(){
        this.innerHTML = `
            <div class="feedback-icon">
                OK!
            </div>
            <div class="feedback-text"></div>
            <button class="feedback-close">
                X
            </button>`.trim();
        return this;
    }

    /**
     * Callback for when an attribute is changed.
     * If the "status" attribute is changed, update
     * the icon and background classes.
     * If the "text" attribute is changed, update the
     * text HTML.
     * @param {string} name - attribute name
     * @param {string} oldValue - old value
     * @param {string} newValue - new value
     * @return {FeedbackTemplate}
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if(name === "status"){
            let clazz = Status.class.none;
            let icon = Status.icon.none;
            if(newValue && newValue !== "" &&  typeof Status.bgclass[newValue] !== 'undefined'){
                clazz = Status.bgclass[newValue];
                icon = Status.icon[newValue];
            }
            this.setClass(clazz).setIcon(icon);
        }
        else if(name === "text"){
            this.setText(newValue);
        }
    }
    
    /**
     * Set the status attribute
     * @param {string} status 
     * @return {FeedbackTemplate}
     */
    setStatus(status){
        this.setAttribute('status', status);
        return this;
    }

    /**
     * Remove all status- based classes
     * @return {FeedbackTemplate}     
     */
    clearStatusClass(){
        this.classList.remove(...Status.bgclassArray);
        return this;
    }

    /**
     * Set the class
     * @param {string} clazz
     * @return {FeedbackTemplate}
     */
    setClass(clazz){
        this.clearStatusClass();
        this.classList.add(clazz);
        return this;
    }

    /**
     * Set the text 
     * @param {string} text
     * @return {FeedbackTemplate}     
     */
    setText(text){
        this.elements.text.textContent = text;
        return this;
    }

    /**
     * Set the icon 
     * @param {string} text
     * @return {FeedbackTemplate}     
     */
    setIcon(icon){
        this.elements.icon.innerHTML = icon;
        return this;
    }

    /**
     * Render the FeedbackTemplate
     * @param {string} status 
     * @param {string} text 
     * @param {string} icon 
     * @return {FeedbackTemplate}
     */
    render(status, text, icon){
        return this.setStatus(status).setText(text).setIcon(icon);
    }

    /**
     * Render an error feedback
     * @param {string} message 
     * @return {FeedbackTemplate}
     */
    renderError(message){
        return this.render(Status.error, message, Status.icon[Status.error]);
    }

    /**
     * Render an info feedback
     * @param {string} message 
     * @return {FeedbackTemplate}
     */
    renderInfo(message){
        return this.render(Status.info, message, Status.icon[Status.error]);
    }

    /**
     * Render a processing feedback
     * @param {string} message 
     * @return {FeedbackTemplate}
     */
    renderProcessing(message){
        return this.render(Status.processing, message, Status.icon[Status.processing]);
    }

    /**
     * Render a success feedback
     * @param {string} message 
     * @return {FeedbackTemplate}
     */
    renderSuccess(message){
        return this.render(Status.success, message, Status.icon[Status.success]);
    }

    /**
     * Render a warning feedback
     * @param {string} message 
     * @return {FeedbackTemplate}
     */
    renderWarning(message){
        return this.render(Status.warning, message, Status.icon[Status.warning]);
    }
}
customElements.define('template-feedback', FeedbackTemplate);

/**
 * StatusText Template
 * @extends {Template}
 */
class StatusTemplate extends Template {
    static get observedAttributes() {return ['status', 'text']; }

    /**
     * Constructor
     * @param {object} [options={}]
     * @return {StatusTemplate}
     */
    constructor(options){
        super(options);
        return this;
    }
    
    /**
     * Adds a "status" and "text" attribute
     * to the element if they do not exist.
     * @return {StatusTemplate}
     */
    connectedCallback(){
        super.connectedCallback();
        if(!this.hasAttribute('status')){
            this.setAttribute('status', Status.none);
        }
        if(!this.hasAttribute('text')){
            this.setAttribute('text', '');
        }
        return this;
    }

    /**
     * Callback for when an attribute is changed.
     * If the "status" attribute is changed, update
     * the icon and background classes.
     * If the "text" attribute is changed, update the
     * text HTML.
     * @param {string} name - attribute name
     * @param {string} oldValue - old value
     * @param {string} newValue - new value
     * @return {FeedbackTemplate}
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if(name === "status"){
            let clazz = Status.class.none;
            if(newValue && newValue !== "" &&  typeof Status.class[newValue] !== 'undefined'){
                clazz = Status.class[newValue];
            }
            this.setClass(clazz);
        }
        else if(name === "text"){
            this.setText(newValue);
        }
    }

    /**
     * Set the status
     * @param {string} status 
     * @return {StatusTemplate}
     */
    setStatus(status){
        this.setAttribute('status', status);
        return this;
    }

    /**
     * Remove all status- classes
     * @return {StatusTemplate}
     */
    clearStatusClass(){
        this.classList.remove(...Status.classArray);
        return this;
    }

    /**
     * Set the class
     * @param {string} clazz 
     * @return {StatusTemplate}
     */
    setClass(clazz){
        this.clearStatusClass();
        this.classList.add(clazz);
        return this;
    }

    /**
     * Set the text
     * @param {string} text 
     * @return {StatusTemplate}
     */
    setText(text){
        this.textContent = text;
        return this;
    }

    /**
     * Render the StatusTemplate
     * @param {string} status 
     * @param {string} text 
     * @return {StatusTemplate}
     */
    render(status, text){
        return this.setStatus(status).setText(text);
    }

    /**
     * Render the StatusTemplate with no status
     * @param {string} text 
     * @return {StatusTemplate}
     */
    renderNone(text){
        return this.render(Status.none, text);
    }

    /**
     * Render the StatusTemplate with error status
     * @param {string} text 
     * @return {StatusTemplate}
     */
    renderError(text){
        return this.render(Status.error, text);
    }

    /**
     * Render the StatusTemplate with success status
     * @param {string} text 
     * @return {StatusTemplate}
     */
    renderSuccess(text){
        return this.render(Status.success, text);
    }

    /**
     * Render the StatusTemplate with info status
     * @param {string} text 
     * @return {StatusTemplate}
     */
    renderInfo(text){
        return this.render(Status.info, text);
    }

    /**
     * Render the StatusTemplate with warning status
     * @param {string} text 
     * @return {StatusTemplate}
     */
    renderWarning(text){
        return this.render(Status.warning, text);
    }
}
customElements.define('template-status', StatusTemplate);