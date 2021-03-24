const init = require('./sls/index');

const aliyunAccess = {
  AccessKeyID: 'LTAI4G7NQVF4FAwufLwwDRnf',
  AccessKeySecret: 'OztcJBlFGSw7KfJ4vPdfqF06WKOjEW',
};

const region = 'cn-zhangjiakou';

init({
  accessKeyId: aliyunAccess.AccessKeyID,
  secretAccessKey: aliyunAccess.AccessKeySecret,
  endpoint: `${region}.log.aliyuncs.com`,
});
