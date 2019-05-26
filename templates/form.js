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
     * @param {boolean} [options.useTemplate=true]
     * @param {object} [options.elements]
     * @param {string} [options.elements.form="form"]
     * @param {string} [options.elements.footer=".form-footer"]
     * @return {FormTemplate}
     */
    constructor(options = {}){
        let defaults = {
            getRequest: null,
            submitRequest: null,
            validateRequest: null,
			checkboxMode: FormTemplate.checkboxMode.number,
            serializeMode: FormTemplate.serializeMode.toObject,
            excludedFields: ['disabled'],
            useTemplate: true,
            elements: {
                form: 'form',
                footer: '.form-footer'
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
     * @return {FormTemplate}
     */
    attachFormHandlers(){
        let self = this;
        this.elements.form.addEventListener('submit', function(event){
            event.preventDefault();
            self.submit();
        });
        this.elements.form.addEventListener('reset', function(event){
            if(!Object.isEmpty(self.cachedData)){
                event.preventDefault();
                self.reload();
            }
        });
        return this;
    }

    displayFooter(state){
        Template.display(this.elements.footer, state);
        return this;
    }

    reload(){
        
    }

    validate(){

    }

    /**
     * Convert a checkbox into a boolean,
     * string, or number.
     * @param {HTMLElement} checkbox 
     * @param {number} mode 
     * @return {boolean|string|number}
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
     * @return {FormTemplate}
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
     * @return {object}
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
     * @return {object}
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
     * @return {object}
     */
    serializeTextarea(textarea){
        return this.serializeSelect(textarea);        
    }

    /**
     * Serialize a select
     * @param {HTMLElement} input 
     * @return {object}
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
     * @return {string|object}
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
     * @return {string}
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
     * @return {Promise}
     */
    submit(){
        let self = this;
        this.serializedData = this.serialize();
        this.formattedSerializedData = this.formatSerializedData(this.serializedData, this.options.serializeMode);
        return this.options.submitRequest(this.formattedSerializedData)
            .then(function(data){
                self.emit('success', data);
            })
            .catch(function(err){
                self.emit('fail', err);
            });
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