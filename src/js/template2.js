/**
 * Template2
 * https://github.com/Voliware/Template2
 * By Anthony Agostino - anthagostino|at|gmail[dot]com
 * GPL 3.0 license
 */

/**
 * An enhanced HTMLElement.
 * Provides many easy-to-use functions for typical DOM manipulation.
 * Provides a namespaced EventSystem with on/off handlers.
 * Renders all child elements that have [name] or [data-name] (default)
 * attributes set by matching with an object of data. 
 * Child elements can be collected as defined by constructor params.
 * Requires use of the customElements system.
 * @extends {HTMLElement}
 * @example
 * class ChatBubbleTemplate extends Template {}
 * customElements.define('template-chat-bubble', ChatBubbleTemplate);
 * @todo Write a way using node-build and the replace stream to insert
 * templates written into html into the createHtml() function. So cool.
 * Something easy like Template.setHtml(MyTemplate, my_file); in build script.
 */
class Template extends HTMLElement {

    /**
     * Constructor
     * @param {Object} [params={}]
     * @param {Object} [params.elements={}] - A collection of element selectors
     * to capture child elements of the Template
     * @param {String} [params.render_attribute="data-name"] - The attribute of
     * each child element to match data in render() with
     * @param {Boolean} [params.display_block=true] - Whether to add the 
     * 'template-block' class to the template 
     */
    constructor({
        elements = {},
        render_attribute = 'data-name',
        display_block = true
    } = {})
    {
        super();

        /**
         * Event system for native and non-native HTML events
         * @type {EventSystem}
         */
        this.event_system = new EventSystem();

        /**
         * A collection of registered native events. 
         * Required to wrap native events with the event system.
         * @type {Object}
         */
        this.native_events = {};

        /**
         * A collection of registered elements for quick use.
         * All elements with [name] or [data-name] attributes are automatically
         * added to this collection when the element is appended to the DOM.
         * @type {Object}
         */
        this.elements = elements;

        /**
         * The last version of unmodified data passed to the render() function.
         * @type {Array|Map|Object}
         */
        this.cached_data = null;
        
        /**
         * The last version of modified data passed to the render() function
         * and modified by processRenderData().
         * @type {Array|Map|Object}
         */
        this.render_data = {};

        /**
         * Whether or not this is the first time the Template is rendered.
         * @type {Boolean}
         */
        this.is_first_Render = true;

        /**
         * The HTML attribute used to find and register elements to the 
         * elements collection and to find and render elements.
         * @type {String}
         */
        this.render_attribute = render_attribute

        /**
         * Whether or not to add the 'template-block' attribute to a
         * template once it is appended to the DOM. Otherwise, templates
         * by nature have no default display. 
         * @type {Boolean}
         */
        this.display_block = display_block;
    }

    /**
     * Connected callback. Called when element is attached to DOM.
     * This is the only time after construction that DOM can be changed.
     * Add the 'template-block' class if option is set to true.
     * Capture existing DOM inside the root element if found. Otherwise,
     * create and set the innerHTML if createHtml() returns html.
     * Find all elements with [name] or [data-name] attributes.
     * Find all elements that were added to the elements property.
     * Call the onConnected() function which child classes implement.
     */
    connectedCallback(){
        // Check for existing HTML
        if(!this.firstChild){
            // Create HTML
            let html = this.createHtml();
            if(typeof html === "string"){
                html = html.trim();
                this.setHtml(html);
            }
        }
        // Toggle visibility
        if(this.display_block){
            this.classList.add('template-block');
        }
        // Find name elements
        this.findNamedElements();
        this.findElements(this.elements);
        this.onConnected();
    }

    /**
     * Called after connectedCallback().
     * Override this in custom Templates.
     * This is where event handlers should be attached.
     */
    onConnected(){

    }

    /**
     * Create the inner HTML for this template
     * @returns {String|Null}
     */
    createHtml(){
        return null;
    }
        
    /**************************************************************************
     * Events
     *************************************************************************/

    /**
     * Add an event system to a regular HTML element
     * @param {HTMLElement} element 
     */
    static addEventSystem(element){
       element.event_system = new EventSystem();
       element.native_events = {};
    }

