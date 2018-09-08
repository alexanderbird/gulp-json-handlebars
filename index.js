const through = require('through2');
const Handlebars = require('handlebars')
const fs = require('fs');
const gutil = require('gulp-util');

const PartialRegistrator = require('./register-partials');

function error(message) {
  error.gulpPlugin.emit('error', new gutil.PluginError('gulp-json-handlebars', message));
}

function validateData(data, fileName) {
  if (!data.meta || !data.meta.pageTemplate) {
    error(`Missing meta.pageTemplate property in ${fileName}`);
  }
}

function getDataFromFile(file, encoding) {
  if (file.isBuffer()) {
    return getDataFromBuffer(file, encoding);
  } else if (file.isStream()) {
    error("Streams aren't supported yet, sorry");
  } else {
    error('Expected a stream or a buffer, but got something different');
  }
}

function getDataFromBuffer(file, encoding) {
  const json = file.contents.toString(encoding);
  const data = JSON.parse(json);
  const fileName = file.history.shift();
  validateData(data, fileName);
  return data;
}

module.exports = () => {
  return function(options = {}, getPageTemplate = () => '') {
    new PartialRegistrator(options).doIt();

    return through.obj(function(file, encoding, callback) {
      error.gulpPlugin = this;
      const data = Object.assign({}, getDataFromFile(file, encoding), {
        global: options.supplementaryData
      });
      const template = getPageTemplate(data.meta.pageTemplate);
      const html = Handlebars.compile(template)(data);
      file.contents = new Buffer.from(html);
      callback(null, file);
    });
  };
};
