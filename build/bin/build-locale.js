var fs = require('fs');
var save = require('file-save');
var resolve = require('path').resolve;
var basename = require('path').basename;
var lodash = require('lodash');
var child_process = require('child_process');
var fsExtra = require('fs-extra');

var localePath = resolve(__dirname, '../../src/locale/lang');
var fileList = fs.readdirSync(localePath);
var rootTypesPath = resolve(__dirname, '../../types');
var targetLangFolder = resolve(__dirname, '../../temp_web/element/locale/lang');

var langCriterion;

var parseLang = function(code) {
  return new Function(`${ code.replace('export default', 'return') }`)();
};

var transform = function(filename, name, callback) {
  return transformCode(
    fs.readFile(resolve(localePath, filename), 'utf-8', function cb(err, code) {
      var result;

      if (!err) {
        try {
          if (langCriterion != null) {
            var lang = parseLang(code);

            lang = lodash.mergeWith({}, langCriterion, lang);

            code = `export default ${ JSON.stringify(lang, null, 2) };`;
          }

          result = transformCode(code, name);
        } catch (_err) {
          err = _err;
        }
      }

      if (err) {
        callback(err);
      } else {
        callback(null, result);
      }
    }),
    name
  );
};

var transformCode = function(code, name) {
  return require('babel-core').transform(code, {
    plugins: [
      'add-module-exports',
      ['transform-es2015-modules-umd', { loose: true }]
    ],
    moduleId: name
  });
};

fileList = fileList.filter(function(file) {
  return /\.js$/.test(file);
});

var enLangFilePath = fileList.find(v => v.includes('en.js'));
if (enLangFilePath != null) {
  langCriterion = parseLang(fs.readFileSync(resolve(localePath, enLangFilePath), 'utf-8'));
}

fileList.forEach(function(file) {
  var name = basename(file, '.js');

  transform(file, name, function(err, result) {
    if (err) {
      console.error(err);
    } else {
      var code = result.code;

      code = code
        .replace('define(\"', 'define(\"element/locale/')
        .replace('global.', 'global.ELEMENT.lang = global.ELEMENT.lang || {}; \n    global.ELEMENT.lang.');
      save(resolve(__dirname, '../../lib/umd/locale', file)).write(code);

      console.log(file);
    }
  });
});

// [EDD-5566] Generate the related lang types.
if (langCriterion != null) {
  var langSpecFileName = 'lang-spec';
  var targetLangSpecPath = resolve(targetLangFolder, `${ langSpecFileName }.ts`);
  var targetLangSpecDtsPath = resolve(targetLangFolder, `${ langSpecFileName }.d.ts`);
  var langSpecTypeName = 'ElLangSpec';

  fsExtra.ensureDirSync(targetLangFolder);

  fs.copyFileSync(resolve(localePath, enLangFilePath), targetLangSpecPath);
  fs.writeFileSync(
    targetLangSpecPath,
    fs.readFileSync(targetLangSpecPath, 'utf-8').replace('export default', `export const ${ langSpecTypeName } =`),
    'utf-8'
  );

  child_process.execSync(`.\\node_modules\\.bin\\tsc "${ targetLangSpecPath }" --declaration --emitDeclarationOnly --skipLibCheck --skipDefaultLibCheck --typeRoots "./node_modules/@types/*"`, {
    encoding: 'utf-8',
    cwd: resolve(__dirname, '../../')
  });

  fs.writeFileSync(
    targetLangSpecDtsPath,
    fs.readFileSync(targetLangSpecDtsPath, 'utf-8').replace(
      `declare const ${ langSpecTypeName }:`,
      `type ${ langSpecTypeName } =`
    ),
    'utf-8'
  );

  fs.copyFileSync(targetLangSpecDtsPath, resolve(rootTypesPath, basename(targetLangSpecDtsPath)));
}
