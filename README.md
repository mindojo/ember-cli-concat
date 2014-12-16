# Ember-cli-concat

`ember-cli-concat` is an Ember CLI addon that:
- Concatenates your javascript files into a single js file for production
- Concatenates your stylesheets into a single css file for production
- Automatically adds the relevant `<script>` and `<style>` tags to your index.html file

In other words, in production builds `vendor.css` and `app-name.css` will become `app.css`, and the same for the javascript files. This addon also handles the `<script>` and `<link rel="stylesheet">` tags in your index.html file so you don't have to worry about requesting assets that don't exist.

**By default, concatenation only takes place in production builds**

## Contents

- [Installation](#installation)
- [Customizable options](#customizable-options)
- [Asset fingerprinting](#asset-fingerprinting)
- [Using with Ember Testing](#using-with-ember-testing)
- [Issues](#issues)
- [Inspirational quotation](#inspirational-quotation)

## Installation

Add the package:

```
npm install --save-dev ember-cli-concat
```

And remove the main `<script>` and `<link rel="stylesheet">` tags from your app's main HTML file (usually `app/index.html`):

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Dummy</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{content-for 'head'}}

    <!-- Removed stylesheets -->
    <!-- <link rel="stylesheet" href="assets/vendor.css"> -->
    <!-- <link rel="stylesheet" href="assets/app-name.css"> -->
  </head>
  <body>
    {{content-for 'body'}}

    <!-- Removed scripts -->
    <!-- <script src="assets/vendor.js"> -->
    <!-- <script src="assets/app-name.js"> -->
  </body>
</html>
```

*Please note: usage with Ember Testing requires you to change your `tests.dummy/app/index.html` file. See the section on [using with Ember Testing](#using-with-ember-testing) for more details.*

## Customizable Options

Several options are made available for you to customize the addon. They can be set in your app's Brocfile as follows:

```js
var app = new EmberApp({
  emberCliConcat: {
    enabled: true,
    footer: null,
    forceConcatination: false,
    header: null,
    outputDir: 'assets',
    outputFileName: 'app',
    useSelfClosingTags: false,
    wrapScriptsInFunction: true
  }
});
```


#### enabled

Disables concatenation of files no matter what other options are set (e.g. `forceConcatination: true`). Useful for debugging purposes.

Property | Value
---------|--------
name     | enabled
type     | Boolean
default  | true


#### footer

The string to add to the end of all concatenated files. Usually this is a comment. For example:

```js
string: '// Copyright © I Am Devloper 2014'
```

Property | Value
---------|--------
name     | footer
type     | String
default  | null


#### forceConcatination

An override the developer can utilize to concatenate regardless of the environment. Useful for debugging purposes.

Property | Value
---------|--------
name     | forceConcatination
type     | Boolean
default  | false


#### header

The string to add to the start of all concatenated files. Usually this is a comment. For example:

```js
string: '// Author: I Am Devloper'
```

Property | Value
---------|--------
name     | header
type     | String
default  | null


#### outputDir

The output directory that the concatenated files will be saved to. Define it as a relative path with no opening or closing slashes. For example:

`outputDir` is combined with `outputFileName` to determine the full file path for saving concatenated files.

```js
outputDir: 'assets'
// or
outputDir: 'assets/public'
```

Property | Value
---------|--------
name     | outputDir
type     | String
default  | 'assets'


#### useSelfClosingTags

Whether or not to use self closing HTML tags for the `<style>` and `<link>` tags to be compatible with certain (outdated :p) templating engines.

For example, if you set `useSelfClosingTags` to `true`:

```html
<link href="assets/app.css">
<!-- Becomes... -->
<link href="assets/app.css" />
```

Property | Value
---------|--------
name     | useSelfClosingTags
type     | Boolean
default  | false


#### outputFileName

The name of the concatenated file that will hold the styles or script for your project. Define it as a string with no file extention. This addon will automatically append the require file extentions. For example:

```js
outputFileName: 'app' // Results in app.css and app.js being created
```

The full file path is determine by `outputFileName` and `outputDir`. For example:

```js
outputDir: 'assets',
outputFileName: 'app'
// Results in assets/app.css and assets/app.js being created
```

Property | Value
---------|--------
name     | outputFileName
type     | String
default  | 'app'


#### wrapScriptsInFunction

Whether or not to wrap the concatenated javascript in an eval statement.

Property | Value
---------|--------
name     | wrapScriptsInFunction
type     | Boolean
default  | true

## Asset Fingerprinting

`ember-cli-concat` is compatible with `broccoli-asset-rev` ([repo](https://github.com/rickharrison/broccoli-asset-rev)) out-of-the-box. If you require support for other 'link-changing' addons, please let me know.

## Using With Ember Testing

Ember CLI uses a dummy app to run your tests against. This app has its own `index.html` file and, therefore, you must change it like you changed your main `index.html` file previously.

Remove your `vendor`, `bar`, and `test-support` tags as below. Don't worry - this addon will write them for you on-the-fly.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Bar Tests</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{content-for 'head'}}
    {{content-for 'test-head'}}

    <!-- Removed stylesheets -->
    <!-- <link rel="stylesheet" href="assets/vendor.css"> -->
    <!-- <link rel="stylesheet" href="assets/bar.css"> -->
    <!-- <link rel="stylesheet" href="assets/test-support.css"> -->
    <style>
      // Ember Testing inline styling here
    </style>
  </head>
  <body>

    {{content-for 'body'}}
    {{content-for 'test-body'}}

    <!-- Removed scripts -->
    <!-- <script src="assets/vendor.js"></script> -->
    <!-- <script src="assets/test-support.js"></script> -->
    <!-- <script src="assets/bar.js"></script> -->
    <script src="testem.js"></script>
    <script src="assets/test-loader.js"></script>
  </body>
</html>
```

## Issues

Please open an issue or PR.

## Inspirational Quotation

"Drink beer and party" - Steve Jobs
