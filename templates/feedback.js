/**
 * Feedback Template
 * @extends {Template}
 */
class FeedbackTemplate extends Template {

    /**
     * Constructor
     * @param {Object} [params={}] 
     * @param {String} [params.elements.icon=".feedback-icon"]
     * @param {String} [params.elements.text=".feedback-text"]
     * @param {String} [params.elements.close=".feedback-close"]
     */
    constructor({
        elements = {
            icon: '.feedback-icon',
            text: '.feedback-text',
            close: '.feedback-close'
        }
    } = {})
    {
        super({elements});

        /**
         * The current status
         * @type {FeedbackTemplate.status}
         */
        this.status = FeedbackTemplate.status.none;
    }

    /**
     * Attach button handlers.
     */
    onConnected(){
        this.attachButtonHandlers();
    }

    /**
     * Create the inner html
     * @returns {String}
     */
    createHtml(){
        return `<div class="feedback-icon"></div>
                <div class="feedback-text"></div>
                <button class="feedback-close">X</button>`;
    }

    /**
     * Attach button handlers
     */
    attachButtonHandlers(){
        this.elements.close.addEventListener('click', () => {
            this.hide();
        });
    }
    
    /**
     * Set the status attribute
     * @param {String} status 
     */
    setStatus(status){
        if (typeof FeedbackTemplate.bgclass[status] !== 'undefined' && 
            typeof FeedbackTemplate.icon[status] !== 'undefined')
        {
            this.setClass(FeedbackTemplate.bgclass[status]);
            this.setIcon(FeedbackTemplate.icon[status]);
        }
    }

    /**
     * Remove all status- based classes
     */
    clearStatusClass(){
        this.classList.remove(...FeedbackTemplate.status.bgclassArray);
    }

    /**
     * Set the class
     * @param {String} clazz
     */
    setClass(clazz){
        this.clearStatusClass();
        this.classList.add(clazz);
    }

    /**
     * Set the text 
     * @param {String} text
     */
    setText(text){
        this.elements.text.textContent = text;
    }

    /**
     * Set the icon 
     * @param {String} text
     */
    setIcon(icon){
        this.elements.icon.innerHTML = icon;
    }

    /**
     * Render the FeedbackTemplate
     * @param {String} status 
     * @param {String} text 
     * @param {String} icon 
     */
    render(status, text, icon){
        this.setStatus(status);
        this.setText(text);
        this.setIcon(icon);
    }

    /**
     * Render an error feedback
     * @param {String} message 
     */
    renderError(message){
        this.render(
            FeedbackTemplate.status.error,
            message, 
            FeedbackTemplate.icon[FeedbackTemplate.status.error]
        );
    }

    /**
     * Render an info feedback
     * @param {String} message 
     */
    renderInfo(message){
        this.render(
            FeedbackTemplate.status.info, 
            message, 
            FeedbackTemplate.icon[FeedbackTemplate.status.error]
        );
    }

    /**
     * Render a processing feedback
     * @param {String} message 
     */
    renderProcessing(message){
        this.render(
            FeedbackTemplate.status.processing,
             message, 
            FeedbackTemplate.icon[FeedbackTemplate.status.processing]
        );
    }

    /**
     * Render a success feedback
     * @param {String} message 
     */
    renderSuccess(message){
        this.render(
            FeedbackTemplate.status.success, 
            message, 
            FeedbackTemplate.icon[FeedbackTemplate.status.success]
        );
    }

    /**
     * Render a warning feedback
     * @param {String} message 
     */
    renderWarning(message){
        this.render(
            FeedbackTemplate.status.warning, 
            message, 
            FeedbackTemplate.icon[FeedbackTemplate.status.warning]
        );
    }
}
FeedbackTemplate.status = {
    none: "none",
    error: "error",
    success: "success",
    processing: "processing",
    info: "info",
    warning: "warning"
};
FeedbackTemplate.bgclass = {};
FeedbackTemplate.bgclass[FeedbackTemplate.status.none] = "status-bg-none";
FeedbackTemplate.bgclass[FeedbackTemplate.status.error] = "status-bg-error";
FeedbackTemplate.bgclass[FeedbackTemplate.status.success] = "status-bg-success";
FeedbackTemplate.bgclass[FeedbackTemplate.status.processing] = "status-bg-processing";
FeedbackTemplate.bgclass[FeedbackTemplate.status.info] = "status-bg-info";
FeedbackTemplate.bgclass[FeedbackTemplate.status.warning] = "status-bg-warning";
FeedbackTemplate.status.bgclassArray = [
    FeedbackTemplate.bgclass.none,
    FeedbackTemplate.bgclass.error,
    FeedbackTemplate.bgclass.success,
    FeedbackTemplate.bgclass.processing,
    FeedbackTemplate.bgclass.info,
    FeedbackTemplate.bgclass.warning
];
FeedbackTemplate.icon = {};
FeedbackTemplate.icon[FeedbackTemplate.status.none] = "";
FeedbackTemplate.icon[FeedbackTemplate.status.error] = '';
FeedbackTemplate.icon[FeedbackTemplate.status.info] = '';
FeedbackTemplate.icon[FeedbackTemplate.status.processing] = 
    '<div class="spinner-container"><div class="spinner-wheel"></div></div>';
FeedbackTemplate.icon[FeedbackTemplate.status.success] = '';
FeedbackTemplate.icon[FeedbackTemplate.status.warning] = '';

customElements.define('template-feedback', FeedbackTemplate);