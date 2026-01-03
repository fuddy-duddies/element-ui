const config = require('../config');
const fsExtra = require('fs-extra');
const path = require('path');

const builder = require('./theme-chalk-server/build-theme');

const packageExportedFolder = path.resolve(__dirname, '../../lib');
const packageExportedCustomThemeFolder = path.resolve(packageExportedFolder, './theme-chalk/custom-theme');

(
  async function() {
    const themeName = config.defines.FUDDY_DUDDY_THEME_NAME;
    await builder.run(themeName, JSON.parse(`${ config.defines.FUDDY_DUDDY_THEME_CONFIG }`));

    const targetThemePackageExportedCustomThemeFolder = path.resolve(
      packageExportedCustomThemeFolder,
      themeName
    );

    const exportedThemeConfigFilePath = builder.calcExportedThemeConfigFilePath(themeName);
    await fsExtra.copy(
      exportedThemeConfigFilePath,
      path.resolve(targetThemePackageExportedCustomThemeFolder, path.basename(exportedThemeConfigFilePath))
    );

    const exportedThemeFilePath = builder.calcExportedThemeFilePath(themeName);
    await fsExtra.copy(
      exportedThemeFilePath,
      path.resolve(targetThemePackageExportedCustomThemeFolder, path.basename(exportedThemeFilePath))
    );
  }
)();
