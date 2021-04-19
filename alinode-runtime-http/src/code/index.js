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
    setTimeout(function () {
      if (triggerError) {
        throw new Error('test catch error!!');
      }
      res.writeHead(triggerError ? 500 : 200);
      res.end(
        JSON.stringify({
          tmpLs,
          rawData,
          context,
          success: !!triggerError,
        })
      );
    }, 1000);
  });
};
