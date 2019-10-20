/**
 * Popup Template
 * @extends {Template}
 */
class PopupTemplate extends Template {

    /**
     * Constructor
     * @param {object} options 
     * @param {boolean} [options.showHeader=true]
     * @param {boolean} [options.showClose=true]
     * @param {boolean} [options.showFooter=true]
     * @param {object} [options.elements]
     * @param {string} [options.elements.header=".popup-header"]
     * @param {string} [options.elements.title=".popup-title"]
     * @param {string} [options.elements.close=".template-popupcloseBtn"]
     * @param {string} [options.elements.body=".popup-body"]
     * @param {string} [options.elements.footer=".popup-footer"]
     * @returns {PopupTemplate}
     */
    constructor(options = {}){
        let defaults = {
            displayBlock: false,
            showHeader: true,
            showClose: true,
            showFooter: true,
            elements: {
                header: '.popup-header',
                title: '.popup-title',
                close: '.popup-close',
                body: '.popup-body',
                footer: '.popup-footer'
            }
        }
        super(Object.extend(defaults, options));
        return this;
    }

    /**
     * Connected callback
     */
    connectedCallback(){
        super.connectedCallback();
        this.applyOptions(this.options);
        this.attachButtonHandlers();
    }

    /**
     * Attach button handlers
     * @returns {PopupTemplate}
     */
    attachButtonHandlers(){
        let self = this;
        this.elements.close.addEventListener('click', function(e){
            self.close();
        });
        return this;
    }

    /**
     * Apply options to the PopupTemplate
     * @param {object} options 
     * @returns {PopupTemplate}
     */
    applyOptions(options){
        if(!options.showHeader && this.elements.header){
            this.elements.header.remove();
        }
        if(!options.showClose && this.elements.close){
            this.elements.close.remove();
        }
        if(!options.showFooter && this.elements.footer){
            this.elements.footer.remove();
        }
        return this;
    }

    /**
     * Open the popup by adding the 'popup-open' class.
     * Fade in the PopupTemplate.
     * @returns {PopupTemplate}
     */
    open(){
        document.body.classList.add('popup-open');
        this.show();
        return this;
    }

    /**
     * Close the popup by removing the 'popup-open' class
     * Fadeout in the PopupTemplate.
     * @returns {PopupTemplate}
     */
    close(){
        document.body.classList.remove('popup-open');
        this.hide();
        return this;
    }

    /**
     * Render the title
     * @param {string} html 
     * @returns {PopupTemplate}
     */
    renderTitle(html){
        this.elements.title.innerHTML = html;
        return this;
    }

    /**
     * Render the body
     * @param {string} html 
     * @returns {PopupTemplate}
     */
    renderBody(html){
        this.elements.body.innerHTML = html;
        return this;
    }

    /**
     * Render the footer
     * @param {string} html 
     * @returns {PopupTemplate}
     */
    renderFooter(html){
        this.elements.footer.innerHTML = html;
        return this;
    }
}
customElements.define('template-popup', PopupTemplate);