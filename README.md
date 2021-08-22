# Frontend-Dev-Tools

## Features
 - Express dev server, open browser to http://localhost:3000/
 - ECMA script compiler: Babel-Core/Browserify/Babelify (supports es2015+)
 - Sass compiler (Dart-sass)
 - Autoprefixer (Postcss)


## Setup
> Install node packages:
```
$ npm install
```
> To run dev environment:
```
$ npm start  
```
> To run production build:
```
$ npm run build  
```


## Frontend Architecture Overview
### Sass (scss) Architecture: File Structure Theme
```
    scss/
    |
    | - core/
    |       | - reset.scss
    |       | - typography.scss
    |
    | - components/
    |
    | - layout/
    |
    | - Utils/
    |       | - functions/
    |       |
    |       | - mixins/
    |       |         | - breakpoints.scss
    |       |         | - grid.scss
    |       |
    |       | - variables/
    |
    |
    | - app.scss (entry point scss file)
```


### Sass (scss) Formatting Standards
#### Basic Formatting Rules:
```css
    .selector-one,
    .selector-two,
    .selector-three {
        position: absolute;
        display: block;
        width: 100%;
    }

    h1 {
        margin: 0;
        padding: 0;
    }
```
- Use one selector per line in multi-selector rulesets.
- Include a single space before the opening bracket of a code block.
- Use one level of indentation for each property declaration.
- Use a single space after the colon of a property declararion.
- Use lowercase and shorthand hex values ex.`#fff`
- Separate each code block with a blank line.

#### Property Ordering:
```css
    .example {
        /* Positioning */
        position: absolute;
        z-index: 1;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;

        /* Display & Box Model */
        display: block;
        overflow: hidden;
        box-sizing: border-box;
        width: 600px;
        height: 250px;
        margin: 3px;
        border: 1px solid #222222;
        padding: 10px;

        /* Color */
        background: #222222;
        color: #FFFFFF;

        /* Text */
        font-family: sans-serif;
        font-size: 14px;
        line-height: 1.5;
        text-align: right;

        /* other */
        cursor: pointer;
        transition: margin-right 4s ease-in-out;
    }
```
