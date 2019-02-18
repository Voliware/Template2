# Template2
Template2 is a tiny library for quickly rendering your HTML with one function, and for enhancing the Custom Elements system with a new class called Template.

## The Problem
HTML rendering has become increasingly complex in the recent years. Massive libraries and APIs can take months to learn and require high efforts for simple outcomes. Somehow, logic has found its way into HTML pages, and, almost comically, HTML has found its new home in Javascript files.

## The Solution
The Template library looks to bring HTML and web-based Javascript development back to its roots - before the renaissance of complexity began - somewhere around the days of jQuery. It does not, of course, do this on its own. Template takes advantage of one of the newest and most intriguing features of HTML5 - Custom Elements. 

### Custom Elements
[Custom Elements](https://tinyurl.com/y7vqn4df) let you define a - you guessed it - custom HTML element. There are plenty of custom elements that you already know of: `<form>`, `<table>`, `<input>`, and so on. All of these elements have more functionality built in than, let's say, the basic `<div>` element. The Custom Elements system can let you define a new HTML element such as `<user-element>`, which could provide some new methods to display user information. 

You can either write your element in HTML for immediate use

```html
<user-element id="user"><user-element>
```

Or dynmically add it later with 

```js
document.createElement('user-element');
````

You add functionality to a custom element in your Javascript code, like so

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

Then, at your desire, you can call your custom functions
```js
let user = document.getElementById('user');
User.getStatus()
   .then(function(data){
       user.setOnlineStatus(data.status);
});
```

This is the most natural way to add new functionality to HTML elements.

## The Template Class
Ok - so it looks like Custom Elements are pretty powerful. What, then, is the point of the Template class, the namesake of the library? Template is a class that extends the native HTMLElement class. HTMLElement is the basic class for all HTML elements - `<div>`, `<h1>`, `<button>`, etc. `HTMLElement` provides the functions and properties you already know: `style`, `remove()`, `addEventListener()`, and so on. Template then adds more functionality - some are just wrappers for style and DOM tree manipulation, such as `addClass()` and `appendTo()`, but it also adds a namespaced `EventySystem`, and a unique way to render the entire element.

### New Methods
Any custom element that extends Template, or a `<template-element>` that you add in your HTML, gains the following functions

- `on()`, `one()`, `off()`, and `emit()`
- `append()`, `appendTo()`, `prepend()`, `prependTo()`, and `empty()`
- `isVisible()`, `hide()`, `show()`, and `toggle()`
- `getStyle()`, `setHeight()` and `setWidth()`
- `addClass()`, `removeClass()`, `toggleClass()`, `hasClass()`, and `replaceClass()`
- `enable()` and `disable()`
- `render()`


### Create a Template Element

### Extend Template
