const childProcess = require('child_process');
const { BannerPlugin } = require('webpack');

function getTheLatestGitCommitHash() {
  const res = childProcess.execSync('git rev-parse HEAD');

  return Buffer.from(res).toString('utf-8').trim();
}

// eslint-disable-next-line no-unused-vars
function getGitCurrentBranchName() {
  const res = childProcess.execSync('git rev-parse --abbrev-ref HEAD');

  return Buffer.from(res).toString('utf-8').trim();
}

function getCurrentDateStringAndCachedIntoProcess() {
  if (process.env.BUILD_DATE) {
    return process.env.BUILD_DATE;
  }

  const dateString = new Date().toISOString();
  process.env.BUILD_DATE = dateString;

  return dateString;
}

function getCommonWebpackBannerPlugin() {
  return new BannerPlugin({
    banner: `Fuddy-duddy a11y enhancement\n\nDate: ${getCurrentDateStringAndCachedIntoProcess()}\nCommit: ${getTheLatestGitCommitHash()}`
  });
}

module.exports = {
  getCommonWebpackBannerPlugin
};
