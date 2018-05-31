require('./../js/util.js');

class ElementWrapper {
    constructor(element){
        this.element = element === "string" ? document.getElementById(element) : element;
    }
    
    // tree

    appendTo(element){
        element.appendChild(this.element);
        return this;
    }

    appendChild(element){
        this.element.appendChild(element);
        return this;
    }
    
    empty(){
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        return this;
    }

    remove(){
        this.element.remove();
        return null;
    }

    // visibility

    hide(){
        this.element.style.display = "none";
        return this;
    }

    show(){
        this.element.style.display = "block";
        return this;
    }

    // class 

    addClass(clazz){
        this.element.classList.add(clazz);
        return this;
    }

    removeClass(clazz){
        this.element.classList.remove(clazz);
        return this;
    }

    toggleClass(clazz){
        this.element.classList.toggle(clazz);
        return this;
    }

    // dimensions

    setHeight(height){
        this.element.style.height = height + 'px';
        return this;
    }

    setWidth(width){
        this.element.style.width = width + 'px';
        return this;
    }

    // animations

    fadeIn(callback){
        this.element.classList.remove('animated', 'fadeOut');
        this.element.classList.add('animated', 'fadeIn');
        setTimeout(callback, 1000);
        return this;
    }

    fadeOut(callback){
        this.element.classList.remove('animated', 'fadeIn');
        this.element.classList.add('animated', 'fadeOut');
        setTimeout(callback, 1000);
        return this;
    }
}

class Template extends ElementWrapper {

    constructor(template, options = {}){    
        super(null);
        let defaults = {
            dom: {},
            useTemplate: true,
            removeTemplate: false,
            renderAttribute: 'data-name'
        };
        this.options = Object.extend(defaults, options);
        this.template = template ? this.parseTemplate(template) : this.useDefaultTemplate();
        this.dom = this.extractDom(this.template);
        this.element = this.dom.element;
        this.cachedData = {};
        this.renderData = {};
        return this;
    }

    useDefaultTemplate(){
        return null;
    }

    parseTemplate(template){
        let _template = null;

        if(typeof template === 'string'){
            _template = this.templateFromString(template);
        }
        else {
            if(this.options.useTemplate){
                _template = template;
            }
            else {
                _template = template.cloneNode(true);
            }
            if(this.options.removeTemplate){
                template.remove();
            }
        }

        return _template;
    }

    extractDom(template){
        let dom = {};
        if(this.options.dom){
            for(let k in this.options.dom){
                dom[k] = this.template.querySelector(this.options.dom[k]);
            }
        }
        dom.element = template;

        if(!this.options.useTemplate){
           dom.element.removeAttribute('id');
        }

        dom.element.classList.remove('template');
        
        return dom;
    }

    templateFromString(htmlString){
        let template = document.createElement('template');
        template.innerHTML = htmlString;
        return template.content.children[0];
    }

    cacheData(data){
        this.cachedData = Object.extend({}, data);
        return this;
    }

    processRenderData(data){
        this.renderData = data;
        return this;
    }

    render(data){
        this.cacheData(data);
        this.processRenderData(data);
        for(let k in this.renderData){
            let elements = null;

            // if 'class', render items with class names matching renderData
            if(this.options.renderAttribute === "class"){
                 elements = this.template.getElementsByClassName(k);
            }
            // otherwise use a custom attribute like [data-name="status"]
            else {
                let querySelector = `[${this.options.renderAttribute}="${k}"]`;
                elements = this.template.querySelectorAll(querySelector);
            }

            for(let i = 0; i < elements.length; i++){
                elements[i].innerHTML = this.renderData[k];
            }
        }
        return this;
    }
}

class TemplateManager extends ElementWrapper {
    constructor(element, template, options){
        if(!element){
            let template = document.createElement('template');
            template.innerHTML = '<div class="template-manager"></div>';
            element = template.content.children[0];
            document.getElementsByTagName('body')[0].appendChild(element);
        }

        super(element);
        let defaults = {
            maxTemplates: 0
        };
        this.options = Object.extend(defaults, options);

        /**
         * A Template class definition to 
         * create new templates from.
         * @type {Template}
         */
        this.template = template;

        /**
         * Templates will be an object of Templates, such as
         * { User1: UserRowTemplate,
         *   User2: UserRowTemplate.. }
         * Incoming data to render must be formatted as objects,
         * not as an array of objects. Example JSON:
         * { "User1": {"name":"bob", "age":23} }...
         * By maintaining the relationship between the object names,
         * render() can easily figure out which templates to create,
         * update, or destroy. If you get data as an array of objects,
         * you can use TemplateManager.toObjects() before you feed render().
         * @type {object}
         */
        this.templates = {};

        return this;
    }

