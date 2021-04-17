const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const OSS = require('ali-oss');
const { LOCAL_ACCESS_PATH } = require('./pandora/utils');
const config = require('./config.json');

const loggerPrefix = '[ALINODE RUNTIME AGENT]:';
const logger = function () {
  const args = Array.from(arguments);
  args.unshift(loggerPrefix);
  console.log.apply(console, args);
};

const reportFileNmae = './report.json';
const reportDirectory = '/tmp/';

const server = spawn(path.resolve(__dirname, '../alinode/bin/node'), [
  '--report-uncaught-exception',
  `--report-filename=${reportFileNmae}`,
  `--report-directory=${reportDirectory}`,
  path.resolve(__dirname, './server.js'),
]);

logger('server start success');

server.on('data', (data) => {
  console.log(data);
});

server.on('exit', (code) => {
  logger(`child process exited with code ${code}`);
  const time = new Date();
  setTimeout(() => {
    uploadReport(time);
  }, 5000);
});

const uploadReport = async (time) => {
  try {
    const accessStr = (await fs.readFileSync(LOCAL_ACCESS_PATH)).toString();
    const access = JSON.parse(accessStr);
    const ossClient = new OSS({
      region: `oss-${config.region}`,
      bucket: config.bucket,
      accessKeyId: access.accessKeyId,
      accessKeySecret: access.accessKeySecret,
      stsToken: access.securityToken,
    });
    const date = new Date();
    const fileName = `diagnostic-report/${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}/report-${date.getHours()}-${date.getMinutes()}-${date.getTime()}.json`;
    await ossClient.put(
      fileName,
      path.resolve(reportDirectory, reportFileNmae)
    );
    logger('process exits in', time, 'report to', fileName);
  } catch (err) {
    logger('upload report failed, err: ', err);
  }
};
