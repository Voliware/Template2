# Template2
Template2 is a tiny client-side library for rendering and manipulating HTML. It also provides support for forms, tables, and popups.

## The Problem
Rendering HTML has become complex. Heavy APIs are required to create basic web pages. Logic has found its way into HTML pages, and HTML has found itself in Javascript files. 

## The Solution
The Template library goes back to the roots of web development. Create HTML in your HTML files, and control the HTML in your Javascript files. Template is both a static and inheritable class that extends the native `HTMLElement`. It provides some basic DOM manipulation, such as `appendTo()` and `hide()`, and a `render()` function that updates the DOM from data. Template is desgined around using the HTML5 feature Custom Elements. If you already know native Javascript, you already know most of Template.

### Custom Elements
[Custom Elements](https://tinyurl.com/y7vqn4df) is a native HTML5 feature that lets you create a custom HTML element such as `<user-element>`. This lets you add functions and properties to the element and all instances of it. A `<form>` can be thought of as a custom element, because it has more features than a regular `<div>`. 

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
user.renderOnlineStatus("online");
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
There are three ways to make use of the Template library.
1. Creating a `<template-element>` element 
2. Using the static functions from the `Template` class
3. Creating your own custom element and extending the `Template` class

#### Create a Template Element
You can add a `<template-element>` to your HTML at any point. It will have all regular HTMLElement functions and properties, plus the above new methods. For example, suppose you wanted to create a counter element:

```html
<template-element id="counter">
    <div data-name="feedback"></div>
    <input data-name="count">
    <button id="countButton" type="button">Click!</button>
</template-element>
```

```js
// find the element
let counter = document.getElementById('counter');

// optionally find all child elements for easy access
counter.findElements({
   input: "input",
   button: "#countButton"
});

// add an event handler to the child input element
counter.on(counter.elements.input, 'input', function(){
   if(this.value > 5){
      counter.addClass("warning");
   }
});

// add an event handler to the button element
counter.on(counter.elements.button, 'click', function(){
   counter.elements.input.value++;
});

// render the element using the [data-name=""] attributes as the keys
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