    /**
     * Add an event handler. If this is a native DOM event, such as click, it
     * will be added to and called by the native event system.
     * @param {HTMLElement} element 
     * @param {String} event 
     * @param {Function} callback
     * @example
     * Template.on(form, "submit", SubmitFunction);
     * @example
     * Template.on(form, "reset.tab1", ResetTab1Function);
     */
    static on(element, event, callback){
        let base_event = event.split('.')[0];

        // Create an event system for this element if it doesn't have one
        if(!element.event_system){
            Template.addEventSystem(element);
        }

        // Add all base events, ie the "click" in "click.namespace",
        // to the elements native event listener. If the event does 
        // not actually exist natively, it will simply not fire.
        if(element.event_system.getHandlersCount(base_event) === 0){
            element.native_events[base_event] = (e) => {
                element.event_system.emit(base_event, e);
            };
            element.addEventListener(
                base_event, 
                element.native_events[base_event]
            );
        }

        element.event_system.on(event, callback);
    }

    /**
     * Add an event handler. If this is a native DOM event, such as click, it
     * will be added to and called by the native event system.
     * @param {String} event 
     * @param {Function} callback 
     */
    on(event, callback) {
        Template.on(this, event, callback);
    }

    /**
     * Add an event handler that fires once.
     * @param {HTMLElement} element 
     * @param {String} event 
     * @param {Function} callback
     * @example
     * Template.one(form, "submit", SubmitFunction);
     * @example
     * Template.one(form, "reset.tab1", ResetTab1Function);
     */
    static one(element, event, callback){
        let base_event = event.split('.')[0];

        // Create an event system for this element if it doesn't have one
        if(!element.event_system){
            Template.addEventSystem(element);
        }

        if(element.event_system.getHandlersCount(base_event) === 0){
            element.native_events[base_event] = (e) => {
                element.event_system.emit(base_event, e);
                element.removeEventListener(
                    base_event, 
                    element.native_events[base_event]
                );
            }
            element.addEventListener(
                base_event, 
                element.native_events[base_event]
            );
        }

        element.event_system.one(event, callback);
    }

    /**
     * Add an event handler that fires once.
     * @param {String} event 
     * @param {Function} callback 
     */
    one(event, callback) {
        Template.one(this, event, callback);
    }

    /**
     * Remove an event. Also removes it from the native event system. If 
     * remove_all_child_handlers is set to true, it will also remove any
     * namespaced handlers.
     * @param {HTMLElement} element 
     * @param {String} event - An event such as click, or click.foo.bar
     * @param {Boolean} [remove_all_child_handlers=true] - Whether to remove 
     * all child events
     */
    static off(element, event, remove_all_child_handlers = true){
        if(!(element.event_system instanceof EventSystem)){
            return;
        }

        let base_event = event.split('.')[0];
        element.event_system.off(event, remove_all_child_handlers);
        if(element.event_system.getHandlersCount(base_event) === 0){
            element.removeEventListener(
                base_event, 
                element.native_events[base_event]
            );
        }
    }
  
    /**
     * Remove an event. Also removes it from the native event system. If 
     * remove_all_child_handlers is set to true, it will also remove any
     * namespaced handlers.
     * @param {String} event - An event such as click, or click.foo.bar
     * @param {Boolean} [remove_all_child_handlers=true] - Whether to remove 
     * all child events
     */
    off(event, remove_all_child_handlers = true) {
        Template.off(this, event, remove_all_child_handlers);
    }

    /**
     * Emit an event.
     * @param {HTMLElement} element 
     * @param {String} event - An event such as click, or click.foo.bar
     * @param {*} data - Data to pass along with the event
     */
    static emit(element, event, data){
        if(element.event_system instanceof EventSystem){
            element.event_system.emit(event, data);
        }
    }

    /**
     * Emit an event.
     * @param {String} event - An event such as click, or click.foo.bar
     * @param {*} data - Data to pass along with the event
     */
    emit(event, data){
        Template.emit(this, event, data);
    }

    /**
     * Set attributes from a NamedNodeMap
     * @param {NamedNodeMap} attributes 
     */
    setAttributes(attributes){
        for(let i = 0; i < attributes.length; i++){
            let attr = attributes[i];
            this.setAttribute(attr.name, attr.value);
        }
    }
        
    /**************************************************************************
     * DOM
     *************************************************************************/

