/**
 * Form Template
 * @extends {Template}
 */
class FormTemplate extends Template {

    /**
     * Constructor
     * @param {object} [options] 
     * @param {function} [options.getRequest]
     * @param {function} [options.submitRequest]
     * @param {function} [options.validateRequest]
     * @param {number} [options.checkboxMode]
     * @param {number} [options.serializeMode]
     * @param {string[]} [options.excludedFields=["disabled"]]
     * @param {object} [options.elements]
     * @param {string} [options.elements.form="form"]
     * @param {string} [options.elements.footer=".form-footer"]
     * @returns {FormTemplate}
     */
    constructor(options = {}){
        let defaults = {
            getRequest: null,
            submitRequest: null,
            validateRequest: null,
			checkboxMode: FormTemplate.checkboxMode.number,
            serializeMode: FormTemplate.serializeMode.toObject,
            excludedFields: ['disabled'],
            elements: {
                form: 'form',
                footer: '.form-footer',
                reset: '[type="reset"]',
                submit: '[type="submit"]'
            }
        };
        super(Object.extend(defaults, options));
        this.serializedData = {};
        this.formattedSerializedData = null;
        return this;
    }

    /**
     * Connected callback
     */
    connectedCallback(){
        super.connectedCallback();
        this.attachFormHandlers();
    }

    /**
     * Attach handlers to the default form events.
     * @returns {FormTemplate}
     */
    attachFormHandlers(){
        let self = this;
        this.elements.form.addEventListener('submit', function(event){
            event.preventDefault();
            self.submit();
        });
        this.elements.form.addEventListener('reset', function(event){
            event.preventDefault();
            self.reload();
        });
        return this;
    }

    /**
     * Toggle the display of the footer.
     * @param {boolean} state
     * @returns {FormTemplate}
     */
    displayFooter(state){
        Template.display(this.elements.footer, state);
        return this;
    }

    /**
     * Reload the form.
     * @returns {FormTemplate}
     */
    reload(){
        console.log(this.cachedData)
        if(!Object.isEmpty(this.cachedData)){
            this.render(this.cachedData);
        }
        else {
            this.reset();
        }
        return this;
    }

    /**
     * Validate the form.
     * @returns {boolean}
     */
    validate(){
        return true;
    }

    /**
     * Convert a checkbox into a boolean, string, or number.
     * @param {HTMLElement} checkbox 
     * @param {number} mode 
     * @returns {boolean|string|number}
     */
    convertCheckbox(checkbox, mode){
		let checked = checkbox.checked
		switch(mode){
			case FormTemplate.checkboxMode.boolean:
                return checked;
			case FormTemplate.checkboxMode.string:
				return checked ? '1' : '0';
			case FormTemplate.checkboxMode.onOff:
				return checked ? 'on' : 'off';
            default:
            case FormTemplate.checkboxMode.number:
                return checked ? 1 : 0;
		}
    }
    
    /**
     * Determine if a field is not excluded
     * @param {string} field 
     * @returns {FormTemplate}
     */
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

    /**
     * Serialize the form 
     * @returns {object}
     */
    serialize(){
        this.serializedData = {};
        
        let inputs = Array.from(this.getElementsByTagName('input'));
        let selects = Array.from(this.getElementsByTagName('select'));
        let textareas = Array.from(this.getElementsByTagName('textarea'));
        let all = inputs.concat(selects, textareas);
        for (let i = 0; i < all.length; i++) {
            if(this.isNotExcluded(all[i])){
                this.serializeInput(all[i]);
            }
        }

        return this.serializedData;
    }

    /**
     * Serialize an input
     * @param {HTMLElement} input 
     * @returns {object}
     */
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
                // need to return here to prevent
                // empty radios from setting data
                else {
                    return null;
                }
                break;
            case 'file':
                if (input.files.length > 0) {
                    val = input.files[0];
                }
                break;
            case 'number':
                val = Number(input.value);
                break;
            default:
                val = input.value;
                break;
        }

        return this.serializedData[name] = val;
    }

    /**
     * Serialize a textarea
     * @param {HTMLElement} input 
     * @returns {object}
     */
    serializeTextarea(textarea){
        return this.serializeSelect(textarea);        
    }

    /**
     * Serialize a select
     * @param {HTMLElement} input 
     * @returns {object}
     */
    serializeSelect(select){
        let name = select.getAttribute('name');
        return this.serializedData[name] = select.value;
    }

    /**
     * Format the already serialized data
     * into a string or an object
     * @param {object} data 
     * @param {number} mode
     * @returns {string|object}
     */
    formatSerializedData(data, mode){
		switch(mode){
			case FormTemplate.serializeMode.toString:
				return this.serializedDataToString(data);
            default:
            case FormTemplate.serializeMode.toObject:
                this.serializedData = Object.unflatten(this.serializedData);
                return this.serializedData;
		}
    }

    /**
     * Serialize data into a string
     * @param {object} data 
     * @returns {string}
     */
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

    /**
     * Submit the form.
     * Serialize data and pass the data
     * to the submitRequest function.
     * @returns {Promise}
     */
    async submit(){
        this.serializedData = this.serialize();
        this.formattedSerializedData = this.formatSerializedData(this.serializedData, this.options.serializeMode);
        try {
            let response = await this.options.submitRequest(this.formattedSerializedData)
            if(response.status === 200){
                this.emit('success', response.body);
            }
            else {
                this.emit('fail', response.body);
            }
        }
        catch(error){
            this.emit('error', error);
        }
    }
}
FormTemplate.checkboxMode = {
	boolean : 0,
	number : 1,
	string : 2,
	onOff : 3
};
FormTemplate.serializeMode = {
	toString : 0,
	toOrderedString : 1,
	toObject : 2,
	toValue : 3
};
customElements.define('template-form', FormTemplate);