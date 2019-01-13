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
 * Createa a random string of characters
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
     * Trigger an event.
     * This will trigger all namespaced child events.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {*} data - data to pass along with the event
     * @return {EventSystem}
     */
    trigger(event, data) {
        let eventArray = event.split('.');

        let lastObject = this.events;
        for (let i = 0; i < eventArray.length; i++) {
            let currentEventNamespace = eventArray[i];
			lastObject = lastObject[currentEventNamespace];
            if (i === eventArray.length - 1) {
                _trigger(lastObject, data);
            } 
        }

        /**
         * Recursively trigger event handlers 
         * through the handler tree.
         * @param {object} obj 
         * @param {*} data 
         */
        function _trigger(obj, data) {
            for (let k in obj) {
                if (k === "_handlers") {
                    for (let x = 0; x < obj[k].length; x++) {
                        obj[k][x](data);
                    }
                } else {
                    _trigger(obj[k], data);
                }
            }
        }

        return this;
    }

    /**
     * Emit an event.
     * This will trigger all namespaced child events.
     * Alias to trigger.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {*} data - data to pass along with the event
     * @return {EventSystem}
     */
    emit(event, data){
        return this.trigger(event, data);
    }
}
  
/**
 * Template manager.
 * Can create and manage Template objects.
 * The template must be an Template or at least HTMLElement.
 * @extends {EventSystem}
 */
class TemplateManager extends EventSystem {

    /**
     * Constructor
     * @param {HTLMElement} wrapper - wrapper element where templates are appended
     * @param {Template|HTLMElement} template - a cloneable element
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

    cacheData(data){
        return Object.extend({}, data);
    }

    processRenderData(data){
        return data;
    }
    
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
     * @return {Template|HTMLElement}
     */
    attachTemplateHandlers(template){
        return this;
    }

    /**
     * Create a new clone of the template.
     * Attach handlers to it.
     * @return {Template|HTMLElement}
     */
    createTemplate(){
        let template = this.template.cloneNode(true);
        this.attachTemplateHandlers(template);
        return template;
    }

