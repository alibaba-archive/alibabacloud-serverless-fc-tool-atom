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

const { asyncWrapper, start } = require('@midwayjs/serverless-fc-starter');
const SimpleLock = require('@midwayjs/simple-lock').default;
const lock = new SimpleLock();
const layers = [];

try {
  const layer_npm_eggLayer = require('@midwayjs/egg-layer');
  layers.push(layer_npm_eggLayer);
} catch (e) {}

let runtime;
let inited = false;

const initializeMethod = async (initializeContext = {}) => {
  return lock.sureOnce(async () => {
    runtime = await start({
      layers: layers,
      isAppMode: true,
      initContext: initializeContext,
    });
  }, 'APP_START_LOCK_KEY');
};

exports.initializer = asyncWrapper(async (...args) => {
  if (!inited) {
    inited = true;
    await initializeMethod(args[2]);
  }
});

exports.handler = asyncWrapper(async (...args) => {
  args[0].headers = {
    ...args[0].headers,
    'x-fc-access-key-id': args[2].credentials.accessKeyId,
    'x-fc-access-key-secret': args[2].credentials.accessKeySecret,
    'x-fc-security-token': args[2].credentials.securityToken,
  };
  if (!inited) {
    inited = true;
    await initializeMethod();
  }

  return runtime.asyncEvent()(...args);
});
