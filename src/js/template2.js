/*
 * Template v2.0.0
 * By Anthony Agostino - anthagostino|at|gmail[dot]com
 * GPL 3.0 license
 * 
 * Template is a front-end library used to render and
 * create re-useable HTMLElements via HTML and native Javascript,
 * and it rlies on the powerful customElements system. 
 * Custom elements are the best way to define new HTMLElements
 * with your own behaviours. 
 * Example: //customElements.define('my-element', MyController);
 * Template does not use the shadow dom. It is preferred that
 * DOM is accessible, especially to make developer's lives easy.
 * Suggested, but not necessary reading: https://tinyurl.com/y7vqn4df.
 * 
 * It is built on the notion that your HTML stays in your .html 
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
 * in the fastest way possible, which is just vanilla JS. All static
 * Template functions are also available as object functions when
 * you create an actual Template element, such as myTemplate.addClass('hidden').
 * 
 * The Template class itself extends HTMLElement. It provides
 * methods to render the entire contents of the HTMLElement
 * with one function and one object of data. Data is matched
 * to HTMLElements based on some HTML attribute, typically 
 * "data-name". Template also provides a few common HTML 
 * and CSS manipulating methods like setting attributes.
 * Any time you extend the Template class to create your own
 * custom element, you simply extend Template, and at the bottom
 * of the class definition, register it with customElements.
 * Example: //customElements.define('my-element', MyController);
 * 
 * Template also wraps up a custom EventSystem, which perfectly mimics
 * jQuery's namespace-style events. That is, events can be namespaced
 * such as .on("click.dropdown") or further .on("click.dropdown.ev").
 * This EventSystem can also be used standalone.
 * 
 * The Template library also has a TemplateManager, which, when
 * given an array of objects, map of objects, or object of objects,
 * automagically creates, updates (renders), or destroys Templates.
 * This can be used to easily generate a table of rows, where each
 * row is built off of the same Template that TemplateManager
 * knows about.
 * 
 * Template and TemplateManager both have the notion of 
 * preserving data and processing data. When either are
 * fed data to render(), the data is always cached as-is in an 
 * object called cachedData, and then processed into an object
 * called renderData. That ensures that your data is never mutated.
 * 
 * This library also comes with some predefined classes that
 * extend Template: FormTemplate, TableTemplate, FeedbackTemplate, 
 * and StatusTextTemplate. 
 * FormTemplate wraps a basic <form> element and provides some 
 * improved serialization and submission functionality. 
 * TableTemplate wraps a basic <table> element and  provides easy
 * ways to build tables.
 * FeedbackTemplate and StatusTextTemplate are basic elements that 
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
 * Template manager.
 * Can create and manage Template objects.
 * Must be passed a cloneable Template element 
 * in the constructor to be of any use.
 * @extends {EventSystem}
 */
class TemplateManager extends EventSystem {

