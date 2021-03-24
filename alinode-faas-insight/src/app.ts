import { EggApplication } from 'egg';

export default (app: EggApplication) => {
  app.ready(async () => {
    console.log('[egg custom info] app ready');
  });
  app.on('error', function (err) {
    console.log('[egg custom error] ', err);
  });
};
