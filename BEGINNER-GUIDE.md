# UniFit Beginner Guide

Welcome to the UniFit school uniform shop project.

This guide explains the project structure in simple steps. Keep it open while reading the code in VS Code.

## 1. What This Project Is

UniFit is a school uniform shopping website.

It is currently a **static website**. That means:

- HTML creates the page structure and text.
- CSS controls colors, spacing, layout, and responsiveness.
- JavaScript controls behavior and interaction.
- Images provide the product and brand visuals.
- There is currently no database or server.

The homepage is the most complete page. The other pages are prepared as filenames, but most of them do not contain page content yet.

## 2. Project Structure

```text
UNIFIT/
|
|-- index.html
|-- products.html
|-- product-details.html
|-- cart.html
|-- checkout.html
|-- login.html
|-- register.html
|-- my-orders.html
|-- events.html
|-- size-guide.html
|-- uniform-sets.html
|
|-- assets/
|   |-- images/
|
|-- css/
|   |-- style.css
|
|-- js/
    |-- app.js
```

### HTML files

Each HTML file is intended to be one page:

- `index.html` - homepage
- `products.html` - product listing
- `product-details.html` - individual product information
- `cart.html` - shopping cart
- `checkout.html` - checkout form
- `login.html` - login page
- `register.html` - registration page
- `my-orders.html` - previous orders
- `events.html` - Sportsfest products or information
- `size-guide.html` - uniform measurements
- `uniform-sets.html` - complete uniform sets

### CSS folder

`css/style.css` contains the shared visual design for the website. It includes:

- Colors
- Fonts
- Navigation styles
- Hero section styles
- Buttons
- Product cards
- Category cards
- Footer styles
- Tablet and mobile layouts

### JavaScript folder

`js/app.js` is the JavaScript file loaded by the homepage. It is currently empty.

It will eventually contain features such as:

- Opening and closing the mobile menu
- Adding products to the cart
- Updating the cart count
- Filtering products
- Validating forms
- Saving cart data

### Assets folder

`assets/images/` contains images used in the site, including the UniFit logo and product images.

## 3. The Three Main Web Technologies

Think of a webpage like a building:

```text
HTML       = the structure of the building
CSS        = the paint, furniture, and arrangement
JavaScript = the switches, doors, and moving parts
```

Example HTML:

```html
<h1>Welcome to UniFit</h1>
```

Example CSS:

```css
h1 {
    color: brown;
}
```

Example JavaScript:

```javascript
alert("Welcome to UniFit");
```

## 4. How The Browser Loads `index.html`

When you open `index.html`, the browser follows these steps:

### Step 1: Read the document type

```html
<!DOCTYPE html>
```

This tells the browser that the page uses modern HTML5.

### Step 2: Read the page information

Inside `<head>` are settings that are not directly visible on the page:

```html
<meta charset="UTF-8">
```

This allows normal text and symbols to display correctly.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

This helps the page fit phones and tablets.

```html
<title>UniFit | Your School Essentials, One Click Away</title>
```

This controls the browser tab title.

```html
<link rel="stylesheet" href="css/style.css">
```

This loads the CSS file. The path means:

1. Start in the same folder as `index.html`.
2. Open the `css` folder.
3. Load `style.css`.

### Step 3: Display the body

Everything inside `<body>` is visible on the webpage.

The homepage is divided into:

```html
<header>...</header>
<main>...</main>
<footer>...</footer>
```

These are semantic elements. They describe the purpose of each part of the page.

## 5. The Header And Navigation

The header begins like this:

```html
<header class="site-header">
```

`header` is the HTML element. `site-header` is a class name used by CSS.

The matching CSS selector is:

```css
.site-header {
    ...
}
```

A CSS class selector starts with a period (`.`).

A navigation link looks like this:

```html
<a href="products.html">Products</a>
```

When the user clicks it, the browser opens `products.html`.

The `href` attribute means "where should this link go?"

## 6. The Hero Section

The hero is the large first section of the homepage:

```html
<section class="hero">
```

It contains:

- The UniFit logo
- The main heading
- A description
- A Shop Now button
- A View Featured button

The Shop Now button is actually a link styled to look like a button:

