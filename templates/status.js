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
    static get observedAttributes() {['status', 'text']; }

    /**
     * Constructor
     * @param {object} [options={}]
     */
    constructor(options){
        super(options);
        if(!this.hasAttribute('status')){
            this.setAttribute('status', Status.none);
        }
        if(!this.hasAttribute('text')){
            this.setAttribute('text', '');
        }
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
     */
    setStatus(status){
        this.setAttribute('status', status);
    }

    /**
     * Remove all status- classes
     */
    clearStatusClass(){
        this.classList.remove(...Status.classArray);
    }

    /**
     * Set the class
     * @param {string} clazz 
     */
    setClass(clazz){
        this.clearStatusClass();
        this.classList.add(clazz);
    }

    /**
     * Set the text
     * @param {string} text 
     */
    setText(text){
        this.textContent = text;
    }

    /**
     * Render the StatusTemplate
     * @param {string} status 
     * @param {string} text 
     */
    render(status, text){
        this.setStatus(status);
        this.setText(text);
    }

    /**
     * Render the StatusTemplate with no status
     * @param {string} text 
     */
    renderNone(text){
        this.render(Status.none, text);
    }

    /**
     * Render the StatusTemplate with error status
     * @param {string} text 
     */
    renderError(text){
        this.render(Status.error, text);
    }

    /**
     * Render the StatusTemplate with success status
     * @param {string} text 
     */
    renderSuccess(text){
        this.render(Status.success, text);
    }

    /**
     * Render the StatusTemplate with info status
     * @param {string} text 
     */
    renderInfo(text){
        this.render(Status.info, text);
    }

    /**
     * Render the StatusTemplate with warning status
     * @param {string} text 
     */
    renderWarning(text){
        this.render(Status.warning, text);
    }
}
customElements.define('template-status', StatusTemplate);