    createTemplate(){
        return new this.template();
    }

    appendTemplate(template){
        this.appendChild(template.element);
        return this;
    }

    removeDeadTemplates(data){
        for(let k in this.templates){
            if(!data[k]){
                this.templates[k].remove();
                delete this.templates[k];
            }
        }
        return this;
    }

    render(data){
        for(let k in data){
            this.renderTemplate(k, data[k]);
        }
        this.removeDeadTemplates(data);
        return this;
    }

    renderTemplate(id, data){
        let isNew =  false;
        let template = this.templates[id];
        if(!template){
            isNew = true;
            template = this.createTemplate();
        }
        
        if(template){
            template.render(data);
            if(isNew){
                this.appendTemplate(template);
            }
        }

        return this;
    }
}

class TableRow extends Template {
    constructor(template, options){
        let defaults = {
            dom: {
                useTemplate: false,
                removeTemplate: true,
                element: 'tr'
            }
        };
        options = Object.extend(defaults, options);
        super(template, options);
        this.columnCount = this.dom.element.childElementCount;
        this.id = -1;
        return this;
    }

    getId(){
        return this.id;
    }

    setId(id){
        this.id = id;
        this.dom.element.setAttribute('data-rowid', id);
        return this;
    }

    removeId(){
        this.id = -1;
        this.dom.element.removeAttribute('data-rowid');
        return this;
    }

    addColumn(column){
        this.dom.element.appendChild(column);
        return this;
    }

    createColumn(){
        let column = document.createElement('td');
        return column;
    }
}

class Table extends Template {
    constructor(template, options){
        let defaults = {
            dom: {
                element: 'table',
                thead: 'thead',
                theadTr: 'thead > tr',
                tbody: 'tbody',
                tfoot: 'tfoot',
                tr: 'tbody > tr'
            }
        };
        options = Object.extend(defaults, options);
        super(template, options);
        this.rowManager = new TemplateManager(this.dom.tbody, TableRow.bind(null, this.dom.tr));
        return this;
    }

    render(data){
        this.rowManager.render(data);
        return this;
    }
}

class Form extends Template {

    constructor(template, options){
        let defaults = {
            getRequest: null,
            submitRequest: null,
            validateRequest: null,
			checkboxMode: Form.checkboxMode.number,
            serializeMode: Form.serializeMode.toObject,
            excludedFields: ['disabled'],
            useTemplate: true,
            dom: {
                element: 'form',
                submitButton: 'button[type="submit"]',
                resetButton: 'button[type="reset"]'
            }
        };
        options = Object.extend(defaults, options);
        super(template, options);
        this.serializedData = {};

        this.dom.element.addEventListener('submit', (event) => {
            event.preventDefault();
            this.submit();
        });
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
        
        let inputs = this.dom.element.getElementsByTagName('input');
        for (let i = 0; i < inputs.length; i++) {
            if(this.isNotExcluded(inputs[i])){
                this.serializeInput(inputs[i]);
            }
        }

        let selects = this.dom.element.getElementsByTagName('select');
        for (let i = 0; i < selects.length; i++) {
            if(this.isNotExcluded(selects[i])){
                this.serializeSelect(selects[i]);
            }
        }

        let textareas = this.dom.element.getElementsByTagName('textarea');
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
        let name = input.getAttribute('name');
        return this.serializedData[name] = input.value;
    }

