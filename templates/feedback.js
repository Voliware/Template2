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
     * @returns {FeedbackTemplate}
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
     * @returns {FeedbackTemplate}
     */
    attachButtonHandlers(){
        let self = this;
        this.elements.close.addEventListener('click', function(){
            self.hide();
        });
        return this;
    }

    /**
     * Set the innerHTML to the default layout
     * @returns {FeedbackTemplate}
     */
    createHtml(){
        this.innerHTML = `
            `.trim();
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
     * @returns {FeedbackTemplate}
     */
    setStatus(status){
        this.setAttribute('status', status);
        return this;
    }

    /**
     * Remove all status- based classes
     * @returns {FeedbackTemplate}     
     */
    clearStatusClass(){
        this.classList.remove(...Status.bgclassArray);
        return this;
    }

    /**
     * Set the class
     * @param {string} clazz
     * @returns {FeedbackTemplate}
     */
    setClass(clazz){
        this.clearStatusClass();
        this.classList.add(clazz);
        return this;
    }

    /**
     * Set the text 
     * @param {string} text
     * @returns {FeedbackTemplate}     
     */
    setText(text){
        this.elements.text.textContent = text;
        return this;
    }

    /**
     * Set the icon 
     * @param {string} text
     * @returns {FeedbackTemplate}     
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
     * @returns {FeedbackTemplate}
     */
    render(status, text, icon){
        return this.setStatus(status).setText(text).setIcon(icon);
    }

    /**
     * Render an error feedback
     * @param {string} message 
     * @returns {FeedbackTemplate}
     */
    renderError(message){
        return this.render(Status.error, message, Status.icon[Status.error]);
    }

    /**
     * Render an info feedback
     * @param {string} message 
     * @returns {FeedbackTemplate}
     */
    renderInfo(message){
        return this.render(Status.info, message, Status.icon[Status.error]);
    }

    /**
     * Render a processing feedback
     * @param {string} message 
     * @returns {FeedbackTemplate}
     */
    renderProcessing(message){
        return this.render(Status.processing, message, Status.icon[Status.processing]);
    }

    /**
     * Render a success feedback
     * @param {string} message 
     * @returns {FeedbackTemplate}
     */
    renderSuccess(message){
        return this.render(Status.success, message, Status.icon[Status.success]);
    }

    /**
     * Render a warning feedback
     * @param {string} message 
     * @returns {FeedbackTemplate}
     */
    renderWarning(message){
        return this.render(Status.warning, message, Status.icon[Status.warning]);
    }
}
customElements.define('template-feedback', FeedbackTemplate);