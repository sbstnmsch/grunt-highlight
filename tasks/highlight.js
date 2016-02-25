/*
 * grunt-highlight
 * https://github.com/james2doyle/grunt-highlight
 *
 * Copyright (c) 2013 James Doyle
 * Licensed under the MIT license.
 */

 'use strict';

 var hljs = require('highlight.js'),
 cheerio = require('cheerio');

 module.exports = function (grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('highlight', 'Run highlight.js over files', function () {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      lang: false, // highlight lang
      useCheerio: true, // use cheerio
      selector: 'pre code' // html selector
    });

    // Iterate over all specified file groups.
    this.files.forEach(function (file) {
      // Concat specified files.
      var src = file.src.filter(function (filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function (filepath) {
        // Read file source.
        if (options.lang && !options.useCheerio) {
          // highlight code block
          return hljs.highlight(options.lang, grunt.file.read(filepath)).value;
        } else if (options.useCheerio) {

          // load the file for cheerio
          // don't decode html, causes issues when highlighting javascript
          // embedded in html
          var $ = cheerio.load(grunt.file.read(filepath), {
            decodeEntities: true
          });
          $(options.selector).each(function(i, elem) {
            // code to highlight
            var code = $(this).text(), val;
            // lang provided in gruntfile
            if (options.lang) {
              val = hljs.highlight(options.lang, code).value;
            // lang provided in code tag :  <code class="lang">
            } else if (elem.attribs.class != undefined) {
              val = hljs.highlight(elem.attribs.class, code).value;
            // lang not provided
            } else {
              val = hljs.highlightAuto(code).value;
            }
            // write that new value in there
            $(this).html(val);
          });
          // return the modified content
          return $.html();
        } else {
          // auto highlight
          return hljs.highlightAuto(grunt.file.read(filepath)).value;
        }
      });

      // Write the destination file.
      grunt.file.write(file.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + file.dest + '" created.');
    });
  });

};
