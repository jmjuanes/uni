# UniCSS

A universal CSS-In-JS microlibrary (less than 300 lines of code!) for styling your UI components.

[![NPM Version](https://badgen.net/npm/v/unicss)](https://npm.im/unicss)
[![MIT License](https://badgen.net/github/license/jmjuanes/unicss)](https://github.com/jmjuanes/unicss)
[![PRs welcome](https://badgen.net/badge/PR/Welcome/green)](https://github.com/jmjuanes/unicss)
[![CI](https://github.com/jmjuanes/siimple/actions/workflows/ci.yml/badge.svg)](https://github.com/jmjuanes/unicss/actions/workflows/ci.yml)

## Features

- :sparkles: **Framework agnostic**: the library integrates well with React and Preact, but you can use the `css`, `keyframes` or `globalCss` functions with any other framework like Vue or Vanilla JS.
- :nail_care: **Themeable**: use your custom colors, typography, and more.
- :clipboard: **CSS features**: upports pseudo-classes like `:hover` or `:focus` and at-rules like `@media` queries, `@font-face`, `@keyframes` and `@import`.
- :train2: **Server-Side Rendering**: UniCSS supports server-side rendering thanks to `extractCss` function. 

## Table of contents

- [Installation](#installation).
- [Usage](#usage).
- [Style Syntax](#style-syntax)
  - [Media Queries](#media-queries).
  - [Font Face Rules](#font-face-rules).
  - [Numeric Values](#numeric-values).
- [API](#api).
  - [configure](#configureoptions).
  - [styled](#styledtag-styles).
  - [css](#cssstyles).
  - [globalCss](#globalcssstyles).
  - [keyframes](#keyframesobj).
  - [extractCss](#extractcss).
  - [classNames](#classnamesobj).
- [Variants](#variants).
- [Customization](#customization).
  - [Theme](#theme).
  - [Aliases](#aliases).
- [Server-Side Rendering](#server-side-rendering).

## Installation

Use **npm** or **yarn** for adding this package to your project:

```bash
## Using NPM
$ npm install --save unicss

## Using YARN
$ yarn add unicss
``` 

## Usage

Use the `configure` function to provide the *pragma* function from your UI framework (`createElement` for React, `h` for Preact). The `configure` function should be called only once in the entry file of your application.

```js
import React from "react";
import {configure, styled} from "unicss";

configure({
    pragma: React.createElement,
});
```

Use the `styled` function to create a component and add styles to it. Note that you should execute `configure` before using the `styled` function.

```js
const Button = styled("button", {
    backgroundColor: "dodgerblue",
    borderRadius: "9999px",
    color: "white",
    padding: "0.875rem 1rem",
    "&:hover": {
        backgroundColor: "royalblue",
        cursor: "pointer",
    },
});
```

The `styled` function returns a component for the specified `tag` name, and can be rendered in your application as any other component:

```jsx
render(
    <Button onClick={() => alert("Hello world!")}>
        Click me
    </Button>
);
```

Note that the `styled` function is not available outside *React* or *Preact*, but you can use the `css`, `globalCss` or `keyframes` functions to style your HTML elements.

```js
import {css} from "unicss";

// Generate a classname from the specified styles object
const titleClassName = css({
    display: "block",
    fontSize: "3rem",
    fontWeight: "bold",
});

// Usage in Vanilla JS
const title = document.querySelector("#title");
title.classList.add(titleClassName);

// Usage in JSX
render(
    <h1 className={titleClassName}>
        Hello world
    </h1>
);
```

## Style Syntax

UniCSS accepts styles in an object-like syntax, where CSS properties are written in `camelCase` format instead of `kebab-case`, so for example instead of writting `padding-left` you would write `paddingLeft`. Example:

```js
css({
    backgroundColor: "lightgray",
    color: "blue",
    padding: "1rem",
});
```

Nested objects can be used for styling children, pseudo elements, class selectors, and attribute selectors. Use the `&` character to match the current element.

```js
css({
    backgroundColor: "white",
    color: "darkgray",
    "&:hover": {
        backgroundColor: "lightgray",
        color: "blue",
        cursor: "pointer",
    },
});
```
### Media Queries

Use nesting objects to apply a media query to the parent element. The `&` selector is not required when used with the `css` function or inside an element.

```js
css({
    color: "red",
    width: "100px",
    "@media (min-width: 1200px)": {
        color: "blue",
        width: "200px",
    }
});
```

Media queries can be also applied to multiple selectors:

```js
globalCss({
    "@media (min-width: 1200px)": {
        ".button": {
            width: "100px",
        },
        ".alert": {
            padding: "0.5rem",
        },
    },
});
```

### Font face rules

The `@font-face` rule can be used with the `globalCss` function. Multiple values can ve provided using an array.

```js
globalCss({
    "@fontFace": {
        fontFamily: "MyFont",
        src: "url(font.ttf)",
    },
});
```

### Numeric values

Numeric values will be converted automatically into `px` values in CSS properties that do not accept unitless values (for example `margin` or `padding`).

```js
css({
    lineHeight: 1.5, // --> line-height: 1.5;
    margin: 10,      // --> margin: 10px;
    paddingLeft: 5,  // --> padding-left: 5px;
    zIndex: 100,     // --> z-index: 100;
});
```

## API

### configure(options)

Configure UniCSS for using your custom theme and the *pragma* function from the UI framework that you are using (for example React uses `createElement` and Preact uses `h`). The `options` object accepts the following fields:

- `pragma`: the proper *pragma* function to use.
- `theme`: your custom theme object. 
- `aliases`: your custom aliases map.

Usually you should configure UniCSS only once in the entry file of your project.

```js
import React from "react";
import {configure} from "unicss";

configure({
    pragma: React.createElement,
    theme: {
        colors: {
            primary: "royalblue",
            bg: "white",
        },
        // ...other theme configuration
    },
});
```

### styled(tag, styles)

The primary function to generate styled components. Accepts two arguments:

- `tag`: the name of the HTML element or a React/Preact component.
- `styles`: the styles object to apply.

It returns a new component with the styles attached to it.

```jsx
const Title = styled("h1", {
    color: "navy",
    fontSize: "3em",
    fontWeight: "bold",
});

render(
    <Title>Hello World</Title>
);
```

The generated component can be customized using the following props:

- `as`: override the element type.
- `css`: extend the styles applied to the component using new styles.
- `variant`: specify the variant to apply.

Any other prop will be forwarded to the generated element.

```jsx
render(
    <Title as="h2" css={{marginTop: "2rem"}}>
        Hello world
    </Title>
);
```

### css(styles)

Generate a classname from the specified styles object.

```js
const Button = props => {
    const btn = css({
        color: "red",
        fontWeight: "bold",
        "&:hover": {
            color: "blue",
            cursor: "pointer",
        },
    });

    return (
        <button className={btn}>
            {props.children}
        </button>
    );
};
```

### globalCss(styles)

Convert the speicifed styles object to global styles. Useful for registering reset styles or font faces.

```js
globalCss({
    body: {
        backgroundColor: "#fff",
        color: "#000",
    },
    a: {
        textDecoration: "none",
    },
});
```

### keyframes(obj)

Generate global animations from the specified keyframes configuration object. This function returns an unique animation identifier that can be used in an `animation` CSS property:

```js
const spinnerAnim = keyframes({
    "0%": {
        transform: "rotate(0deg)",
    },
    "100%": {
        transform: "rotate(360deg)",
    },
});

const Spinner = styled("div", {
    display: "inline-block",
    height: "80px",
    width: "80px",
    "&:after": {
        animation: `${spinnerAnim} 1s linear infinite`,
        border: "6px solid currentColor",
        borderRadius: "50%",
        content: "' '",
        display: "block",
        height: "64px",
        margin: "8px",
        width: "64px",
    },
});
```

### extractCss()

Returns the current styles in text format. Useful for rendering in server-side.

```js
render(
    <style data-source="unicss" dangerouslySetInnerHTML={{ __html: extractCss() }} />
);
```

### classNames(obj)

A tiny utility for conditionally joining class names.

```js
import {classNames} from "unicss";

const names = classNames({
    "foo": true,
    "bar": trueCondition === true,
    "baz": null,
});
// names === "foo bar"
```

## Variants

The `styled` function allows to provide custom variants for your styles, using the `variants` key.

```jsx
const Button = styled("button", {
    // base button styles

    variants: {
        primary: {
            backgroundColor: "royalblue",
            color: "white",
        },
        outlined: {
            backgroundColor: "white",
            border: "0.125rem solid royalblue",
            "&:hover": {
                backgroundColor: "royalblue",
                color: "white",
            },
        },
    },
});
```

Variants are applied using the `variant` prop of the generated component:

```jsx
render(
    <Button variant="outlined">Click me</Button>
);
```

## Customization

### Theme

You can provide your custom theme in the `configure` function:

```js
configure({
    theme: {
        colors: {
            primary: "royalblue",
            secondary: "darkpink",
        },
        radius: {
            sm: "0.25rem",
            md: "0.5rem",
            lg: "0.75rem",
        },
    },
});
```

Theme can be used in style values, providing a function that will be called with the current theme object:

```js
const btn = css({
    backgroundColor: theme => theme.colors.primary,
    borderRadius: theme => theme.radius.md,
    color: "white",
    padding: "1.5rem",
});
```

### Aliases

You can specify your custom properties aliases. Multiple aliases mapping are supported by giving an array with the properties that the alias should map.

```js
configure({
    aliases: {
        // Single property alias
        bg: "backgroundColor",
        p: "padding",
        pl: "paddingLeft",
        pr: "paddingRight",
        pt: "paddingTop",
        pb: "paddingBottom",
        // Multiple property alias using an array of props
        px: ["paddingLeft", "paddingRight"],
        py: ["paddingTop", "paddingBottom"],
    },
});

const button = css({
    // ...base styles
    bg: "white", // -> backgroundColor: "white"
    px: "1rem",  // -> paddingLeft: "1rem" and paddingRight: "1rem"
});
```

## Server-Side Rendering

When rendering in server-side, you can use the `extractCss` function to obtain the generated styles.

```jsx
import {renderToString} from "react-dom/server";
import {extractCss} from "unicss";

// First render your app
const html = renderToString(<App />);

// Then extract the CSS styles
const styles = extractCss();
```

Then, you can create a new `<style>` element and inject the styles. To allow hydrating your styles in the browser, remember to add a `data-unicss=""` attribute to the `<style>` element.

This is an example for [Gatsby](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/):

```jsx
export const onRenderBody = ({setHeadComponents}) => {
    setHeadComponents([
        <style data-unicss="" dangerouslySetInnerHTML={{__html: extractCss()}} />
    ]);
};
```

## License

[MIT License](https://github.com/jmjuanes/unicss/blob/main/LICENSE).
