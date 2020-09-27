/**
 * StatusText Template
 * @extends {Template}
 */
class StatusTemplate extends Template {

    /**
     * Constructor
     */
    constructor(){
        super(...arguments);

        /**
         * The current status
         * @type {StatusTemplate.status}
         */
        this.status = StatusTemplate.status.none;
    }

    /**
     * Set the status
     * @param {String} status 
     */
    setStatus(status){
        if(typeof StatusTemplate.class[status] !== 'undefined'){
            this.status = status;
            this.setClass(StatusTemplate.class[status]);
        }
    }

    /**
     * Remove all status- classes
     */
    clearStatusClass(){
        this.classList.remove(...StatusTemplate.classArray);
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
        this.textContent = text;
    }

    /**
     * Render the StatusTemplate
     * @param {String} status 
     * @param {String} text 
     */
    render(status, text){
        this.setStatus(status);
        this.setText(text);
    }

    /**
     * Render the StatusTemplate with no status
     * @param {String} text 
     */
    renderNone(text){
        this.render(StatusTemplate.status.none, text);
    }

    /**
     * Render the StatusTemplate with error status
     * @param {String} text 
     */
    renderError(text){
        this.render(StatusTemplate.status.error, text);
    }

    /**
     * Render the StatusTemplate with success status
     * @param {String} text 
     */
    renderSuccess(text){
        this.render(StatusTemplate.status.success, text);
    }

    /**
     * Render the StatusTemplate with info status
     * @param {String} text 
     */
    renderInfo(text){
        this.render(StatusTemplate.status.info, text);
    }

    /**
     * Render the StatusTemplate with warning status
     * @param {String} text 
     */
    renderWarning(text){
        this.render(StatusTemplate.status.warning, text);
    }
}

StatusTemplate.status = {
    none: "none",
    error: "error",
    success: "success",
    processing: "processing",
    info: "info",
    warning: "warning"
};
StatusTemplate.class = {};
StatusTemplate.class[StatusTemplate.status.none] = "status-none";
StatusTemplate.class[StatusTemplate.status.error] = "status-error";
StatusTemplate.class[StatusTemplate.status.success] = "status-success";
StatusTemplate.class[StatusTemplate.status.processing] = "status-processing";
StatusTemplate.class[StatusTemplate.status.info] = "status-info";
StatusTemplate.class[StatusTemplate.status.warning] = "status-warning";
StatusTemplate.classArray = [
    StatusTemplate.class.none,
    StatusTemplate.class.error,
    StatusTemplate.class.success,
    StatusTemplate.class.processing,
    StatusTemplate.class.info,
    StatusTemplate.class.warning
];

customElements.define('template-status', StatusTemplate);