    /**
     * Append a template to the wrapper
     * @param {Template|HTMLElement} template 
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
     * @param {Template|HTMLElement} template 
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
            template.render(data);
            this.templates.set(id, template);
            if(isNew){
                this.appendTemplate(template);
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
 * Has a render function takes in an object of data and
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
            createHtml: true,
            renderAttribute: 'data-name',
            displayBlock: true
        };
        this.eventSystem = new EventSystem();
        this.options = Object.extend(defaults, options);
        this.htmlTemplate = null;
        if(this.options.html !== ""){
            this.parseHtml(this.options.html);
        }
        else if(this.options.createHtml){
            this.constructDefaultHtml();
        }
        // the dom must be extracted before attributes are copied
        // from an html template - otherwise, watched attribute
        // callbacks will be called before the dom object is created!
        this.dom = this.extractDom();
        if(this.htmlTemplate){
            this.setAttributes(this.htmlTemplate.attributes);
        }
        // by default, templates have no display
        if(this.options.displayBlock){
            this.classList.add('template-block');
        }
        this.cachedData = {};
        this.renderData = {};

        // states
        this.slideState = true;

        return this;
    }

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
  
    off(event, removeAllChildHandlers = true) {
        let baseEvent = event.split('.')[0];
        this.eventSystem.off(event, removeAllChildHandlers);
        if(this.eventSystem.getHandlersCount(event) > 0){
            this.removeEventListener(baseEvent);
        }
        return this;
    }

    emit(event, data){
        this.eventSystem.emit(event, data);
        return this;
    }
    
    constructDefaultHtml(){
        return this;
    }

    parseHtml(html){
        if(typeof html === 'string') {
            let template = document.createElement('template');
            template.innerHTML = html.trim();
            this.htmlTemplate = template.content.firstChild;
            this.innerHTML = this.htmlTemplate.innerHTML;
        }
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

    appendTo(element){
        element.appendChild(this);
        return this;
    }

    empty(){
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }
        return this;
    }

    // visibility

    static isVisible(element){
        // taken from jquery
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    }

    static hide(element){
        element.classList.add('hidden');
    }

    static show(element){
        element.classList.remove('hidden');
    }

    static toggle(element, state){
        if(typeof state === "undefined"){
            state = !Template.isVisible(element);
        }
        return state ? Template.show(element) : Template.hide(element);
    }

    isVisible(){
        return Template.isVisible(this);
    }

    hide(){
        Template.hide(this);
        return this;
    }

    show(){
        Template.show(this);
        return this;
    }

    toggle(state){
        Template.toggle(this, state);
        return this;
    }

    // dimensions

    setHeight(height){
        this.style.height = height + 'px';
        return this;
    }

    setWidth(width){
        this.style.width = width + 'px';
        return this;
    }

    // animations

    static slideUp(element, duration = 250){
        let height = element.clientHeight;
        anime({
            targets: element,
            duration: duration,
            easing: 'linear',
            height: 0
        }).finished.then(function(){
            element.style.display = "none";
            element.style.height = height + "px";
        });
    }

    static slideDown(element, duration = 250){
        let height = element.style.height;
        element.style.height = 0;
        element.style.display = "block";
        anime({
            targets: element,
            duration: duration,
            easing: 'linear',
            height: height
        })
    }

    static fadeIn(element, duration = 500){
        anime({
            targets: element,
            duration: duration,
            easing: 'linear',
            opacity: 1,
        });
    }

    static fadeOut(element, duration = 500){
        anime({
            targets: element,
            duration: duration,
            easing: 'linear',
            opacity: 0,
        });
    }

    static fadeToggle(element, state, duration){
        return state ? Template.fadeIn(element, duration) : Template.fadeOut(element, duration);
    }

    slideUp(duration){
        return Template.slideUp(this, duration);
    }

    slideDown(duration){
        return Template.slideDown(this, duration);
    }

    slideToggle(duration){
        if(this.slideState){
            this.slideUp(duration);
        }
        else {
            this.slideDown(duration);
        }
        this.slideState = !this.slideState;
        return this;
    }

    fadeOut(duration){
        return Template.fadeOut(this, duration);
    }

    fadeIn(duration){
        return Template.fadeIn(this, duration);
    }

    fadeToggle(state, duration){
        return Template.fadeToggle(this, state, duration);
    }

    // class

    addClass(clazz){
        Template.addClass(this, clazz);
        return this;
    }

    removeClass(clazz){
        Template.removeClass(this, clazz);
        return this;
    }

    replaceClass(oldClass, newClass){
        Template.replaceClass(this, oldClass, newClass);
        return this;
    }

    static addClass(element, clazz){
        element.classList.add(clazz);
    }

    static removeClass(element, clazz){
        element.classList.remove(clazz);
    }

    static replaceClass(element, oldClass, newClass){
        element.classList.replace(oldClass, newClass);
    }

    // enable/disable

    enable(){
        Template.enable(this);
        return this;
    }

    disable(){
        Template.disable(this);
        return this;
    }

    static enable(element){
        element.disabled = false;
    }

    static disable(element){
        element.disabled = true;
    }

    // data

    /**
     * Cache data.
     * @param {object} data 
     * @return {object}
     */
    cacheData(data){
        return Object.extend({}, data);
    }

    processRenderData(data){
        return data;
    }

    render(data){
        this.cachedData = this.cacheData(data);
        this.renderData = this.processRenderData(Object.extend({}, data));
        Template.render(this, this.renderData);
        return this;
    }

    static render(htmlElement, data){
        let renderAttribute = htmlElement.options && htmlElement.options.renderAttribute 
            ? htmlElement.options.renderAttribute 
            : 'data-name';

        for(let k in data){
            let elements = htmlElement.querySelectorAll(`[${renderAttribute}="${k}"]`);
            for(let i = 0; i < elements.length; i++){
                let element = elements[i];
                if(element instanceof Template){
                    element.render(data[k]);
                }
                else if(element instanceof HTMLInputElement){
                    element.value = data[k];
                }
                else {
                    elements[i].innerHTML = data[k];
                }
            }
        }
    }
}
customElements.define('template-custom', Template);

