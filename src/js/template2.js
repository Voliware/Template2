/**
 * Template2
 * https://github.com/Voliware/Template2
 * By Anthony Agostino - anthagostino|at|gmail[dot]com
 * GPL 3.0 license
 */

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
     * @param {string} [options.renderAttribute="data-name"] - the attribute of
     *                  each child element to match data in render() with
     * @param {boolean} [options.displayBlock=true] - whether to add the 
     *                  'template-block' class to the template on connectedCallback()
     * @returns {Template}
     */
    constructor(options = {}){
        super();
        let defaults = {
            elements: {},
            renderAttribute: 'data-name',
            displayBlock: true
        };
        this.options = Object.extend(defaults, options);
        this.eventSystem = new EventSystem();
        this.nativeEvents = {};
        this.elements = {};
        this.cachedData = {};
        this.renderData = {};
        this.isFirstRender = true;
        return this;
    }

    /**
     * This callback is fired when the element is appended
     * to the DOM, or when it is loaded if it's already there.
     * This is where HTML can be modified, and attributes
     * can be modified. That cannot happen in the constructor.
     */
    connectedCallback(){
        // by default, templates have no display
        if(this.options.displayBlock){
            this.classList.add('template-block');
        }
        this.findNamedElements();
        this.findElements(this.options.elements);
        this.attachHandlers();
    }

    /**
     * Attach handlers to template elements.
     * @returns {Template}
     */
    attachHandlers(){
        return this;
    }
        
    /**
     * Set Template options
     * @param {object} options 
     * @returns {Template}
     */
    setOptions(options){
        for(let k in options){
            if(this.options.hasOwnProperty(k)){
                this.options[k] = options[k];
            }
        }
        return this;
    }
        
    ////////////////////////////////////////////
    // Events
    ////////////////////////////////////////////

    /**
     * Add an event system to a regulard HTML element
     * @param {HTMLElement} element 
     */
    static addEventSystem(element){
       element.eventSystem = new EventSystem();
       element.nativeEvents = {};
    }

    /**
     * Add an event handler an elements event system.
     * @param {HTMLElement} element 
     * @param {string} event 
     * @param {function} callback
     * @example
     * Template.on(form, "submit", SubmitFunction);
     * @example
     * Template.on(form, "reset.tab1", ResetTab1Function);
     */
    static on(element, event, callback){
        let baseEvent = event.split('.')[0];

        // if it doesn't have one, create an event system for this element
        if(!element.eventSystem){
            Template.addEventSystem(element);
        }

        // add all base events, ie the "click" in "click.namespace",
        // to the elements native event listener. If the event does 
        // not actually exist natively, it will simply not fire.
        if(element.eventSystem.getHandlersCount(baseEvent) === 0){
            element.nativeEvents[baseEvent] = function(e){
                element.eventSystem.emit(baseEvent, e);
            };
            element.addEventListener(baseEvent, element.nativeEvents[baseEvent]);
        }

        element.eventSystem.on(event, callback);
    }

    /**
     * Add an event handler. If this is a native
     * DOM event, such as click, it will be added to
     * and called by the native event system.
     * @param {string} event 
     * @param {function} callback 
     * @returns {Template}
     */
    on(event, callback) {
        Template.on(this, event, callback);
        return this;
    }

    /**
     * Add an event handler an elements event system
     * that after emitting once, is removed.
     * @param {HTMLElement} element 
     * @param {string} event 
     * @param {function} callback
     * @example
     * Template.one(form, "submit", SubmitFunction);
     * @example
     * Template.one(form, "reset.tab1", ResetTab1Function);
     */
    static one(element, event, callback){
        let baseEvent = event.split('.')[0];

        // if it doesn't have one, create an event system for this element
        if(!element.eventSystem){
            Template.addEventSystem(element);
        }

        if(element.eventSystem.getHandlersCount(baseEvent) === 0){
            element.nativeEvents[baseEvent] = function(e){
                element.eventSystem.emit(baseEvent, e);
                element.removeEventListener(baseEvent, element.nativeEvents[baseEvent]);
            }
            element.addEventListener(baseEvent, element.nativeEvents[baseEvent]);
        }

        element.eventSystem.one(event, callback);
    }

    /**
     * Add an event handler that firwa once.
     * @param {string} event 
     * @param {function} callback 
     * @returns {Template}
     */
    one(event, callback) {
        Template.one(this, event, callback);
        return this;
    }

    /**
     * Remove an event. Also removes it from the native event system.
     * If removeAllChildren is set to true, it will also remove any namespaced handlers.
     * @param {HTMLElement} element 
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {boolean} [removeAllChildHandlers=true] - whether to remove all child events
     * @returns {Template}
     */
    static off(element, event, removeAllChildHandlers = true){
        if(!(element.eventSystem instanceof EventSystem)){
            return;
        }

        let baseEvent = event.split('.')[0];
        element.eventSystem.off(event, removeAllChildHandlers);
        if(element.eventSystem.getHandlersCount(baseEvent) === 0){
            element.removeEventListener(baseEvent, element.nativeEvents[baseEvent]);
        }
    }
  
    /**
     * Remove an event. Also removes it from the native event system.
     * If removeAllChildren is set to true, it will also remove any namespaced handlers.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {boolean} [removeAllChildHandlers=true] - whether to remove all child events
     * @returns {Template}
     */
    off(event, removeAllChildHandlers = true) {
        Template.off(this, event, removeAllChildHandlers);
        return this;
    }

    /**
     * Emit an event.
     * @param {HTMLElement} element 
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {*} data - data to pass along with the event
     * @returns {EventSystem}
     */
    static emit(element, event, data){
        if(element.eventSystem instanceof EventSystem){
            element.eventSystem.emit(event, data);
        }
    }

    /**
     * Emit an event.
     * @param {string} event - an event such as click, or click.foo.bar
     * @param {*} data - data to pass along with the event
     * @returns {EventSystem}
     */
    emit(event, data){
        Template.emit(this, event, data);
        return this;
    }

    /**
     * Set attributes from a NamedNodeMap
     * @param {NamedNodeMap} attributes 
     * @returns {Template}
     */
    setAttributes(attributes){
        for(let i = 0; i < attributes.length; i++){
            let attr = attributes[i];
            this.setAttribute(attr.name, attr.value);
        }
        return this;
    }
        
    ////////////////////////////////////////////
    // Tree
    ////////////////////////////////////////////

    /**
     * Find and register elements into the elements object.
     * @param {HTMLElement} element 
     * @param {object} elements - elements to find
     * @returns {object}
     */
    static findElements(element, elements){
        if(typeof element.elements !== "object"){
            element.elements = {};
        }
        for(let k in elements){
            element.elements[k] = element.querySelector(elements[k]);
        }
        return element.elements;
    }

    /**
     * Find and register elements into the elements object.
     * @param {object} elements - elements to find
     * @returns {object}
     */
    findElements(elements){
        return Template.findElements(this, elements);
    }

    /**
     * Find all elements that have name or data-name attributes.
     * @param {HTMLElement} element - HTMLElement to search through
     * @returns {object}
     */
    static findNamedElements(element){
        let elements = {};
        let found = element.querySelectorAll('[name], [data-name]');
        for(let i = 0; i < found.length; i++){
            let name = found[i].getAttribute('name');
            if(!name){
                name = found[i].getAttribute('data-name');
            }
            if(name){
                if(elements[name]){
                    if(!Array.isArray(elements[name])){
                        elements[name] = [elements[name]];
                    }
                    elements[name].push(found[i]);
                }
                else {
                    elements[name] = found[i];
                }
            }
        }
        return elements;
    }

    /**
     * Find all elements that have name or data-name attributes.
     * @returns {Template}
     */
    findNamedElements(){
        let elements = Template.findNamedElements(this);
        Object.extend(this.elements, elements);
        return this;
    }

    /**
     * Get registered child elements of the Template.
     * @returns {object}
     */
    getElements(){
        return this.elements;
    }

    /**
     * Select the all matching child elements of another element.
     * If no parent element is provided, searches through root node.
     * @param {HTMLElement} element - HTMLElement to search through
     * @param {string} selector - any valid css selector
     * @returns {HTMLElement}
     */
    static select(element, selector){
        if(typeof element === "string"){
            selector = element;
            element = document.documentElement;
        }
        return element.querySelectorAll(selector);
    }

    /**
     * Select all matching child elements of the root element.
     * @param {string} selector - any valid css selector
     * @returns {HTMLElement}
     */
    select(selector){
        return Template.select(this, selector);
    }
    
    /**
     * Select the first matching child element of another element.
     * @param {HTMLElement} element - HTMLElement to search through
     * @param {string} selector - any valid css selector
     * @returns {HTMLElement}
     */
    static selectFirst(element, selector){
        let elements = Template.select(element, selector);
        if(elements instanceof NodeList){
            return elements[0];
        }
        else {
            return null;
        }
    }

    /**
     * Select the first matching child element of the root element.
     * @param {string} selector - any valid css selector
     * @returns {HTMLElement}
     */
    selectFirst(selector){
        return Template.selectFirst(this, selector);
    }

    /**
     * Select the last matching child element of another element.
     * If no parent element is provided, searches through root node.
     * @param {HTMLElement} element - HTMLElement to search through
     * @param {string} selector - any valid css selector
     * @returns {HTMLElement}
     */
    static selectLast(element, selector){
        let elements = Template.select(element, selector);
        if(elements instanceof NodeList){
            return elements[element.length - 1];
        }
        else {
            return null;
        }
    }

    /**
     * Select the last matching child element of the root element.
     * @param {string} selector - any valid css selector
     * @returns {HTMLElement}
     */
    selectLast(selector){
        return Template.selectLast(selector);
    }

    /**
     * Append one element to another element
     * @param {HTMLElement} element - the element to append
     * @param {HTMLElement} toElement - the element to append to
     * @returns {Template}
     */
    static append(element, toElement){
        toElement.appendChild(element);
    }

    /**
     * Append an element 
     * @param {HTMLElement} element 
     * @returns {Template}
     */
    append(element){
        Template.append(element, this);
        return this;
    }

    /**
     * Append to another element
     * @param {HTMLElement} element 
     * @returns {Template}
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
     * @returns {Template}
     */
    prepend(element){
        Template.prepend(element, this);
        return this;
    }

    /**
     * Prepend to another element
     * @param {HTMLElement} element 
     * @returns {Template}
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
     * @returns {Template}
     */
    empty(){
        Template.empty(this);
        return this;
    }

    ////////////////////////////////////////////
    // Visibility
    ////////////////////////////////////////////

    /**
     * Determine if an element is visible
     * @param {HTMLElemet} element 
     * @returns {boolean}
     */
    static isVisible(element){
        // taken from jquery
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    }

    /**
     * Determine if the Template is visible
     * @returns {boolean}
     */
    isVisible(){
        return Template.isVisible(this);
    }

    /**
     * Hide an element 
     * @param {HTMLElemet} element 
     */
    static hide(element){
        if(element.style.display !== "none"){
            element._previousDisplay_ = element.style.display;
        }
        element.style.display = "none";
    }

    /**
     * Hide the Template
     * @returns {Template}
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
        element.style.display = element._previousDisplay_ || "block";
    }

    /**
     * Show the Template 
     * @returns {Template}
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
    static display(element, state){
        if(typeof state === "undefined"){
            state = !Template.isVisible(element);
        }
        return state ? Template.show(element) : Template.hide(element);
    }

    /**
     * Toggle the display of the Template by 
     * adding or removing the hidden class
     * @param {boolean} state 
     * @returns {Template}
     */
    display(state){
        Template.display(this, state);
        return this;
    }

    // styles

    /**
     * Get the value of a style of an element
     * @param {HTMLElement} element 
     * @param {string} style - style such as opacity, height, etc
     * @returns {string}
     */
    static getStyle(element, style){
        return window.getComputedStyle(element).getPropertyValue(style);
    }

    /**
     * Get the value of a style of the Template
     * @param {string} style - style such as opacity, height, etc
     * @returns {string}
     */
    getStyle(style){
        return Template.getStyle(this, style);
    }

    ////////////////////////////////////////////
    // Dimensions
    ////////////////////////////////////////////

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
     * @returns {Template}
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
     * @returns {Template}
     */
    setWidth(width){
        Template.setWidth(this, width);
        return this;
    }

    ////////////////////////////////////////////
    // Class
    ////////////////////////////////////////////

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
     * @returns {Template}
     */
    addClass(clazz){
        Template.addClass(this, clazz);
        return this;
    }

    /**
     * Determine if an element has a class
     * @param {HTMLElement} element 
     * @param {string} clazz 
     * @returns {boolean}
     */
    static hasClass(element, clazz){
        return element.classList.contains(clazz);
    }

    /**
     * Determine if the Template has a class
     * @param {string} clazz 
     * @returns {boolean}
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
     * @returns {Template}
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
     * @returns {Template}
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
     * @returns {Template}
     */
    toggleClass(clazz, state){
        Template.toggleClass(this, clazz, state);
        return this;
    }

    ////////////////////////////////////////////
    // Value
    ////////////////////////////////////////////

    /**
     * Get the value of an element
     * @param {HTMLElement} element
     * @returns {string} 
     */
    static getValue(element){
        return element.value;
    }

    /**
     * Get the value of the template
     * @returns {string} 
     */
    getValue(){
        return Template.getValue(this);
    }

    /**
     * Set the value of an element
     * @param {HTMLElement} element
     * @param {string} 
     */
    static setValue(element, value){
        element.value = value;
    }

    /**
     * Set the value of the template
     * @param {string} 
     * @returns {Template}
     */
    setValue(value){
        Template.setValue(this, value);
        return this;
    }

    ////////////////////////////////////////////
    // Enable/disable
    ////////////////////////////////////////////

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
     * @returns {Template}
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
     * @returns {Template}
     */
    disable(){
        Template.disable(this);
        return this;
    }

    ////////////////////////////////////////////
    // Render
    ////////////////////////////////////////////

    /**
     * Cache data as-is in case the 
     * original data is required.
     * @param {object} data 
     * @returns {object}
     */
    cacheData(data){
        return this.cachedData = Object.extend({}, data);
    }

    /**
     * Process data to be used for rendering.
     * @param {object} data 
     * @returns {object}
     */
    processRenderData(data){
        return this.renderData = data;
    }

    /**
     * Render all child elements of an element using an object of data.
     * In this case, render means set an input value, or set the 
     * innerhtml of a basic HTMLElement, or call the render() function
     * if the element has one, as it would for a Tempalte element.
     * If htmlElement is not a Template element, all elements with a 
     * [name] or [data-name] attribute whose value matches a key name 
     * in the data object will have their value or HTML set accordingly.
     * @param {HTMLElement} element - the element - which should have 1 or more 
     *                      child elements - to render. Otherwise, nothing happens.
     * @param {object} data - the data to render with. This object should have 
     *                      keys that would match [name] or [data-name] element attributes.
     * @param {boolean} [isTemplate=false] - whether the htmlElement is a Template
     *                      or not. If it is, renders using the elements already 
     *                      registered within the Template object - for speed.
     * @example
     * // fill a div with data
     * // <div id="myDiv">
     * //    <span data-name="name">Bob</span>
     * //    <span data-name="status">online</span>
     * // </div>
     * let myDiv = document.getElementById('myDiv');
     * Template.render(myDiv, {name: "Bob", status: "online"});
     * @example
     * // fill a form with data
     * // <form id="myForm">
     * //     <input name="name" type="text">
     * //     <select name="status">
     * //         <option value="offline">Offline</option>
     * //         <option value="online">Online</option>
     * //     </select>
     * // </form>
     * let myForm = document.getElementById('myForm');
     * Template.render(myForm, {name: "Bob", status: "online"});
     */
    static render(element, data, isTemplate = false){
        // if this is a Template, get the already registered child elements
        let elements = null;
        if(isTemplate){
            elements = element.getElements();
        }
        // otherwise, find all child elements with name or data-name attributes
        else {
            elements = Template.findNamedElements(element);
        } 

        let _data = Object.flatten(data);
        for(let k in _data){
            let value = _data[k];
            let htmlElement = elements[k];

            // did not find the element
            if(!htmlElement){
                // if its a template, can do a quick regather named elements
                if(isTemplate){
                    element.findNamedElements();
                    htmlElement = elements[k];
                }
                // still did not find it, continue
                if(!htmlElement){
                    continue;
                }
            }
            
            // if the element has a render function, use that 
            if(htmlElement.render){
                htmlElement.render(value);
                continue;
            }

            // if only a single element was found, put it into an array
            if(!Array.isArray(htmlElement)){
                htmlElement = [htmlElement];
            }

            // loop through all found elements and render them
            for(let i = 0; i < htmlElement.length; i++){
                let thisElement = htmlElement[i];

                if(thisElement.getAttribute('data-render') === "false"){
                    continue;
                }

                if(thisElement.tagName === "INPUT"){
                    let type = thisElement.getAttribute('type');
                    if(type){
                        if(type === 'checkbox' && value){
                            thisElement.checked = true;
                        }
                        else if(type === 'radio'){
                            if(thisElement.getAttribute('value') === value){
                                thisElement.checked = true;
                            }
                        }
                        else {
                            thisElement.value = value;
                        }
                    }
                }
                else if (thisElement.tagName === "SELECT"){
                    thisElement.value = value;
                }
                else {
                    thisElement.innerHTML = value;
                }
            }
        }
    }

    /**
     * Render the Template.
     * Cache and process the render data.
     * @param {object} data 
     * @returns {Template}
     */
    render(data){
        this.cachedData = this.cacheData(data);
        this.renderData = this.processRenderData(Object.extend({}, data));
        Template.render(this, this.renderData, true);
        this.isFirstRender = false;
        return this;
    }

    /**
     * Clone an HTMLElement including its inner html.
     * @param {HTMLElement} element 
     * @returns {HTMLElement}
     */
    static clone(element){
        let clone = element.cloneNode();
        clone.innerHTML = element.innerHTML;
        return clone;
    }

    /**
     * Clone the Template including its inner html.
     * @returns {HTMLElement}
     */
    clone(){
        return Template.clone(this);
    }
}
customElements.define('template-element', Template);