    /**
     * Constructor
     * @param {HTLMElement} wrapper - wrapper element where templates are appended
     * @param {Template} template - a cloneable element
     * @param {object} [options]
     * @param {number} [options.maxTemplates=0] - max template count
     * @param {boolean} [options.cloneTemplate=true] - whether to clone the initial
     *                  template from the DOM. Most of the time, you want to do this.   
     * @param {boolean} [options.removeTemplate=true] - whether to remove the initial
     *                  template on the DOM. Most of the time, you want to do this,
     *                  unless there are many TemplateManagers using the same template.                  
     * @param {boolean} [options.removeDeadTemplates=true] - whether to remove dead 
     *                  templates. A template is dead when it does not exist 
     *                  in new data passed to render()
     * @return {TemplateManager}
     */
    constructor(wrapper, template, options){
        super();
        let defaults = {
            maxTemplates: 0,
            cloneTemplate: true,
            removeTemplate: true,
            removeDeadTemplates: true
        };
        this.options = Object.extend(defaults, options);

        /**
         * The element in which all templates
         * will be appended to.
         * @type {HTMLElement}
         */
        this.wrapper = wrapper ? wrapper : document.createElement("template-manager");

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
        this.templates = new Map();

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
     * @return {TemplateManager}
     */
    empty(){
        for(let [key, value] of this.templates){
            // may be another template's child node
            try{
                this.wrapper.removeChild(value);
            }
            catch(e){
                
            }
            this.templates.delete(key);
        }
        return this;
    }

    /**
     * Attach handlers to a template
     * @param {Template} template 
     * @return {TemplateManager}
     */
    attachTemplateHandlers(template){
        return this;
    }

    /**
     * Create a new clone of the template.
     * Attach handlers to it.
     * @return {Template}
     */
    createTemplate(){
        let template = this.template.cloneNode(true);
        this.attachTemplateHandlers(template);
        return template;
    }

    /**
     * Append a template to the wrapper
     * @param {Template} template 
     * @return {TemplateManager}
     */
    appendTemplate(template){
        this.wrapper.appendChild(template);
        return this;
    }

    /**
     * Append a template before an element
     * @param {Template} template 
     * @param {HTMLElement} element 
     * @return {TemplateManager}
     */
    appendTemplateBefore(template, element){
        element.before(template);
        return this;
    }

    /**
     * Append a template after an element
     * @param {Template} template 
     * @param {HTMLElement} element 
     * @return {TemplateManager}
     */
    appendTemplateAfter(template, element){
        element.after(template);
        return this;
    }

    /**
     * Remove a template by id.
     * Removes from the DOM and collection.
     * @param {string} id 
     * @return {TemplateManager}
     */
    removeTemplate(id){
        let template = this.templates.get(id);
        if(template){
            this.wrapper.removeChild(template);
            this.templates.delete(id);
        }
        return this;
    }

    /**
     * Remove dead templates. 
     * Cross reference the list of current templates
     * with an object of data. If the template object's name
     * is not found in the data, then the template is considered dead (old).
     * @example // The following objects currently exists in this.templates
     *           { user1:Template, user2:Template, user3:Template }
     *          // The following objects exist in the passed in data object
     *           { user2: {...}, user3: {...} }
     *          // user1 is missing in the data. Therefore, the template named
     *          // "user1" is no longer relevant, and is removed.
     * @param {Template} template 
     * @return {TemplateManager}
     */
    removeDeadTemplates(data){
        for(let [key, template] of this.templates){
            if(!this.getTemplateData(data, key)){
                template.remove();
                this.templates.delete(key);
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
     * @param {object[]|object|Map} data 
     * @param {string} key 
     * @return {null|object}
     */
    getTemplateData(data, key){
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
     * into a Template. If the data is new, the
     * Template will be appended to the wrapper.
     * @param {object[]|object|Map} data 
     * @return {TemplateManager}
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
            this.removeDeadTemplates(data);
        }
        return this;
    }

    /**
     * Render templates from an array of data.
     * Each object must have an "id" property.
     * @param {object[]} data 
     * @return {TemplateManager}
     */
    renderArray(data){
        for(let i = 0; i < data.length; i++){
            if(typeof data[i].id === "undefined"){
                console.error("TemplateManager.renderArray: data must have an id property");
                return;
            }
            this.renderTemplate(data[i].id, data[i], i);
        }
        return this;
    }

    /**
     * Render templates from a map of objects.
     * @param {Map} data 
     * @return {TemplateManager}
     */
    renderMap(data){
        let i = 0;
        for(let [key, value] of data){
            this.renderTemplate(key, value, i);
            i++;
        }
        return this;
    }

    /**
     * Render templates from an object of objects.
     * @param {object} data 
     * @return {TemplateManager}
     */
    renderObject(data){
        let i = 0;
        for(let k in data){
            this.renderTemplate(k, data[k], i);
            i++;
        }
        return this;
    }

    /**
     * Render a single object of data by faking
     * it as an object of objects.
     * Note that if removeDeadTemplates is 
     * set to true (by default), this will 
     * remove all other templates.
     * @param {string} id 
     * @param {object} object 
     * @return {TemplateManager}
     */
    renderSingle(id, object){
        let obj = {};
        obj[id] = object;
        this.render(obj);
        return this;
    }

    /**
     * Render a Template found in the template collection.
     * If the Template does not exist, create it.
     * @param {number|string} id - template and data identifier
     * @param {object} data - object of data
     * @param {number} index - the numerical index of the template
     * @return {TemplateManager}
     */
    renderTemplate(id, data, index){
        let isNew =  false;
        let template = this.templates.get(id);
        if(!template){
            isNew = true;
            template = this.createTemplate();
        }
        
        if(template){
            this.templates.set(id, template);
            if(isNew){
                this.appendTemplate(template);
                template.render(data);
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
 * into the local "dom" object. Each child element
 * is captured by any desired element attribute and,
 * if named appropriately, can be populated with data via render().
 * Provides a namespaced EventSystem with on/off handlers.
 * Has various animations, such as fadeIn and hide.
 * Has a render function that takes in an object of data and
 * populates child elements with same-named attributes.
 * @extends {HTMLElement}
 */
class Template extends HTMLElement {

    /**
     * Constructor
     * @param {object} [options={}]
     * @return {Template}
     */
    constructor(options = {}){
        super();
        let defaults = {
            html: "",
            dom: {},
            createHtml: false,
            renderAttribute: 'data-name',
            displayBlock: true
        };
        this.options = Object.extend(defaults, options);
        this.eventSystem = new EventSystem();
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
        this.dom = this.extractDom();
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
     * Run through the defined dom object in options
     * and try to find each defined element. If found,
     * add the element to an object and return it.
     * @return {object}
     */
    extractDom(){
        let dom = {};
        if(this.options.dom){
            for(let k in this.options.dom){
                dom[k] = this.querySelector(this.options.dom[k]);
            }
        }        
        return dom;
    }
        
    // tree

    /**
     * Append one element to another element
     * @param {HTMLElement} element - the element to append
     * @param {HTMLElement} toElement - the element to append to
     * @return {Template}
     */
    static appendTo(element, toElement){
        toElement.appendChild(element);
    }

    /**
     * Append to another element
     * @param {HTMLElement} element 
     * @return {Template}
     */
    appendTo(element){
        Template.appendTo(this, element);
        return this;
    }

    /**
     * Prepend an element to another element
     * @param {HTMLElement} element - the element to prepend
     * @param {HTMLElement} toElement - the element to prepend to
     */
    static prependTo(element, toElement){
        toElement.insertBefore(element, toElement.firstChild);
    }

    /**
     * Prepend to another element
     * @param {HTMLElement} element 
     * @return {Template}
     */
    prependTo(element){
        Template.prependTo(this, element);
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
     * Hide an element by adding the hidden class
     * @param {HTMLElemet} element 
     */
    static hide(element){
        element.classList.add('hidden');
    }

    /**
     * Hide the Template by adding the hidden class
     * @return {Template}
     */
    hide(){
        Template.hide(this);
        return this;
    }

    /**
     * Show an element by removing the hidden class
     * @param {HTMLElemet} element 
     */
    static show(element){
        element.classList.remove('hidden');
    }

    /**
     * Show the Template by removing the hidden class
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
     * let myDiv = document.getElementById('myDiv');
     * Template.render(myDiv, {name: "Bob", status: "online"});
     * // <div id="myDiv">
     * //    <span data-name="name">Bob</span>
     * //    <span data-name="status">online</span>
     * // </div>
     * @example
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
customElements.define('template-custom', Template);

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
     * @param {object} [options.dom]
     * @param {string} [options.dom.form]
     * @param {string} [options.dom.resetButton]
     * @param {string} [options.dom.submitButton]
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
            dom: {
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
        this.dom.form.addEventListener('submit', function(event){
            event.preventDefault();
            self.submit();
        });
        this.dom.form.addEventListener('reset', function(event){
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
     * @param {string} [options.primaryKey="id"] - the tables primary key
     * @param {string[]} [options.columns=[]] - array of column names, required for a
     * table that is not defined first in HTML
     * @param {string[]} [options.columnTitles=[]] - array of column titles, optional if
     * you want the header to display a different title for each column instead of its name
     * @param {object} [options.dom] - the table elements
     * @param {string} [options.dom.table="table"] - the table element selector
     * @param {string} [options.dom.thead="thead"] - the thead element selector
     * @param {string} [options.dom.theadTr="theadTr"] - the thead row element selector
     * @param {string} [options.dom.tbody="tbody"] - the thead element selector
     * @param {string} [options.dom.tfoot="tfoot"] - the tfoot element selector
     * @param {string} [options.dom.tr="tr"] - the tbody row element selector
     * @return {TableTemplate}
     */
    constructor(options = {}){
        let defaults = {
            alwaysRebuild: false,
            primaryKey: 'id',
            columns: [],
            columnTitles: [],
            dom: {
                table: 'table',
                thead: 'thead',
                theadTr: 'thead > tr',
                tbody: 'tbody',
                tfoot: 'tfoot',
                tr: 'tbody > tr'
            }
        };
        super(Object.extend(defaults, options));
        this.rows = {};
        this.schema = {};
        return this;
    }

    /**
     * Called when the element is 
     * connected to the DOM.
     */
    connectedCallback(){
        super.connectedCallback();
        this.columnCount = this.dom.tr.querySelectorAll('td').length;
        this.dom.tr.remove();
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
     * Render the table
     * @param {object} data 
     * @return {Table}
     */
    render(data){
        this.cacheData(data);
        this.processRenderData(data);
        if(this.options.alwaysRebuild){
            this.emptyTable();
        }
        if(Array.isArray(this.renderData)){
            if(!this.renderData.length){
                return this;
            }
            if(typeof this.renderData[0] !== "object"){
                return this;
            }
            // no primary key, cannot update rows
            if(typeof this.renderData[0][this.options.primaryKey] === 'undefined'){
                this.emptyTable();
            }
            for(let row of this.renderData){
                this.createOrRenderRow(row);
            }
        }
        else {
            for(let k in this.renderData){
                this.createOrRenderRow(this.renderData[k]);
            }
        }
        return this;
    }

    /**
     * Create a row if it does not already exist in the
     * row collection. If it does exist, render it.
     * @param {object} rowData
     * @return {TableTemplate} 
     */
    createOrRenderRow(rowData){
        let id = rowData[this.options.primaryKey];
        if(this.rows[id]){
            this.renderRow(this.rows[id], rowData);
        }
        else {
            let row = this.cloneRow();
            this.renderRow(row, rowData);
            this.addRow(row, rowData[this.options.primaryKey]);
            this.appendRow(row);
        }
        return this;
    }

    /**
     * Empty the table tbody
     * @return {TableTemplate}
     */
    emptyTable(){
        while (this.dom.tbody.firstChild) {
            this.dom.tbody.removeChild(this.dom.tbody.firstChild);
        }
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
        Template.prependTo(header, this.dom.table);
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
        this.dom.thead = this.createHeader();
        let row = this.createRow();
        for(let i = 0; i < columnNames.length; i++){
            let col = this.createHeaderColumn();
            col.innerHTML = columnTitles ? columnTitles[i] : columnNames[i];
            row.appendChild(col);
        }
        this.dom.thead.appendChild(row);
        this.addHeader(this.dom.thead);
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
        return this.dom.tr.cloneNode(true);
    }

    /**
     * Add a row to the row collection
     * @param {HTMLElement} row
     * @param {string} id - id in row collection
     * @return {TableTemplate}
     */
    addRow(row, id){
        this.rows[id] = row;
        return this;
    }

    /**
     * Add a header element
     * @param {HTMLElement} header
     * @return {TableTemplate}
     */
    appendRow(row){
        this.dom.tbody.appendChild(row);
        return this;
    }

    /**
     * Render a row element from data
     * @param {HTMLElement} header
     * @param {object} rowData 
     * @return {TableTemplate}
     */
    renderRow(row, rowData){
        Template.render(row, rowData);
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
        this.dom.tr = this.createRow();
        for(let i = 0; i < this.options.columns.length; i++){
            let col = this.createColumn();
            col.setAttribute("data-name", this.options.columns[i]);
            this.dom.tr.appendChild(col);
        }
        this.dom.tbody.appendChild(this.dom.tr);
        return this;
    }

    // column

    /**
     * Create a column
     * @return {TableTemplate}
     */
    createColumn(){
        let column = document.createElement('td');
        return column;
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
        if(this.dom){
            for(let k in this.dom){
                let el = this.dom[k];
                if(el instanceof HTMLElement){
                    el.remove();
                }
            }
        }
        this.dom = {};
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
        this.dom = this.extractDom();
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
     * @param {boolean} [options.showCloseBtn=true]
     * @param {boolean} [options.showFooter=true]
     * @param {object} [options.dom]
     * @param {string} [options.dom.header=".template-popup-header"]
     * @param {string} [options.dom.title=".template-popup-title"]
     * @param {string} [options.dom.closeBtn=".template-popupcloseBtn"]
     * @param {string} [options.dom.body=".template-popup-body"]
     * @param {string} [options.dom.footer=".template-popup-footer"]
     * @return {PopupTemplate}
     */
    constructor(options = {}){
        let defaults = {
            size: 'medium',
            showHeader: true,
            showCloseBtn: true,
            showFooter: true,
            dom: {
                header: '.template-popup-header',
                title: '.template-popup-title',
                closeBtn: '.template-popup-closeBtn',
                body: '.template-popup-body',
                footer: '.template-popup-footer'
            }
        }
        super(Object.extend(defaults, options));
        this.applyOptions(this.options);
        
        // handlers
        let self = this;
        this.dom.closeBtn.addEventListener('click', function(e){
            self.close();
        });

        this.appendTo(document.body);

        return this;
    }

    /**
     * Set the PopupTemplate's innerHTML from the default layout
     * @return {PopupTemplate}
     */
    createHtml(){
        this.innerHTML = `
            <div class="template-popup-content">
                <div class="template-popup-header">
                    <div class="template-popup-title"></div>
                    <button type="button" class="btn-none template-popup-closeBtn">
                        X
                    </button>
                </div>
                <div class="template-popup-body"></div>
                <div class="template-popup-footer"></div>
            </div>`.trim();
        return this;
    }

    /**
     * Apply options to the PopupTemplate
     * @param {object} options 
     * @return {PopupTemplate}
     */
    applyOptions(options){
        if(!options.showHeader){
            this.dom.header.remove();
        }
        if(!options.showCloseBtn){
            this.dom.closeBtn.remove();
        }
        if(!options.showFooter){
            this.dom.footer.remove();
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
        this.show().fadeIn();
        return this;
    }

    /**
     * Close the popup by removing the 'popup-open' class
     * Fadeout in the PopupTemplate.
     * @return {PopupTemplate}
     */
    close(){
        document.body.classList.remove('popup-open');
        this.fadeOut();
        let self = this;
        setTimeout(function(){
            self.hide();
        }, 1000);
        return this;
    }

    /**
     * Render the title
     * @param {string} html 
     * @return {PopupTemplate}
     */
    renderTitle(html){
        this.dom.title.innerHTML = html;
        return this;
    }

    /**
     * Render the body
     * @param {string} html 
     * @return {PopupTemplate}
     */
    renderBody(html){
        this.dom.body.innerHTML = html;
        return this;
    }

    /**
     * Render the footer
     * @param {string} html 
     * @return {PopupTemplate}
     */
    renderFooter(html){
        this.dom.footer.innerHTML = html;
        return this;
    }
}
customElements.define('template-popup', PopupTemplate);

const Status = {
    status: {
        none: "none",
        error: "error",
        success: "success",
        processing: "processing",
        info: "info",
        warning: "warning"
    }
};
Status.class = {};
Status.class[Status.status.none] = "status-none";
Status.class[Status.status.error] = "status-error";
Status.class[Status.status.success] = "status-success";
Status.class[Status.status.processing] = "status-processing";
Status.class[Status.status.info] = "status-info";
Status.class[Status.status.warning] = "status-warning";
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
Status.bgclass[Status.status.none] = "status-bg-none";
Status.bgclass[Status.status.error] = "status-bg-error";
Status.bgclass[Status.status.success] = "status-bg-success";
Status.bgclass[Status.status.processing] = "status-bg-processing";
Status.bgclass[Status.status.info] = "status-bg-info";
Status.bgclass[Status.status.warning] = "status-bg-warning";
Status.bgclassArray = [
    Status.bgclass.none,
    Status.bgclass.error,
    Status.bgclass.success,
    Status.bgclass.processing,
    Status.bgclass.info,
    Status.bgclass.warning
];
Status.icon = {};
Status.icon[Status.status.none] = "";
Status.icon[Status.status.error] = '';
Status.icon[Status.status.info] = '';
Status.icon[Status.status.processing] = '<div class="spinner-container"><div class="spinner-wheel"></div></div>';
Status.icon[Status.status.success] = '';
Status.icon[Status.status.warning] = '';

/**
 * Feedback Template
 * @extends {Template}
 */
class FeedbackTemplate extends Template {
    static get observedAttributes() {return ['status', 'text'];}

    /**
     * Constructor
     * @param {object} [options={}] 
     * @param {string} [options.dom.icon=".status-feedback-icon"]
     * @param {string} [options.dom.text=".status-feedback-text"]
     * @param {string} [options.dom.closeBtn=".status-feedback-closeBtn"]
     * @return {FeedbackTemplate}
     */
    constructor(options = {}){
        let defaults = {
            dom: {
                icon: '.status-feedback-icon',
                text: '.status-feedback-text',
                closeBtn: '.status-feedback-closeBtn'
            }
        };
        super(Object.extend(defaults, options));
        let self = this;
        this.dom.closeBtn.addEventListener('click', function(){
            self.remove();
        });

        // if built with new
        if(status && status !== ""){
            this.render(status, text, icon);
        }

        return this;
    }

    /**
     * Set the innerHTML to the default layout
     * @return {FeedbackTemplate}
     */
    createHtml(){
        this.innerHTML = `
            <div class="status-feedback-icon">
                OK!
            </div>
            <div class="status-feedback-text"></div>
            <button class="status-feedback-closeBtn btn-none">
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
        this.dom.text.textContent = text;
        return this;
    }

    /**
     * Set the icon 
     * @param {string} text
     * @return {FeedbackTemplate}     
     */
    setIcon(icon){
        this.dom.icon.innerHTML = icon;
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
        return this.render(Status.status.error, message, Status.icon[Status.status.error]);
    }

    /**
     * Render an info feedback
     * @param {string} message 
     * @return {FeedbackTemplate}
     */
    renderInfo(message){
        return this.render(Status.status.info, message, Status.icon[Status.status.error]);
    }

    /**
     * Render a processing feedback
     * @param {string} message 
     * @return {FeedbackTemplate}
     */
    renderProcessing(message){
        return this.render(Status.status.processing, message, Status.icon[Status.status.processing]);
    }

    /**
     * Render a success feedback
     * @param {string} message 
     * @return {FeedbackTemplate}
     */
    renderSuccess(message){
        return this.render(Status.status.success, message, icon);
    }

    /**
     * Render a warning feedback
     * @param {string} message 
     * @return {FeedbackTemplate}
     */
    renderWarning(message){
        return this.render(Status.status.warning, message, Status.icon[Status.status.warning]);
    }
}
customElements.define('template-feedback', FeedbackTemplate);

/**
 * StatusText Template
 * @extends {Template}
 */
class StatusTextTemplate extends Template {
    static get observedAttributes() {return ['status', 'text']; }

    /**
     * Constructor
     * @param {object} [options={}]
     * @return {StatusTextTemplate}
     */
    constructor(options){
        super(options);
        return this;
    }
    
    /**
     * Adds a "status" and "text" attribute
     * to the element if they do not exist.
     * @return {StatusTextTemplate}
     */
    connectedCallback(){
        super.connectedCallback();
        if(!this.hasAttribute('status')){
            this.setAttribute('status', Status.status.none);
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
     * @return {StatusTextTemplate}
     */
    setStatus(status){
        this.setAttribute('status', status);
        return this;
    }

    /**
     * Remove all status- classes
     * @return {StatusTextTemplate}
     */
    clearStatusClass(){
        this.classList.remove(...Status.classArray);
        return this;
    }

    /**
     * Set the class
     * @param {string} clazz 
     * @return {StatusTextTemplate}
     */
    setClass(clazz){
        this.clearStatusClass();
        this.classList.add(clazz);
        return this;
    }

    /**
     * Set the text
     * @param {string} text 
     * @return {StatusTextTemplate}
     */
    setText(text){
        this.textContent = text;
        return this;
    }

    /**
     * Render the StatusTextTemplate
     * @param {string} status 
     * @param {string} text 
     * @return {StatusTextTemplate}
     */
    render(status, text){
        return this.setStatus(status).setText(text);
    }

    /**
     * Render the StatusTextTemplate with no status
     * @param {string} text 
     * @return {StatusTextTemplate}
     */
    renderNone(text){
        return this.render(Status.status.none, text);
    }

    /**
     * Render the StatusTextTemplate with error status
     * @param {string} text 
     * @return {StatusTextTemplate}
     */
    renderError(text){
        return this.render(Status.status.error, text);
    }

    /**
     * Render the StatusTextTemplate with success status
     * @param {string} text 
     * @return {StatusTextTemplate}
     */
    renderSuccess(text){
        return this.render(Status.status.success, text);
    }

    /**
     * Render the StatusTextTemplate with info status
     * @param {string} text 
     * @return {StatusTextTemplate}
     */
    renderInfo(text){
        return this.render(Status.status.info, text);
    }

    /**
     * Render the StatusTextTemplate with warning status
     * @param {string} text 
     * @return {StatusTextTemplate}
     */
    renderWarning(text){
        return this.render(Status.status.warning, text);
    }
}
customElements.define('template-status-text', StatusTextTemplate);