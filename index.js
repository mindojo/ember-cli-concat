/* jshint node: true */
'use strict';

/* Dependencies */

var concat = require('broccoli-sourcemap-concat');
var fileRemover = require('broccoli-file-remover');
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');

/* Helper Functions */

/**
A helper function that looks to see if a variable has a value and, if so, uses the value. Otherwise, it uses the developer-defined fallback.
Example usage:
```
var path = defaultFor(path, 'assets/app.js');
```

@method defaultFor
@param {all} The variable you want to use the value of but need a fallback
@param {all} The default value to use in cases where the value of `variable` is not defined
*/

var defaultFor = function(variable, defaultValue) {
  if (typeof variable !== 'undefined' && variable !== null) {
    return variable;
  } else {
    return defaultValue;
  }
}

/* The main event woop woop */

module.exports = {
  name: 'ember-cli-concat',

  /**
  The string to add to the end of all concatenated files. Usually this is a comment. For example:
  ```
  string: '// Copyright © I Am Devloper 2014'
  ```

  @property footer
  @type String
  @default null
  */

  footer: null,

  /**
  An override the developer can utilize to concatenate regardless of the environment. Useful for debuggin purpuses.

  @property forceConcatenation
  @type Boolean
  @default false
  */

  forceConcatenation: false,

  /**
  The string to add to the start of all concatenated files. Usually this is a comment. For example:
  ```
  string: '// Author: I Am Devloper'
  ```

  @property header
  @type String
  @default null
  */

  header: null,

  /**
  Disables concatenation of files no matter what other options are set (e.g. `forceConcatination: true`). Useful for debugging purposes.

  @property enabled
  @type Boolean
  @default true
  */

  enabled: true,

  /**
  The name of the Ember CLI content-for hook to use to add scripts to your app. The content-for hooks are generally found in index.html files.

  @property scriptsContentFor
  @type String
  @default 'body'
  */

  scriptsContentFor: 'body-footer',

  /**
  The name of the Ember CLI content-for hook to use to add styles to your app. The content-for hooks are generally found in index.html files.
  If you're using an Ember CLI version **below** 1.4.0 you should set this value to `head`:
  ```js
  // Ember CLI less than v1.4.0
  var app = new EmberApp({
    emberCliConcat: {
      stylesContentFor: 'head'
    }
  });
  ```

  @property stylesContentFor
  @type String
  @default 'head-footer'
  */


  stylesContentFor: 'head-footer',

  /**
  The output directory that the concatenated files will be saved to. Define it as a relative path with no opening or closing slashes. For example:
  `outputDir` is combined with `outputFileName` to determine the full file path for saving concatenated files.
  ```
  outputDir: 'assets'
  // or
  outputDir: 'assets/public'
  ```

  @property outputDir
  @type String
  @default 'assets'
  */

  outputDir: 'assets',

  /**
  The name of the concatenated file that will hold the styles or script for your project. Define it as a string with no file extention. This addon will automatically append the require file extentions. For example:
  ```
  outputFileName: 'app' // Results in app.css and app.js being created
  ```
  The full file path is determine by `outputFileName` and `outputDir`. For example:
  ```
  outputDir: 'assets',
  outputFileName: 'app'
  // Results in assets/app.css and assets/app.js being created
  ```

  @property outputFileName
  @type String
  @default 'app'
  */

  outputFileName: 'app',

  /**
  Whether or not to use self closing HTML tags for the `<style>` and `<link>` tags to be compatible with certain (outdated :p) templating engines.
  For example, if you set `useSelfClosingTags` to `true`:
  ```html
  <link href="assets/app.css">
  <!-- Becomes... -->
  <link href="assets/app.css" />
  ```

  @property useSelfClosingTags
  @type Boolean
  @default false
  */

  useSelfClosingTags: false,

  /**
  Whether or not to wrap the concatenated javascript in an eval statement.

  @property wrapScriptsinFunction
  @type Boolean
  @default true
  */

  wrapScriptsInFunction: true,

 /**
  Whether or not to original files regardless of concatenation.

  @property preserveOriginals
  @type Boolean
  @default true
  */

  preserveOriginals: false,

  _concatScripts: false,
  _concatStyles: false,
  _environment: null,
  _inTesting: false,
  _inProduction: false,
  _outputPaths: null,
  _shouldConcatFiles: false,

  /**
  Cleans up a path by removing the opening and closing forward slashes. Essentially, this turns an absolute path into a relative path and protects against typos in the developer-defined options.
  ```
  return cleanPath('/assets/app.js') // 'assets/app.js'
  ```

  @method cleanPath
  @param {String} The path to clean up
  */

  cleanPath: function(path) {
    return path.replace(/^\//, '').replace(/\/$/, '');
  },

  getAssetTag: function(ext, path) {
    var closing;

    if (ext === 'js') {
      return '<script src="' + path + '"></script>\n';
    } else {
      closing = this.useSelfClosingTags ? ' /' : '';

      return '<link rel="stylesheet" href="' + path + '"' + closing + '>\n';
    }
  },

  /**
  Append `<link>` and `<script>` tags to the app's HTML file to load only the assets we require.
  The contentFor hook is run once for each `content-for` in our application. `head` and `body`, which are the two we hook onto, are standard to Ember CLI builds and are found in the app's main HTML filem which is `app/index.html` by default.

  @method contentFor
  @param {String} type The type of content-for this is being run for (e.g. head, body, etc)
  */

  contentFor: function(contentForType) {
    var outputPaths = this._outputPaths;
    var concatPath = this.outputDir + '/' + this.outputFileName;
    var ext, tags;

    if (contentForType === 'test-support-prefix') {
      this._inTesting = true;
    } else if (contentForType === this.scriptsContentFor) {
      ext = 'js';

      this._concatScripts = true;

      if (this._shouldConcatFiles) {
        tags = this.getAssetTag(ext, concatPath + '.' + ext);
      } else {
        tags = this.getTags(ext);
      }

      return tags;
    } else if (contentForType === this.stylesContentFor) {
      ext = 'css';

      this._concatStyles = true;

      if (this._shouldConcatFiles) {
        tags = this.getAssetTag(ext, concatPath + '.' + ext);
      } else {
        tags = this.getTags(ext);
      }

      return tags;
    } else {
      return;
    }
  },

  filterPaths: function(ext) {
    var tags = [];
    var outputPaths = this._outputPaths;
    var addPath;

    /* Build array in custom order so each tag is
    in the correct order */

    addPath = function(path) {
      var isTestSupportAsset = path.indexOf('test-support') > -1;
      var i = isTestSupportAsset ? 1 : 0;

      if (isTestSupportAsset && !this._inTesting) {
        return;
      } else if (path.indexOf('test-loader') === -1) {
        tags.splice(i, 0, path);
      }
    }.bind(this);

    for (var treeName in outputPaths) {
      var assets = outputPaths[treeName];
      var paths = assets[ext];
      var path;

      if (typeof paths === 'string') {
        addPath(paths);
      } else {
        for (var type in paths) {
          addPath(paths[type]);
        }
      }
    }

    return tags;
  },

  getTags: function(ext) {
    return this.filterPaths(ext).map(function(path) {
      return this.getAssetTag(ext, path);
    }.bind(this));
  },

  /**
  Overrides this addon's default options with any specified by the developer and determines whether or not to concatenate files based on the environment. Please note, there is a fallback check for detecting test environments in the contentFor hook.
  The included hook is run once during the build process of the addon.

  @method included
  @param {Object} app The application instance
  */

  included: function(app) {
    var environment = app.env.toString();
    var options = defaultFor(app.options.emberCliConcat, {});

    this._includeTestAssets = app.tests;
    this._environment = environment;
    this._inProduction = environment === 'production';
    this._outputPaths = app.options.outputPaths;

    for (var option in options) {
      this[option] = options[option];
    }

    if ((this._inProduction || this.forceConcatenation) && this.enabled) {
      this._shouldConcatFiles = true;
    }
  },

  /**
  @method postprocessTree
  @param {String} type The Type of tree passed (e.g. js, all, etc)
  @param {Object} tree The Broccoli tree(s) in the project
  */

  postprocessTree: function(type, tree) {
    var concatInProduction = this.inProduction && !this.preserveOriginals;
    var canRemoveOriginals = !this.preserveOriginals || concatInProduction;
    var outputPath = '/' + this.cleanPath(this.outputDir) + '/' + this.outputFileName;
    var concatenatedScripts, concatenatedStyles, outputPath, removeFromTree, scriptInputFiles, styleInputFiles, trees, workingTree;

    removeFromTree = function(inputFiles) {
      workingTree = fileRemover(workingTree, {
        files: inputFiles
      });
    };

    /* If we're not concatenating anything, just return the original tree */

    if (!this._shouldConcatFiles) {
      return tree;
    }

    /* Locate all script files and concatenate into one file. */

    if (this.scriptsContentFor) {
      scriptInputFiles = filterPaths('js');

      concatenatedScripts = concat(tree, {
        allowNone: true,
        inputFiles: scriptInputFiles,
        outputFile: outputPath + '.js',
        footer: this.footer,
        header: this.header,
        wrapInFunction: this.wrapScriptsInFunction
      });
    }

    /* Locate all style files and concatenate into one file */

    if (this.stylesContentFor) {
      styleInputFiles = filterPaths('css');

      concatenatedStyles = concat(tree, {
        allowNone: true,
        footer: this.footer,
        header: this.header,
        inputFiles: styleInputFiles,
        outputFile: outputPath + '.css',
        wrapInFunction: false
      });
    }

    /* Combine all the files into the project's tree */

    trees = [tree, concatenatedScripts, concatenatedStyles];

    /* Remove empty values and add the remaining to the
    working tree */

    workingTree = mergeTrees(
      files.filter(function(e) { return e; })
    );

    /* Remove the unnecessary script and style files */

    if (canRemoveOriginals) {
      if (concatenatedScripts) {
        removeFromTree(scriptInputFiles);
      }

      if (concatenatedStyles) {
        removeFromTree(styleInputFiles);
      }
    }

    return workingTree;
  }
};
