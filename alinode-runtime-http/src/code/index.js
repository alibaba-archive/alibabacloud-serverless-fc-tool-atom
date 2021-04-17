/**
 * /*
 * To enable the initializer feature (https://help.aliyun.com/document_detail/156876.html)
 * please implement the initializer function as below：
 * exports.initializer = (context, callback) => {
 *   console.log('initializing');
 *   callback(null, '');
 * };
 *
 * @format
 */

const { execSync } = require('child_process');
const fs = require('fs');
const OSS = require('ali-oss');
const { LOCAL_ACCESS_PATH } = require('../runtime/pandora/utils');
const config = require('../runtime/config.json');

exports.handler = async (req, res, context) => {
  console.log('test custom log output');

  let rawData = '';

  req.on('data', function (chunk) {
    rawData += chunk;
  });

  req.on('end', async function () {
    // 业务代码入口
    const tmpLs = (await execSync('ls /tmp')).toString();
    const triggerError = rawData.indexOf('error') > -1;
    let uploadOssError = false;
    let createReportError = false;
    let accessStrOut = '';
    try {
      process.report.writeReport('/tmp/report.json');
    } catch (err) {
      createReportError = `message: ${err.message}, stack: ${err.stack}`;
    }
    try {
      const reportExists = await fs.existsSync('/tmp/nohup.out');
      if (reportExists) {
        const accessStr = await fs.readFileSync(LOCAL_ACCESS_PATH).toString();
        accessStrOut = accessStr;
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
        await ossClient.put(fileName, '/tmp/report.json');
      }
    } catch (err) {
      uploadOssError = `message: ${err.message}, stack: ${err.stack}`;
      console.log('create report or upload to oss error', err);
    }
    setTimeout(function () {
      if (triggerError) {
        throw new Error('test catch error!!');
      }
      res.writeHead(triggerError ? 500 : 200);
      res.end(
        JSON.stringify({
          accessStrOut,
          createReportError,
          uploadOssError,
          tmpLs,
          rawData,
          context,
          success: !!triggerError,
        })
      );
    }, 1000);
  });
};
