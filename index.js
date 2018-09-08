const through = require('through2');
const Handlebars = require('handlebars')
const fs = require('fs');
const gutil = require('gulp-util');

const PartialRegistrator = require('./register-partials');

function getDataFromFile(file, encoding) {
  if (file.isBuffer()) {
    return getDataFromBuffer(file, encoding);
  } else if (file.isStream()) {
    throw new Error("Streams aren't supported yet, sorry");
  } else {
    throw new Error('Expected a stream or a buffer, but got something different');
  }
}

function getDataFromBuffer(file, encoding) {
  const json = file.contents.toString(encoding);
  let data;
  try {
    data = JSON.parse(json);
  } catch(e) {
    return {
      _gulpJsonHandlebarsError: true,
      rawJson: json,
      message: e.message
    };
  }
  return data;
}

function validateStuff(data, template, plugin) {
  const error = message => plugin.emit('error', new gutil.PluginError('gulp-json-handlebars', message));
  if(data._gulpJsonHandlebarsError) {
    error(`Can't parse \`${data.rawJson}\`. ${data.message}`);
    return false;
  }

  if(!data.meta || !data.meta.pageTemplate) {
    error(`Missing meta.pageTemplate property`);
    return false;
  }
  if(!template) {
    error('Expected the second parameter to be a function returning the handlebars template as a string (e.g. `templateName => handlebarsTemplateStringFo(templateName)`');
    return false;
  }
  return true;
}

module.exports = function(options = {}, getPageTemplate = () => '') {
  new PartialRegistrator(options).doIt();

  return through.obj(function(file, encoding, callback) {
    const data = Object.assign({}, getDataFromFile(file, encoding), {
      global: options.supplementaryData
    });
    const template = getPageTemplate(data && data.meta && data.meta.pageTemplate);
    if(!validateStuff(data, template, this)) {
      callback();
      return;
    }
    const html = Handlebars.compile(template)(data);
    file.contents = new Buffer.from(html);
    callback(null, file);
  });
}
