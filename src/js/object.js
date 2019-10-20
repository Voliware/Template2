/**
 * Set all properties of an object from
 * another object, if both objects have
 * matching properties.
 * @param {object} obj - the object to alter
 * @param {object} data - an object of data
 * @returns {object} the original object
 */
Object.setProperties = function(obj, data){
    for(let k in data){
        if(obj.hasOwnProperty(k)){
            obj[k] = data[k];
        }
    }
    return obj;
}

/**
 * Check if an object is empty
 * @param {object} obj - the object to check
 * @returns {boolean}
 */
Object.isEmpty = function(obj){
    return !Object.keys(obj).length;
}

/**
 * Extends an object into another
 * @returns {object}
 * @example
 * let o = Object.extend({}, {a:1}, {a:2, b:3});
 * console.log(o); // {a:2, b:3};
 */
Object.extend = function(){
    for(let i = 1; i < arguments.length; i++) {
        for(let key in arguments[i]) {
            if(arguments[i].hasOwnProperty(key)) { 
                if (typeof arguments[0][key] === 'object' && typeof arguments[i][key] === 'object') {
                    Object.extend(arguments[0][key], arguments[i][key]);
                }
                else {
                    arguments[0][key] = arguments[i][key];
                }
            }
        }
    }
    return arguments[0];	
}

/**
 * Flatten a nested object into a more simple object.
 * https://tinyurl.com/y6oe2ebq
 * @param {object} obj
 * @returns {object}
 * @example 
 * Object.flatten({a: {b: 1, c: 2}}); // {"a.b": 1, "a.c": 2}
 */
Object.flatten = function(obj){
    var toReturn = {};

    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if ((typeof obj[i]) == 'object' && obj[i] !== null) {
            var flatObject = Object.flatten(obj[i]);
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;
                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = obj[i];
        }
    }
    return toReturn;
}

/**
 * Unflatten an object into a nested object
 * https://tinyurl.com/y536fqrf
 * @param {object} obj
 * @returns {object}
 * @example
 * Object.unflatten({"a.b": 1, "a.c": 2}); // {a: {b: 1, c: 2}}
 */
Object.unflatten = function(obj){
    let result = {};
    for (let i in obj) {
        let keys = i.split('.');
        keys.reduce(function(r, e, j) {
            return r[e] || (r[e] = isNaN(Number(keys[j + 1])) ? (keys.length - 1 == j ? obj[i] : {}) : []);
        }, result);
    }
    return result;
};