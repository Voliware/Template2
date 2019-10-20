/**
 * Creates a random string of characters
 * @param {number} len - length of the string
 * @returns {string}
 */
String.random = function(len){
    var s = '';
    var randomchar = function() {
      var n = Math.floor(Math.random() * 62);
      if (n < 10) return n; //1-10
      if (n < 36) return String.fromCharCode(n + 55); //A-Z
      return String.fromCharCode(n + 61); //a-z
    }
    while (s.length < len) s += randomchar();
    return s;
}