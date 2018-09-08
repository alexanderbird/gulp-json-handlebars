# gulp-json-handlebars

Another Gulp handlebars plugin that starts with the template data and ends with the html.

(Contrast this with [gulp-handlebars-html](https://www.npmjs.com/package/gulp-handlebars-html) which starts with the handlebars
file and you add the template data if you want)

```
// foo.html.json
{
  "meta": {
    "pageTemplate": "bar"
  },
  "otherStuff": "123"
}
```

```
// bar.hbs
<html>
  <body>
    <div>Other stuff {{otherStuff}}</div>
  </body>
</html>
```

```
// gulpfile.js
const gulpJsonHandlebars = require('gulp-json-handlebars');
const extensionReplace = require('gulp-ext-replace');

const handlebarsOptions = {
  partialsDirectory: 'src/handlebars-partials'
}

gulp.task('build', () => {
  gulp
    .src('src/**/*.html.json')
    .pipe(gulpJsonHandlebars(handlebarsOptions, getPageTemplate))
    .pipe(extensionReplace(''))          // optional, renames *.html.json to *.html
    .pipe(gulp.dest('build'));
});

// returns handlebars template given a template name
// the template name comes from meta.pageTemplate property in the json file
// you decide how to pick the template
// example: you have a folder of templates and you load the file indicated by the template name
const getPageTemplate = pageTemplateName => {
    const templatePath = path.join(handlebarsDirectory, 'pages', pageTemplateName + '.hbs');
    return fs.readFileSync(templatePath).toString('utf-8');
};


// Alternative: minimal getPageTemplate
// just return a string
const minimalGetPageTemplate = () => `
  <html>
    <body>
      <div>Other stuff {{otherStuff}}</div>
    </body>
  <html>
`
```

## handlebarsOptions

* `partialsDirectory` -- string or array of strings indicating paths to handlebars partials
* `supplementaryData` -- optional object, will be merged with the template data from the json that's piped through
* `preProcessData` -- optional function which will be called with the data parsed from the json file. The return value
  from this function will be used instead of the json data.

# Attribution

Thanks to [gulp-handlebars-html](https://www.npmjs.com/package/gulp-handlebars-html), I adapted the partial registration stuff from there.

# Contribution

PRs welcome, as long as they include appropriate tests and updates to the README.