```html
<a href="products.html" class="btn primary-btn">
    Shop Now
</a>
```

It has two classes:

- `btn` provides common button styling.
- `primary-btn` provides the gold primary-button design.

## 7. Featured Products

Products are placed inside:

```html
<div class="product-grid">
```

Each product uses an article:

```html
<article class="product-card">
```

An individual product contains:

```html
<img>
<h3>Product name</h3>
<p class="price">Product price</p>
<p class="sizes">Available sizes</p>
```

The CSS creates a responsive grid:

```css
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
```

This allows the browser to show several columns on a large screen and fewer columns on a small screen.

## 8. Images And File Paths

An image is loaded like this:

```html
<img src="assets/images/pe-top-yellow-white.png"
     alt="PE Uniform">
```

The `src` attribute tells the browser where the image is.

The `alt` attribute describes the image. It helps screen readers and appears if the image cannot load.

The path means:

1. Start beside `index.html`.
2. Open `assets`.
3. Open `images`.
4. Load the image file.

File names must match exactly, including spaces, dashes, and capital letters.

## 9. CSS Variables

At the top of `style.css`, the project defines reusable colors:

```css
:root {
    --dark-brown: #3e2723;
    --cream: #fffdf8;
    --gold: #c49a6c;
}
```

The colors are used later like this:

```css
color: var(--gold);
```

This is useful because changing one variable can update the design in many places.

## 10. Responsive Design

The CSS uses media queries:

```css
@media (max-width: 700px) {
    ...
}
```

These rules apply when the browser width is 700 pixels or less.

On mobile:

- The full navigation is hidden.
- The menu button is shown.
- The hero changes from two columns to one column.
- Feature cards become one column.
- Footer content becomes vertical.

The navigation is expected to appear when it has the `show` class:

```css
.nav-links.show {
    display: flex;
}
```

However, `app.js` is empty, so no JavaScript currently adds the `show` class. The mobile menu is not functional yet.

## 11. IDs And Query Parameters

This section has an ID:

```html
<section id="featured" class="section">
```

This link jumps to that section:

```html
<a href="#featured">View Featured</a>
```

The `#featured` part means "find the element with the ID `featured`."

Category links use a query parameter:

```html
<a href="products.html?category=School%20Uniform">
```

This sends the category name in the URL. `%20` represents a space.

The future products page could read it with JavaScript:

```javascript
const params = new URLSearchParams(window.location.search);
const category = params.get("category");
```

## 12. What Works And What Is Not Finished

Currently working:

- Homepage layout
- Homepage navigation links as HTML links
- Product images
- Product cards
- Category links as URLs
- Desktop styling
- CSS mobile layout rules
- Footer

Not implemented yet:

- Product listing page content
- Product details page content
- Add-to-cart behavior
- Cart storage
- Checkout behavior
- Login and registration behavior
- Order history
- Admin page
- Mobile menu JavaScript
- Product filtering
- Database or backend

Most linked pages are currently empty, so clicking them may open a blank page. `admin.html` is linked in the navigation but does not currently exist in the project folder.

## 13. Recommended Learning Order

Study the project in this order:

1. Read the basic structure of `index.html`.
2. Find an HTML class such as `product-card`.
3. Search for `.product-card` in `style.css`.
4. Change one CSS property and refresh the browser.
5. Study Flexbox in `.navbar` and `.hero-content`.
6. Study CSS Grid in `.product-grid` and `.feature-grid`.
7. Study the mobile rules inside `@media`.
8. Add the mobile menu behavior in `app.js`.
9. Build the content for `products.html`.
10. Add product data and cart behavior.

## 14. A Simple Debugging Checklist

When something does not work, check:

1. Is the file name spelled correctly?
2. Is the folder path correct?
3. Does the HTML class match the CSS class?
4. Did you save the file and refresh the browser?
5. Is the browser console showing an error?
6. Is the linked HTML file empty or missing?
7. Is JavaScript actually loaded with a `<script>` tag?

## 15. Main Idea To Remember

```text
HTML       = structure and content
CSS        = appearance and layout
JavaScript = behavior and interaction
Images     = visual assets
```

UniFit currently has a good HTML and CSS foundation. The next major step is adding page content and JavaScript behavior so it becomes a functioning online shop.