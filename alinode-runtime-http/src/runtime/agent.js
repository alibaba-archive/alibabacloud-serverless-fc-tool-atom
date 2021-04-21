const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const OSS = require('ali-oss');
const { LOCAL_ACCESS_PATH } = require('./pandora/utils');
const config = require('./fc-config.json');

const loggerPrefix = '[ALINODE RUNTIME AGENT]:';
const logger = function () {
  const args = Array.from(arguments);
  args.unshift(loggerPrefix);
  console.log.apply(console, args);
};

const reportFileNmae = './report.json';
const reportDirectory = '/tmp/';
const reportPath = path.resolve(reportDirectory, reportFileNmae);

const uploadReport = async (time, restart) => {
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
    const fileName = `diagnostic-report/${config.serviceName}.${
      config.functionName
    }/${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}/report-${date.getHours()}-${date.getMinutes()}-${date.getTime()}.json`;
    await ossClient.put(fileName, reportPath);
    const message = restart
      ? `process restart in ${time}, upload latest upload report to ${fileName}`
      : `process exits in ${time}, upload report to ${fileName}`;
    logger(message);
  } catch (err) {
    logger(
      'upload report failed, at',
      time,
      ' err: ',
      err,
      'is restart: ',
      !!restart
    );
  }
};

const bootstrap = async () => {
  const reportExists = await fs.existsSync(reportPath);
  if (reportExists) {
    await uploadReport(new Date(), true);
    await fs.rmSync(reportPath);
  }

  const server = spawn(path.resolve(__dirname, '../alinode/bin/node'), [
    '--report-uncaught-exception',
    `--report-filename=${reportFileNmae}`,
    `--report-directory=${reportDirectory}`,
    path.resolve(__dirname, './server.js'),
  ]);

  logger('server start success');

  server.stdout.on('data', (data) => {
    // stdout 抛出
    console.log(`${data}`);
  });

  server.stderr.on('data', (error) => {
    // stderr 尝试抛出
    console.log(`${error}`);
  });

  server.on('exit', (code) => {
    // 容器中不触发这个事件，怀疑是容器冻结或重启的原因，先保留，即使上传失败，也会在重启后再上传
    const time = new Date();
    logger(`child process exited with code ${code}, at ${time}`);
    setTimeout(async () => {
      await uploadReport(time);
      await fs.rmSync(reportPath);
    }, 5000);
  });
};

bootstrap();
