/* modified from gulp-handlebars-html
 *  https://www.npmjs.com/package/gulp-handlebars-html
 */

const fs = require('fs');

class PartialRegistrator {
  constructor(options, Handlebars) {
    this._options = Object.assign(options, {
      maxDepth: 10,
      allowedExtensions: ['hb', 'hbs', 'handlebars', 'html'],
    });
    this._Handlebars = Handlebars;
  }

  _isDir(filename) {
    const stats = fs.statSync(filename);
    return stats && stats.isDirectory();
  }

  _isHandlebars(filename) {
    return (
      this._options.allowedExtensions.indexOf(filename.split('.').pop()) !== -1
    );
  }

  _partialName(filename, base) {
    let name = filename.substr(0, filename.lastIndexOf('.'));
    name = name.replace(new RegExp('^' + base + '\\/'), '');
    return name;
  }

  _registerPartial(filename, base) {
    if (!this._isHandlebars(filename)) {
      return;
    }
    const name = this._partialName(filename, base);
    const template = fs.readFileSync(filename, 'utf8');
    this._Handlebars.registerPartial(name, template);
  }

  _registerPartials(dir, base, depth) {
    if (depth > this._options.maxDepth) {
      return;
    }

    base = base || dir;

    fs.readdirSync(dir).forEach(basename => {
      const filename = dir + '/' + basename;
      if (this._isDir(filename)) {
        this._registerPartials(filename, base);
      } else {
        this._registerPartial(filename, base);
      }
    });
  }

  doIt() {
    const partialsDirectory = this._options.partialsDirectory;
    if (!partialsDirectory) return;
    const partialsDirectoryArray =
      typeof partialsDirectory === 'string'
        ? [partialsDirectory]
        : partialsDirectory;

    partialsDirectoryArray.forEach(dir => {
      this._registerPartials(dir, dir, 0);
    });
  }
}

module.exports = PartialRegistrator;
