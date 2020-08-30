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
        this.attachButtonHandlers();
    }

    /**
     * Attach button handlers
     */
    attachButtonHandlers(){
        let self = this;
        this.elements.close.addEventListener('click', function(){
            self.hide();
        });
    }

    /**
     * Set the innerHTML to the default layout
     */
    createHtml(){
        this.innerHTML = `
            `.trim();
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
            let icon = Status.icon.none;
            if(newValue && newValue !== "" &&  typeof Status.bgclass[newValue] !== 'undefined'){
                clazz = Status.bgclass[newValue];
                icon = Status.icon[newValue];
            }
            this.setClass(clazz);
            this.setIcon(icon);
        }
        else if(name === "text"){
            this.setText(newValue);
        }
    }
    
    /**
     * Set the status attribute
     * @param {string} status 
     */
    setStatus(status){
        this.setAttribute('status', status);
    }

    /**
     * Remove all status- based classes
     */
    clearStatusClass(){
        this.classList.remove(...Status.bgclassArray);
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
        this.elements.text.textContent = text;
    }

    /**
     * Set the icon 
     * @param {string} text
     */
    setIcon(icon){
        this.elements.icon.innerHTML = icon;
    }

    /**
     * Render the FeedbackTemplate
     * @param {string} status 
     * @param {string} text 
     * @param {string} icon 
     */
    render(status, text, icon){
        this.setStatus(status);
        this.setText(text);
        this.setIcon(icon);
    }

    /**
     * Render an error feedback
     * @param {string} message 
     */
    renderError(message){
        this.render(Status.error, message, Status.icon[Status.error]);
    }

    /**
     * Render an info feedback
     * @param {string} message 
     */
    renderInfo(message){
        this.render(Status.info, message, Status.icon[Status.error]);
    }

    /**
     * Render a processing feedback
     * @param {string} message 
     */
    renderProcessing(message){
        this.render(Status.processing, message, Status.icon[Status.processing]);
    }

    /**
     * Render a success feedback
     * @param {string} message 
     */
    renderSuccess(message){
        this.render(Status.success, message, Status.icon[Status.success]);
    }

    /**
     * Render a warning feedback
     * @param {string} message 
     */
    renderWarning(message){
        this.render(Status.warning, message, Status.icon[Status.warning]);
    }
}
customElements.define('template-feedback', FeedbackTemplate);