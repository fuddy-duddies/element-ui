const fsExtra = require('fs-extra');
const fs = require('fs');
const path = require('path');
const { series, src, dest } = require('gulp');
const gulpSass = require('gulp-sass');
const sass = require('node-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');
const sassExtract = require('sass-extract');
const childProcess = require('child_process');

const basepath = path.resolve(__dirname, '../../../');
const sourceThemeFolder = path.resolve(basepath, './packages/theme-chalk/src');
const targetThemeFolder = path.resolve(basepath, './temp_web/element/custom-theme/');

const DEFAULT_THEME_NAME = 'Element';

const sourceThemeFile = path.resolve(sourceThemeFolder, './index.scss');
const sourceThemeVarsFile = path.resolve(sourceThemeFolder, './common/var.scss');

function calcTargetThemeFolderPath(themeName) {
  return path.resolve(targetThemeFolder, themeName);
}

function calcTargetThemeFilePath(themeName) {
  return path.resolve(calcTargetThemeFolderPath(themeName), './index.scss');
}

function calcTargetExportedThemeFolderPath(themeName) {
  return path.resolve(calcTargetThemeFolderPath(themeName), 'lib');
}

function calcTargetExportedThemeFilePath(themeName) {
  return path.resolve(calcTargetExportedThemeFolderPath(themeName), `${ themeName }.css`);
}

function calcTargetExportedThemeConfigFilePath(themeName) {
  return path.resolve(calcTargetExportedThemeFolderPath(themeName), `${ themeName }.json`);
}

function calcTargetExportedThemeZipFilePath(themeName) {
  return path.resolve(calcTargetExportedThemeFolderPath(themeName), `${ themeName }.zip`);
}

function genCompile(themeName) {
  return function compile() {
    return src(calcTargetThemeFilePath(themeName))
      .pipe(gulpSass(sass).sync({
        includePaths: [sourceThemeFolder]
      }))
      .pipe(autoprefixer({
        overrideBrowserslist: ['ie > 9', 'last 2 versions'],
        cascade: false
      }))
      .pipe(cssmin())
      .pipe(dest(calcTargetExportedThemeFolderPath(themeName)));
  };
}

function promiseWithResolver() {
  return (function() {
    let resolve, reject;
    const p = new Promise(function(_resolve, _reject) {
      resolve = _resolve;
      reject = _reject;
    });

    return {
      p,
      resolve,
      reject
    };
  })();
}

/**
 *
 * @param themeName {string}
 * @param themeConfig {{[global]: object, [local]: object}}
 * @return {Promise<void>}
 */
async function run(themeName, themeConfig) {
  themeName = themeName || DEFAULT_THEME_NAME;

  const themeContent = fs.readFileSync(sourceThemeFile, 'utf-8');
  let themeContentPrepend = '';
  let themeContentAppend = '';

  // {"global":{"$--color-primary":"#1976A1","$--color-warning":"#FF6A00","$--color-danger":"#E1140B","$--color-success":"#498631","$--color-text-placeholder":"#757575","$--color-text-primary":"#333333"},"local":{},"download":true}
  for (const key of Object.keys(themeConfig.global)) {
    const val = themeConfig.global[key];
    if (!val) continue;

    themeContentPrepend += `${ key }: ${ val } !global;\r\n`;
  }

  for (const key of Object.keys(themeConfig.local)) {
    const val = themeConfig.local[key];
    if (!val) continue;

    themeContentPrepend += `${ key }: ${ val };\r\n`;
  }

  fsExtra.ensureDirSync(calcTargetThemeFolderPath(themeName));
  fs.writeFileSync(calcTargetThemeFilePath(themeName), themeContentPrepend + themeContent + themeContentAppend, {
    encoding: 'utf-8'
  });

  series(genCompile(themeName))(function(err) {
    if (err) {
      reject(err);
      return;
    }

    return resolve();
  });

  const { p, reject, resolve } = promiseWithResolver();

  await p;

  fs.renameSync(
    path.resolve(calcTargetExportedThemeFolderPath(themeName), 'index.css'),
    calcTargetExportedThemeFilePath(themeName)
  );

  fs.writeFileSync(calcTargetExportedThemeConfigFilePath(themeName), JSON.stringify(themeConfig));

  childProcess.execSync(
    `tar -a -c -f ${ path.basename(calcTargetExportedThemeZipFilePath(themeName)) } *.css *.json`,
    {
      cwd: calcTargetExportedThemeFolderPath(themeName)
    }
  );
}

async function readThemeBuiltFileContent(themeName) {
  themeName = themeName || DEFAULT_THEME_NAME;

  return fs.readFileSync(calcTargetExportedThemeFilePath(themeName), 'utf-8');
}

async function getThemeBuiltFile(themeName) {
  themeName = themeName || DEFAULT_THEME_NAME;

  const filePath = calcTargetExportedThemeFilePath(themeName);

  return {
    filename: `${ themeName.toLowerCase() }${ path.extname(filePath) }`,
    handler: fs.createReadStream(filePath)
  };
}

async function getThemeBuiltZipFile(themeName) {
  themeName = themeName || DEFAULT_THEME_NAME;

  const filePath = calcTargetExportedThemeZipFilePath(themeName);

  return {
    filename: `${ themeName.toLowerCase() }${ path.extname(filePath) }`,
    handler: fs.createReadStream(filePath)
  };
}

// {
//     "global": {
//         "$--alert-border-radius": {
//             "type": "SassNumber",
//             "value": 4,
//             "unit": "px",
//             "sources": [
//                 "data"
//             ],
//             "declarations": [
//                 {
//                     "expression": "$border-radius-base !default",
//                     "flags": {
//                         "default": true,
//                         "global": false
//                     },
//                     "in": "data",
//                     "position": {
//                         "line": 321,
//                         "column": 1
//                     }
//                 }
//             ]
//         }
//     }
// }
async function exportConstructiveVars() {
  const extracted = sassExtract.renderSync({
    // We should replace all the `$--` to `$`, otherwise it will throw errors.
    data: fs.readFileSync(sourceThemeVarsFile, 'utf-8').replace(/\$--/gm, '$')
  }, { implementation: sass, plugins: ['serialize'] });

  const result = {
    global: {}
  };

  for (const scope of Object.keys(extracted.vars)) {
    let scopedResult = result[scope];
    if (!result[scope]) {
      scopedResult = result[scope] = {};
    }

    const scopedVars = extracted.vars[scope];

    for (const key of Object.keys(scopedVars)) {
      const val = scopedVars[key];

      scopedResult[`$--${ key.slice(1) }`] = val;
    }
  }

  return result;
}

module.exports = {
  run,
  readThemeBuiltFileContent,
  exportConstructiveVars,
  getThemeBuiltFile,
  getThemeBuiltZipFile,
  calcExportedThemeConfigFilePath: calcTargetExportedThemeConfigFilePath,
  calcExportedThemeFilePath: calcTargetExportedThemeFilePath
};
