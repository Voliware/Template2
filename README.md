# Template2
Template2 is a tiny client-side library for rendering HTML and providing DOM manipulation functions.

## The Problem
The simple task of rendering HTML has become overly complex. APIs must be studied and new systems must be learned. Logic has found its way into HTML pages, and HTML has found itself in Javascript files. 

## The Solution
The Template library brings client-side web development forwards by enhancing the native HTMLElement. It provides some basic DOM manipulation and a `render()` function that updates the DOM from data. Template is desgined around using the HTML5 feature Custom Elements. 

### Custom Elements
[Custom Elements](https://tinyurl.com/y7vqn4df) let you define a custom HTML element. This lets you add functions and properties to a custom  HTMLElement. A `<form>` can be thought of as a custom element. The Custom Elements system can let you define any new HTML element such as `<user-element>`, which could provide some new methods to display user information. 

You add functionality to a custom element in your Javascript code by extending the `HTMLElement` (or any of its child classes) and then registering it with the `customElements` global object.

```js
class UserElement extends HTMLElement {
    // set the background color according to online status
    renderOnlineStatus(status){
        let bgColor = status === "online" ? "green" : "red";
        this.style.backgroundColor = bgColor;
    }
}
// register the new element with the customElements sysytem
customElements.define('user-element', UserElement);
```

You can either write your element in HTML for immediate use

```html
<user-element id="user"><user-element>
```

Or dynmically add it later with 

```js
document.createElement('user-element');
````

Then you can call your custom functions

```js
let user = document.getElementById('user');
App.getUserStatus()
   .then(function(data){
       user.renderOnlineStatus(data.status);
   });
```

This is the most natural way to add new functionality to HTML elements.

## The Template Class
Template is a class that extends the native HTMLElement class. HTMLElement is the basic class for all HTML elements - `<div>`, `<h1>`, `<button>`, etc. `HTMLElement` provides the functions and properties you already know: `style`, `remove()`, `addEventListener()`, and so on. Template then adds more functionality - such as `addClass()` and `appendTo()`. It also adds a namespaced `EventSystem`, and a trivial way to render the entire element.

### New Methods
Any custom element that extends Template, or any `<template-element>` element that you add in your HTML, gains the following functions

- `on()`, `one()`, `off()`, and `emit()`
- `append()`, `appendTo()`, `prepend()`, `prependTo()`, and `empty()`
- `isVisible()`, `hide()`, `show()`, and `toggle()`
- `getStyle()`, `setHeight()` and `setWidth()`
- `addClass()`, `removeClass()`, `toggleClass()`, `hasClass()`, and `replaceClass()`
- `enable()` and `disable()`
- `render()`

### How to Use It
#### Create a Template Element
You can add a `<template-element>` to your HTML at any point. It will have all regular HTMLElement functions and properties, plus the above new methods. For example

```html
<template-element id="counter">
    <div data-name="feedback"></div>
    <input data-name="count">
    <button id="countButton" type="button">Click!</button>
</template-element>
```

```js
// a counter that warns you if it goes past 5
let counter = document.getElementById('counter');
counter.findElements({
   input: "input",
   button: "#countButton"
});

// add an event handler to the input element
counter.on(counter.elements.input, 'input', function(){
   if(this.value > 5){
      counter.addClass("warning");
   }
});

// add an event handler to the button element
counter.on(counter.elements.button, 'click', function(){
   counter.elements.input.value++;
});

// set the input to 0 and set some feedback
counter.render({count:0, feedback: "Don't increment past 5!"});
```

#### Use Static Methods
All of the above methods are available statically from the `Template` class. Every method takes any HTMLElement, meaning all Template functions work on plain old HTMLElements. No wrapping or upgrading required.

```js
// get the basic <form> element from the HTML page
let myForm = document.getElementById("myForm"); 
// hide and disable the form
Template.hide(myForm);
Template.disable(myForm);
```

#### Extend Template
If you need your own custom element, you can extend the Template class to inherit all of the above methods.