class Form extends Template {
    constructor(options = {}){
        let defaults = {
            getRequest: null,
            submitRequest: null,
            validateRequest: null,
			checkboxMode: Form.checkboxMode.number,
            serializeMode: Form.serializeMode.toObject,
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
        let self = this;
        this.serializedData = {};
        this.formattedSerializedData = null;

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

    static fromElementId(elementId, options){
        let form = document.getElementById(elementId);
        form.setOptions(options);
        return form;
    }

    reload(){
        
    }

    setOptions(options){
        for(let k in options){
            if(this.options.hasOwnProperty(k)){
                this.options[k] = options[k];
            }
        }
        return this;
    }

    convertCheckbox(checkbox, mode){
		let checked = checkbox.checked
		switch(mode){
			case Form.checkboxMode.boolean:
                return checked;
			case Form.checkboxMode.string:
				return checked ? '1' : '0';
			case Form.checkboxMode.onOff:
				return checked ? 'on' : 'off';
            default:
            case Form.checkboxMode.number:
                return checked ? 1 : 0;
		}
    }
    
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

    serialize(){
        this.serializedData = {};
        
        let inputs = this.getElementsByTagName('input');
        for (let i = 0; i < inputs.length; i++) {
            if(this.isNotExcluded(inputs[i])){
                this.serializeInput(inputs[i]);
            }
        }

        let selects = this.getElementsByTagName('select');
        for (let i = 0; i < selects.length; i++) {
            if(this.isNotExcluded(selects[i])){
                this.serializeSelect(selects[i]);
            }
        }

        let textareas = this.getElementsByTagName('textarea');
        for (let i = 0; i < textareas.length; i++) {
            if(this.isNotExcluded(textareas[i])){
                this.serializeTextarea(textareas[i]);
            }
        }

        return this.serializedData;
    }

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

    serializeTextarea(textarea){
        return this.serializeSelect(textarea);        
    }

    serializeSelect(select){
        let name = select.getAttribute('name');
        return this.serializedData[name] = select.value;
    }

    formatSerializedData(data){
		switch(this.options.serializeMode){
			case Form.serializeMode.toString:
				return this.serializedDataToString(data);
            default:
            case Form.serializeMode.toObject:
                return this.serializedData;
		}
    }

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

    submit(){
        let self = this;
        this.serializedData = this.serialize();
        this.formattedSerializedData = this.formatSerializedData(this.serializedData);
        return this.options.submitRequest(this.formattedSerializedData)
            .then(function(data){
                self.emit('success', data);
            })
            .catch(function(err){
                self.emit('fail', err);
            });
    }
}
Form.checkboxMode = {
	boolean : 0,
	number : 1,
	string : 2,
	onOff : 3
};
Form.serializeMode = {
	toString : 0,
	toOrderedString : 1,
	toObject : 2,
	toValue : 3
};
customElements.define('template-form', Form);

class Table extends Template {
    constructor(options){
        let defaults = {
            alwaysRebuild: false,
            primaryKey: 'id',
            dom: {
                thead: 'thead',
                theadTr: 'thead > tr',
                tbody: 'tbody',
                tfoot: 'tfoot',
                tr: 'tbody > tr'
            }
        };
        super(Object.extend(defaults, options));
        this.rows = {};
        this.columnCount = this.dom.tr.querySelectorAll('td').length;
        this.dom.tr.remove();
        return this;
    }

    render(data){
        this.cacheData(data);
        let renderData = this.processRenderData(data);
        if(this.options.alwaysRebuild){
            this.emptyTable();
        }
        if(Array.isArray(renderData)){
            if(!renderData.length){
                return this;
            }
            if(typeof renderData[0] !== "object"){
                return this;
            }
            // no primary key, cannot update rows
            if(typeof renderData[0][this.options.primaryKey] === 'undefined'){
                this.emptyTable();
            }
            for(let row of renderData){
                this.createOrRenderRow(row);
            }
        }
        else {
            for(let k in renderData){
                this.createOrRenderRow(renderData[k]);
            }
        }
        return this;
    }

    createOrRenderRow(rowData){
        let id = rowData[this.options.primaryKey];
        if(this.rows[id]){
            this.renderRow(this.rows[id], rowData);
        }
        else {
            let row = this.createRow(rowData);
            this.addRow(row, rowData[this.options.primaryKey]);
        }
        return this;
    }

    emptyTable(){
        while (this.dom.tbody.firstChild) {
            this.dom.tbody.removeChild(this.dom.tbody.firstChild);
        }
        return this;
    }

    // header

    createHeader(){
        let header = document.createElement('th');
        return header;
    }

    addHeader(header){
        this.dom.thead.appendChild(header);
        return this;
    }

    // row

    createRow(rowData){
        let row = this.dom.tr.cloneNode(true);
        this.renderRow(row, rowData);
        return row;
    }

    addRow(row, id){
        this.rows[id] = row;
        this.appendRow(row);
        return this;
    }

    appendRow(row){
        this.dom.tbody.appendChild(row);
        return this;
    }

    renderRow(row, rowData){
        Template.render(row, rowData);
        return this;
    }

    removeRow(row){

    }

    // column

    createColumn(){
        let column = document.createElement('td');
        return column;
    }

    addColumn(row, column){
        row.appendChild(column);
        return this;
    }
}
customElements.define('template-table', Table);

class Popup extends Template {
    constructor(options){
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

    constructDefaultHtml(){
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
            </div>`;
        return this;
    }

    applyOptions(options){
        if(!this.options.showHeader){
            this.dom.header.remove();
        }
        if(!this.options.showCloseBtn){
            this.dom.closeBtn.remove();
        }
        if(!this.options.showFooter){
            this.dom.footer.remove();
        }
        return this;
    }

    open(){
        document.body.classList.add('popup-open');
        this.show().fadeIn();
        return this;
    }

    close(){
        document.body.classList.remove('popup-open');
        this.fadeOut();
        let self = this;
        setTimeout(function(){
            self.hide();
        }, 1000);
        return this;
    }

    renderTitle(html){
        this.dom.title.innerHTML = html;
        return this;
    }

    renderBody(html){
        this.dom.body.innerHTML = html;
        return this;
    }

    renderFooter(html){
        this.dom.footer.innerHTML = html;
        return this;
    }
}
customElements.define('template-popup', Popup);

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

class StatusFeedback extends Template {
    static get observedAttributes() {return ['status', 'text'];}

    constructor(options){
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

    constructDefaultHtml(){
        this.innerHTML = `
            <div class="status-feedback-icon">
                OK!
            </div>
            <div class="status-feedback-text"></div>
            <button class="status-feedback-closeBtn btn-none">
                X
            </button>`;
        return this;
    }

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
    
    setStatus(status){
        this.setAttribute('status', status);
        return this;
    }

    clearStatusClass(){
        this.classList.remove(...Status.bgclassArray);
        return this;
    }

    setClass(clazz){
        this.clearStatusClass();
        this.classList.add(clazz);
        return this;
    }

    setText(text){
        this.dom.text.textContent = text;
        return this;
    }

    setIcon(icon){
        this.dom.icon.innerHTML = icon;
        return this;
    }

    render(status, text, icon){
        return this.setStatus(status).setText(text).setIcon(icon);
    }

    renderError(message){
        return this.render(Status.status.error, message, Status.icon[Status.status.error]);
    }

    renderInfo(message){
        return this.render(Status.status.info, message, Status.icon[Status.status.error]);
    }

    renderProcessing(message){
        return this.render(Status.status.processing, message, Status.icon[Status.status.processing]);
    }

    renderSuccess(message){
        return this.render(Status.status.success, message, icon);
    }

    renderWarning(message){
        return this.render(Status.status.warning, message, Status.icon[Status.status.warning]);
    }
}
customElements.define('template-status-feedback', StatusFeedback);

class StatusText extends Template {
    static get observedAttributes() {return ['status', 'text']; }

    constructor(){
        super();
        return this;
    }

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
    
    constructDefaultHtml(){
        if(!this.hasAttribute('status')){
            this.setAttribute('status', Status.status.none);
        }
        if(!this.hasAttribute('text')){
            this.setAttribute('text', '');
        }
        return this;
    }

    setStatus(status){
        this.setAttribute('status', status);
        return this;
    }

    clearStatusClass(){
        this.classList.remove(...Status.classArray);
        return this;
    }

    setClass(clazz){
        this.clearStatusClass();
        this.classList.add(clazz);
        return this;
    }

    setText(text){
        this.textContent = text;
        return this;
    }

    render(status, text){
        return this.setStatus(status).setText(text);
    }

    renderNone(text){
        return this.render(Status.status.none, text);
    }

    renderError(text){
        return this.render(Status.status.error, text);
    }

    renderSuccess(text){
        return this.render(Status.status.success, text);
    }

    renderInfo(text){
        return this.render(Status.status.info, text);
    }

    renderWarning(text){
        return this.render(Status.status.warning, text);
    }
}
customElements.define('template-status-text', StatusText);