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
    input: '{}',
    error: /Missing meta.pageTemplate/
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
    input: JSON.stringify({ meta: { pageTemplate: 'x' }, foo: 123, bar: { baz: 567 } }),
    output: 'Value of foo is 123, value of bar.baz is 567'
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