    /**
     * Find and register elements into the elements object.
     * @param {HTMLElement} element 
     * @param {Object} elements - Elements to find
     * @returns {Object}
     */
    static findElements(element, elements){
        if(typeof element.elements !== "object"){
            element.elements = {};
        }
        for(let k in elements){
            if(typeof elements[k] === "string"){
                element.elements[k] = element.querySelector(elements[k]);
            }
        }
        return element.elements;
    }

    /**
     * Find and register elements into the elements object.
     * @param {Object} elements - Elements to find
     * @returns {Object}
     */
    findElements(elements){
        return Template.findElements(this, elements);
    }

    /**
     * Find all elements that have name or a specific selector.
     * @param {HTMLElement} element - HTMLElement to search through
     * @returns {Object}
     */
    static findNamedElements(element, selector = 'data-name'){
        let elements = {};
        let found = element.querySelectorAll(`[name], [${selector}]`);
        for(let i = 0; i < found.length; i++){
            let name = found[i].getAttribute('name');
            if(!name){
                name = found[i].getAttribute(selector);
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
     */
    findNamedElements(){
        // @todo STOP THIS from finding elements of other templates
        let elements = Template.findNamedElements(this, this.render_attribute);
        Object.extend(this.elements, elements);
    }

    /**
     * Get registered child elements of the Template.
     * @returns {Object}
     */
    getElements(){
        return this.elements;
    }

    /**
     * Select all matching child elements of another element. If no parent 
     * element is provided, searches through root node.
     * @param {HTMLElement} element - HTMLElement to search through
     * @param {String} selector - Any valid css selector
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
     * @param {String} selector - Any valid css selector
     * @returns {HTMLElement}
     */
    select(selector){
        return Template.select(this, selector);
    }
    
    /**
     * Select the first matching child element of another element.
     * @param {HTMLElement} element - HTMLElement to search through
     * @param {String} selector - Any valid css selector
     * @returns {HTMLElement|Null}
     */
    static selectFirst(element, selector){
        let elements = Template.select(element, selector);
        if(elements instanceof NodeList && elements.length){
            return elements[0];
        }
        else {
            return null;
        }
    }

    /**
     * Select the first matching child element of the root element.
     * @param {String} selector - Any valid css selector
     * @returns {HTMLElement|Null}
     */
    selectFirst(selector){
        return Template.selectFirst(this, selector);
    }

    /**
     * Select the last matching child element of another element. If no parent
     * element is provided, searches through root node.
     * @param {HTMLElement} element - HTMLElement to search through
     * @param {String} selector - Any valid css selector
     * @returns {HTMLElement|Null}
     */
    static selectLast(element, selector){
        let elements = Template.select(element, selector);
        if(elements instanceof NodeList && elements.length){
            return elements[elements.length - 1];
        }
        else {
            return null;
        }
    }

    /**
     * Select the last matching child element of the root element.
     * @param {String} selector - Any valid css selector
     * @returns {HTMLElement|Null}
     */
    selectLast(selector){
        return Template.selectLast(selector);
    }

    /**
     * Append one element to another element
     * @param {HTMLElement} element - The element to append
     * @param {HTMLElement} toElement - The element to append to
     */
    static append(element, toElement){
        toElement.appendChild(element);
    }

    /**
     * Append an element 
     * @param {HTMLElement} element 
     */
    append(element){
        Template.append(element, this);
    }

    /**
     * Append to another element
     * @param {HTMLElement} element 
     */
    appendTo(element){
        Template.append(this, element);
    }

    /**
     * Prepend an element to another element
     * @param {HTMLElement} element - The element to prepend
     * @param {HTMLElement} toElement - The element to prepend to
     */
    static prepend(element, toElement){
        if(toElement.firstChild){
            toElement.insertBefore(element, toElement.firstChild);
        }
    }

    /**
     * Prepend another element
     * @param {HTMLElement} element 
     */
    prepend(element){
        Template.prepend(element, this);
    }

    /**
     * Prepend to another element
     * @param {HTMLElement} element 
     */
    prependTo(element){
        Template.prepend(this, element);
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
     */
    empty(){
        Template.empty(this);
    }
    
    /**************************************************************************
     * Visibility
     *************************************************************************/

    /**
     * Determine if an element is visible
     * @param {HTMLElemet} element 
     * @returns {Boolean}
     */
    static isVisible(element){
        // taken from jquery
        return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    }

    /**
     * Determine if the Template is visible
     * @returns {Boolean}
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
            element.previous_display = element.style.display;
        }
        element.style.display = "none";
    }

    /**
     * Hide the Template
     */
    hide(){
        Template.hide(this);
    }

    /**
     * Show an element 
     * @param {HTMLElemet} element 
     */
    static show(element){
        element.style.display = element.previous_display || "block";
    }

    /**
     * Show the Template 
     */
    show(){
        Template.show(this);
    }

    /**
     * Toggle the display of an element
     * @param {HTMLElement} element 
     * @param {Boolean} state 
     */
    static display(element, state){
        if(typeof state === "undefined"){
            state = !Template.isVisible(element);
        }
        return state ? Template.show(element) : Template.hide(element);
    }

    /**
     * Toggle the display of the Template
     * @param {Boolean} state 
     */
    display(state){
        Template.display(this, state);
    }

    /**************************************************************************
     * Styles
     *************************************************************************/

    /**
     * Get the value of a style of an element
     * @param {HTMLElement} element 
     * @param {String} style - Style such as opacity, height, etc
     * @returns {String}
     */
    static getStyle(element, style){
        return window.getComputedStyle(element).getPropertyValue(style);
    }

    /**
     * Get the value of a style of the Template
     * @param {String} style - Style such as opacity, height, etc
     * @returns {String}
     */
    getStyle(style){
        return Template.getStyle(this, style);
    }

    /**************************************************************************
     * Dimensions
     *************************************************************************/

    /**
     * Set the height of an element.
     * @param {HTMLElement} element 
     * @param {Number|String} height - If passed as Number, defaults to "px" 
     */
    static setHeight(element, height){
        if(typeof height === "number"){
            height += "px";
        }
        element.style.height = height;
    }

    /**
     * Set the height of the Template
     * @param {Number|String} height - If passed as Number, defaults to "px" 
     */
    setHeight(height){
        Template.setHeight(this, height);
    }

    /**
     * Set the width of an element
     * @param {HTMLElement} element 
     * @param {Number|String} width - If passed as Number, defaults to "px" 
     */
    static setWidth(element, width){
        if(typeof width === "number"){
            width += "px";
        }
        element.style.width = width;
    }

    /**
     * Set the width of the Template
     * @param {Number|String} width - If passed as Number, defaults to "px" 
     */
    setWidth(width){
        Template.setWidth(this, width);
    }

    /**************************************************************************
     * Class
     *************************************************************************/

    /**
     * Add a class to an element
     * @param {HTMLElement} element 
     * @param {String} clazz 
     */
    static addClass(element, clazz){
        element.classList.add(clazz);
    }

    /**
     * Add a class to the Template
     * @param {String} clazz 
     */
    addClass(clazz){
        Template.addClass(this, clazz);
    }

    /**
     * Determine if an element has a class
     * @param {HTMLElement} element 
     * @param {String} clazz 
     * @returns {Boolean}
     */
    static hasClass(element, clazz){
        return element.classList.contains(clazz);
    }

    /**
     * Determine if the Template has a class
     * @param {String} clazz 
     * @returns {Boolean}
     */
    hasClass(clazz){
        return Template.hasClass(this, clazz);
    }

    /**
     * Remove a class from an element
     * @param {HTMLElement} element 
     * @param {String} clazz 
     */
    static removeClass(element, clazz){
        element.classList.remove(clazz);
    }

    /**
     * Remove a class from the Template
     * @param {String} clazz 
     */
    removeClass(clazz){
        Template.removeClass(this, clazz);
    }

    /**
     * Replace a class of an element with another
     * @param {HTMLElement} element 
     * @param {String} old_class - Class to replace
     * @param {String} new_class - Class to add
     */
    static replaceClass(element, old_class, new_class){
        element.classList.replace(old_class, new_class);
    }

    /**
     * Replace a class of the Template with another
     * @param {String} old_class - Class to replace
     * @param {String} new_class - Class to add
     */
    replaceClass(old_class, new_class){
        Template.replaceClass(this, old_class, new_class);
    }

    /**
     * Toggle a class of an element. If no state boolean is passed, set the 
     * class state to its opposite.
     * @param {HTMLElement} element 
     * @param {String} clazz 
     * @param {Boolean} [state]
     */
    static toggleClass(element, clazz, state){
        element.classList.toggle(clazz, state);
    }
    
    /**
     * Toggle a class of an element. If no state boolean is passed, set the 
     * class state to its opposite.
     * @param {String} clazz 
     * @param {Boolean} [state]
     */
    toggleClass(clazz, state){
        Template.toggleClass(this, clazz, state);
        return this;
    }

    /**************************************************************************
     * Value
     *************************************************************************/

    /**
     * Get the value of an element
     * @param {HTMLElement} element
     * @returns {String} 
     */
    static getValue(element){
        return element.value;
    }

    /**
     * Get the value of the Template
     * @returns {String} 
     */
    getValue(){
        return Template.getValue(this);
    }

    /**
     * Set the value of an element
     * @param {HTMLElement} element
     * @param {String} 
     */
    static setValue(element, value){
        element.value = value;
    }

    /**
     * Set the value of the Template
     * @param {String} 
     */
    setValue(value){
        Template.setValue(this, value);
    }

    /**************************************************************************
     * Enable/Disabled
     *************************************************************************/

    /**
     * Set an element to enabled by setting the disabled state to false.
     * @param {HTMLElement} element 
     */
    static enable(element){
        element.disabled = false;
    }

    /**
     * Set the Template to enabled by setting the disabled state to false.
     */
    enable(){
        Template.enable(this);
    }

    /**
     * Set an element to enabled by setting the disabled state to true.
     * @param {HTMLElement} element 
     */
    static disable(element){
        element.disabled = true;
    }

    /**
     * Set the Template to enabled by setting the disabled state to true.
     */
    disable(){
        Template.disable(this);
    }

    /**************************************************************************
     * Rendering
     *************************************************************************/

    /**
     * Cache data as-is in case the original data is required.
     * @todo: handle array, map
     * @param {Object} data 
     * @returns {Array|Map|Object}
     */
    cacheData(data){
        return Object.extend({}, data);
    }

    /**
     * Process data to be used for rendering.
     * @param {Object} data 
     * @returns {Array|Map|Object}
     */
    processRenderData(data){
        return data;
    }

    /**
     * Set the inner HTML of an element
     * @param {HTMLElement} element - The element to set the HTML of
     * @param {String|HTMLElement} html - The HTML to set in the element
     */
    static setHtml(element, html){
        element.innerHTML = html;
    }

    /**
     * Set the inner HTML of the Template
     * @param {String|HTMLElement} html
     */
    setHtml(html){
        Template.setHtml(this, html);
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
     * child elements - to render. Otherwise, nothing happens.
     * @param {Object} data - the data to render with. This object should have 
     * keys that would match [name] or [data-name] element attributes.
     * @param {Boolean} [is_template=false] - whether the htmlElement is a
     * Template or not. If it is, renders using the elements already registered
     * within the Template object - for speed.
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
    static render(element, data, is_template = false){
        // If this is a Template, get the already registered child elements
        let elements = null;
        if(is_template){
            elements = element.getElements();
        }
        // Otherwise, find all child elements with name or data-name attributes
        else {
            elements = Template.findNamedElements(element);
        } 

        let _data = Object.flatten(data);
        for(let k in _data){
            let value = _data[k];
            let htmlElement = elements[k];

            // Did not find the element
            if(!htmlElement){
                // If its a template, can do a quick regather named elements
                if(is_template){
                    element.findNamedElements();
                    htmlElement = elements[k];
                }
                // Still did not find it, continue
                if(!htmlElement){
                    continue;
                }
            }
            
            // If the element has a render function, use that 
            if(htmlElement.render){
                htmlElement.render(value);
                continue;
            }

            // If only a single element was found, put it into an array
            if(!Array.isArray(htmlElement)){
                htmlElement = [htmlElement];
            }

            // Loop through all found elements and render them
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
                    else {
                        thisElement.value = value;
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
     * Render the Template. Cache and process the render data.
     * @param {Object} data 
     */
    render(data){
        this.cached_data = this.cacheData(data);
        this.render_data = this.processRenderData(Object.extend({}, data));
        Template.render(this, this.render_data, true);
        this.is_first_Render = false;
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