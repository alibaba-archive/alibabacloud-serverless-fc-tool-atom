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

exports.handler = async (req, res, context) => {
  console.log('test custom log output');

  let rawData = '';

  req.on('data', function (chunk) {
    rawData += chunk;
  });

  req.on('end', function () {
    // 业务代码入口
    const error = rawData.length % 2;
    setTimeout(function () {
      res.writeHead(error ? 500 : 200);
      res.end(
        JSON.stringify({
          rawData,
          context,
          success: !!error,
        })
      );
    }, 1000);
  });
};