    formatSerializedData(data){
		switch(this.options.serializeMode){
			case Form.serializeMode.toString:
				return this.serializedDataToString(this.serializedData);
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
        this.serializedData = this.serialize();
        let formattedSerializedData = this.formatSerializedData(this.serializedData);
        return this.options.submitRequest(this.serializedData);
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

class Popup extends Template {

    constructor(template, options){
        let defaults = {
            size: 'medium',
            showHeader: true,
            showCloseBtn: true,
            showFooter: false,
            dom: {
                element: '.popup',
                content: '.popup-content',
                header: '.popup-header',
                title: '.popup-title',
                closeBtn: '.popup-closeBtn',
                body: '.popup-body',
                footer: '.popup-footer'
            }
        }
        options = Object.extend(defaults, options);
        super(template, options);

        this.applyOptions(this.options);
        
        // handlers
        this.dom.closeBtn.addEventListener('click', (e) => {
            this.close();
        });

        return this;
    }

    useDefaultTemplate(){
        let template = 
        `<div class="popup">
            <div class="popup-content ${this.options.size}">
                <div class="popup-header">
                    <div class="popup-title"></div>
                    <button class="btn-none popup-closeBtn" type="button"><i class="icono-cross"></i></button>
                </div>
                <div class="popup-body"></div>
                <div class="popup-footer"></div>
            </div>
        </div>`;
        return this.parseTemplate(template);
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
        document.getElementsByTagName('body')[0].classList.add('popup-open');
        this.show().fadeIn();
        return this;
    }

    close(){
        document.getElementsByTagName('body')[0].classList.remove('popup-open');
        this.fadeOut();
        setTimeout( () => {
            this.hide();
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

class Feedback extends Template {

    constructor(template, options){
        let defaults = {
            dom: {
                element: '.feedback',
                icon: '.feedback-icon',
                message: '.feedback-msg',
                closeBtn: '.feedback-closeBtn'
            }
        }
        options = Object.extend(defaults, options);
        super(template, options);
        
        // handlers
        this.dom.closeBtn.addEventListener('click', (e) => {
            this.dom.element.remove();
        });

        return this;
    }

    useDefaultTemplate(){
        let template = 
        `<div class="feedback">
            <div class="feedback-icon"></div>
            <div class="feedback-msg"></div>
            <button class="btn-none feedback-closeBtn" type="button"><i class="icono-cross"></i></button>
        </div>`;
        return this.parseTemplate(template);
    }

    render(status, message, icon = ""){
        this.removeClass('status-bg-error', 'status-bg-warning', 'status-bg-success', 'status-bg-info', 'status-bg-info')
        this.dom.element.classList.add("status-bg-" + status);
        this.dom.message.innerHTML = message;
        this.dom.icon.innerHTML = icon;
        return this;
    }

    renderError(message){
        let icon = '<i class="status-error icono-crossCircle"></i>';
        return this.render('error', message, icon);;
    }

    renderInfo(message){
        let icon = '<i class="status-info icono-exclamationCircle"></i>';
        return this.render('info', message, icon);
    }

    renderProcessing(message){
        let icon = '<div class="status-info spinner-container"><div class="spinner-wheel"></div></div>';
        return this.render('processing', message, icon);
    }

    renderSuccess(message){
        let icon = '<i class="status-success icono-checkCircle"></i>';
        return this.render('success', message, icon);;
    }

    renderWarning(message){
        let icon = '<i class="status-warning icono-exclamation"></i>';
        return this.render('warning', message, icon);
    }
}

class StatusText extends Template {
    constructor(template, options){
        let defaults = {
            dom: {
                element: '.status-text'
            }
        }
        options = Object.extend(defaults, options);
        super(template, options);
        return this;
    }

    useDefaultTemplate(){
        let template = '<div class="status-text"></div>';
        return this.parseTemplate(template);
    }

    render(text, status){
        this.dom.element.classList.remove(StatusText.classArray);
        this.dom.element.classList.add(status);
        this.dom.element.innerHTML = text;
        return this;
    }
}
StatusText.class = {
    none: 'status-none',
    error: 'status-error',
    success: 'status-success',
    info: 'status-info',
    warning: 'status-warning'
};
StatusText.classArray = [
    StatusText.class.none,
    StatusText.class.error,
    StatusText.class.success,
    StatusText.class.info,
    StatusText.class.warning
];

module.exports = {
    Feedback,
    Form,
    Popup,
    StatusText,
    TableRow,
    Table,
    Template,
    TemplateManager
};