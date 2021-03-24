const createCoreSdk = require('.');

async function startPandora() {
  const coreSdk = createCoreSdk('alinode-insight-custom-runtime', 'supervisor');
  await coreSdk.start().catch((err) => {
    console.log('start failed', err);
  });
}

startPandora()
  .then(() => {
    console.log('start pandora supervisor successed.');
  })
  .catch((error) => {
    console.error('start pandora supervisor failed, ', error);
  });
