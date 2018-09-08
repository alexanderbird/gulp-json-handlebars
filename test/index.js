const testPlugin = require('test-your-gulp-plugin');
const gulpJsonHandlebars = require('..');
var SpecReporter = require('jasmine-spec-reporter').SpecReporter;
jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter(new SpecReporter({
  spec: {
    displayPending: true,
    displayStacktrace: true
  },
  summary: {
    displayPending: false,
    displaySuccessful: false,
    displayFailed: false
  }
}));

testPlugin('gulp-json-handlebars', (it, itIgnoresNullFiles) => {
  itIgnoresNullFiles(gulpJsonHandlebars);

  it('errors if meta.pageTemplate is missing', {
    plugin: gulpJsonHandlebars({}, () => ''),
    input: {
      contents: '{}',
      path: 'incomplete/meta-data.yaml',
    },
    error: /Missing meta.pageTemplate.*incomplete\/meta-data.yaml/
  });

  it('errors if getPageTemplate is missing', {
    plugin: gulpJsonHandlebars({}),
    input: JSON.stringify({ meta: { pageTemplate: 'x' } }),
    error: 'Expected the second parameter to be a function returning the handlebars template as a string (e.g. `templateName => handlebarsTemplateStringFo(templateName)`'
  });

  it('errors if getPageTemplate returns an empty string', {
    plugin: gulpJsonHandlebars({}, () => ''),
    input: JSON.stringify({ meta: { pageTemplate: 'x' } }),
    error: 'Expected the second parameter to be a function returning the handlebars template as a string (e.g. `templateName => handlebarsTemplateStringFo(templateName)`'
  });

  it('errors if the input file contents cannot be parsed as JSON', {
    plugin: gulpJsonHandlebars({}, () => 'x'),
    input: '{ badJson',
    error: 'Can\'t parse `{ badJson`. Unexpected token b in JSON at position 2'
  });

  it('pipes the template and template data through handlebars', {
    plugin: gulpJsonHandlebars({}, () => 'Value of foo is {{foo}}, value of bar.baz is {{bar.baz}}'),
    input: {
      contents: JSON.stringify({ meta: { pageTemplate: 'x' }, foo: 123, bar: { baz: 567 } }),
      path: '/foo/bar.yaml'
    },
    output: {
      contents: 'Value of foo is 123, value of bar.baz is 567',
      path: '/foo/bar.yaml'
    }
  });

  it('uses the data preprocessor if provided via options (passes data and relative path for preprocessing)', {
    plugin: gulpJsonHandlebars({
      preProcessData: (data, path) => Object.assign(data, { stuff: data.stuff.replace(/o/g, '0'), path })
    }, () => '{{stuff}} || {{path}}'),
    input: {
      contents: JSON.stringify({ meta: { pageTemplate: 'x' }, stuff: 'foo' }),
      cwd: '/foo',
      path: '/foo/baz/quux.txt'
    },
    output: 'f00 || baz/quux.txt'
  });

  it('passes the meta.templateName to the getPageTemplate function', {
    plugin: gulpJsonHandlebars({}, pageTemplate => {
      expect(pageTemplate).toEqual('foobar');
      return 'x';
    }),
    input: JSON.stringify({ meta: { pageTemplate: 'foobar' } })
  });

  it('properly registers handlebars partials', {
    plugin: gulpJsonHandlebars({ partialsDirectory: 'test/fixtures' }, () => `{{> partialA color=catColor}}`),
    input: JSON.stringify({ meta: { pageTemplate: 'x' }, catColor: 'green' }),
    output: 'The cat is green'
  });
});
