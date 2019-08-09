# Template2
Template2 is a tiny client-side library for rendering and manipulating HTML. The Template class is both extendable and statically available. It also provides a namespaced Event System.

The bundle includes several useful premade Templates for forms, tables, and more:
```js
<script src="https://cdn.jsdelivr.net/npm/@voliware/template2@1.0.2/dist/template2-bundle.min.js"></script>
````

Otherwise, the basic build contains just the Template class
```js
<script src="https://cdn.jsdelivr.net/npm/@voliware/template2@1.0.2/dist/template2.min.js"></script>
````

## The Problem
Generating and controlling HTML has become cumbersome. Simple web pages and applications are overburdened with complex APIs and massive libraries. Logic has found its way into HTML pages, and HTML has found itself in Javascript files. 

## The Solution
The Template library goes back to the roots of web development. Create HTML in your HTML files, and control the HTML in your Javascript files. Template is both a static and inheritable class that extends the native `HTMLElement`. It provides some basic DOM manipulation, such as `appendTo()`, `addClass()`, and `hide()`. It also features a simple `render()` function that updates HTML elements from an object of data. Template is desgined around using the HTML5 feature Custom Elements. Template's API is inspired by `jQuery`.

## Examples
There are three main ways to make use of the Template library.
1. Using the static functions from the `Template` class
2. Creating a `<template-element>` element 
3. Creating your own custom element and extending the `Template` class

### 1. Static Functions
As a simple demonstration, you can use either the static Template functions to control regular HTML elements:
```js
let popup = document.getElementById("popup");
Template.hide(popup);
```

### Render an Element
You can "render" any element in your HTML with the Template.render() function. Note that "render" means add inner HTML or set value attributes of any type of HTMLElement.

**HTML**
```html
<form id="userform">
    <input name="name" type="text">
    <select name="city">
        <option value="0">Toronto</option>
        <option value="1">Ottawa</option>
        <option value="2">Montreal</option>
    </select>
</form>
```

**Javascript**
```js
let data = {name: "Tester", city: 0};
let form = document.getElementById("userform");
Template.render(form, data);
```
render() can populate forms, fill up tables, or just set some inner html if the element is not an input type.

### 2. Create a Template Element
You can create a basic Template element that will have all of the Template features. You can actually wrap any HTML elements within a Template element to enhance it. 

**HTML**

Create an element in an HTML file that will display the name of a user, their current status, and allow them to logout.
```html
<template-element id="user">
    <div data-name="username"></div>
    <div data-name="status"></div>
    <button name="logout" type="button">Logout</button>
</template-element>
```

**Javascript**

Control the element in a Javascript file. Note how no "upgrading" or logical wrapping of the element needs to occur. Because it is a `<template-element>` it will already have all Template functions.
```js
// render the user element
let data = {username: "Billy", status: "Online"};
let user = document.getElementById("user");
user.render(data);

// attach handlers
user.elements.logout.on("click", function(){
   App.logout();
});
```

It's evident from the above example that Template uses a special attribute, `data-name`, to find elements to render. Template can also render elements with a `name` attribute - the only reason `data-name` is used is because `name` is not valid for most HTMLElements. Another apparent feature from above is Templates ability to provide all elements with `name` or `data-name` elements in a convenient `elements` property. As seen in the above example, the `<button>` is accessible via `user.elements.logout`. It registered this element because it had a `name` or `data-name` property. Note that you can register elements without these two attributes if you create a custom Template element.

*Advanced Note: Template does not waste time by "finding" each element on each render(). As soon as the element is connected to the DOM, all elements are found and cached. New elements are found via a Mutation Observer.*

### Extend the Template Class
Even more powerful is the ability to extend the Template class and create your own Custom Element.

## How Does it Work?
Template builds on the powerful HTML5 Custom Elements API.

### The Template Class
Template is a class that extends the native HTMLElement class. HTMLElement is the basic class for all HTML elements - `<div>`, `<h1>`, `<button>`, etc. `HTMLElement` provides the functions and properties you already know: `style`, `remove()`, `addEventListener()`, and so on. Template then adds more functionality - such as `addClass()` and `appendTo()`. It also adds a namespaced `EventSystem`, and a trivial way to render the entire element.

#### New Methods
Any custom element that extends Template, or any `<template-element>` element that you add in your HTML, gains the following functions

- `on()`, `one()`, `off()`, and `emit()`
- `append()`, `appendTo()`, `prepend()`, `prependTo()`, and `empty()`
- `isVisible()`, `hide()`, `show()`, and `toggle()`
- `getStyle()`, `setHeight()` and `setWidth()`
- `addClass()`, `removeClass()`, `toggleClass()`, `hasClass()`, and `replaceClass()`
- `enable()` and `disable()`
- `render()`

### Custom Elements
[Custom Elements](https://tinyurl.com/y7vqn4df) is a native HTML5 feature that lets you create a custom HTML element such as `<user-element>`. This lets you add functions and properties to the element and all instances of it. A `<form>` can be thought of as a custom element, because it has more functions than a regular `<div>`, such as `reset()` and `submit()`.

You add functionality to a custom element in your Javascript code by extending the `HTMLElement` (or any of its child classes) and then registering it with the `customElements` global object.

#### Quick Lesson

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

# Development
Install with

`npm install @voliware/template2`
