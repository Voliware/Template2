/**
 * StatusText Template
 * @extends {Template}
 */
class StatusTemplate extends Template {

    /**
     * Which elements attributes will be observed.
     * If the values of these attributes change,
     * this is handled in attributeChangedCallback.
     * @type {string[]}
     */
    static get observedAttributes() {return ['status', 'text']; }

    /**
     * Constructor
     * @param {object} [options={}]
     * @returns {StatusTemplate}
     */
    constructor(options){
        super(options);
        return this;
    }
    
    /**
     * Adds a "status" and "text" attribute
     * to the element if they do not exist.
     * @returns {StatusTemplate}
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
     * @returns {FeedbackTemplate}
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
     * @returns {StatusTemplate}
     */
    setStatus(status){
        this.setAttribute('status', status);
        return this;
    }

    /**
     * Remove all status- classes
     * @returns {StatusTemplate}
     */
    clearStatusClass(){
        this.classList.remove(...Status.classArray);
        return this;
    }

    /**
     * Set the class
     * @param {string} clazz 
     * @returns {StatusTemplate}
     */
    setClass(clazz){
        this.clearStatusClass();
        this.classList.add(clazz);
        return this;
    }

    /**
     * Set the text
     * @param {string} text 
     * @returns {StatusTemplate}
     */
    setText(text){
        this.textContent = text;
        return this;
    }

    /**
     * Render the StatusTemplate
     * @param {string} status 
     * @param {string} text 
     * @returns {StatusTemplate}
     */
    render(status, text){
        return this.setStatus(status).setText(text);
    }

    /**
     * Render the StatusTemplate with no status
     * @param {string} text 
     * @returns {StatusTemplate}
     */
    renderNone(text){
        return this.render(Status.none, text);
    }

    /**
     * Render the StatusTemplate with error status
     * @param {string} text 
     * @returns {StatusTemplate}
     */
    renderError(text){
        return this.render(Status.error, text);
    }

    /**
     * Render the StatusTemplate with success status
     * @param {string} text 
     * @returns {StatusTemplate}
     */
    renderSuccess(text){
        return this.render(Status.success, text);
    }

    /**
     * Render the StatusTemplate with info status
     * @param {string} text 
     * @returns {StatusTemplate}
     */
    renderInfo(text){
        return this.render(Status.info, text);
    }

    /**
     * Render the StatusTemplate with warning status
     * @param {string} text 
     * @returns {StatusTemplate}
     */
    renderWarning(text){
        return this.render(Status.warning, text);
    }
}
customElements.define('template-status', StatusTemplate);