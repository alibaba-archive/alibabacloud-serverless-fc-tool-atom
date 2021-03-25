const path = require('path');
const config = [
  {
    dir: './alinode-runtime-http/src',
    pkg: 'package.json',
  },
  {
    dir: './alinode-faas-sls-log/src',
    pkg: 'package.json',
  },
  {
    dir: './alinode-faas-insight',
    pkg: 'package.json',
  },
  {
    dir: './alinode-faas-custom-runtime',
    pkg: 'package.json',
  },
];

config.forEach(async (component) => {
  const package = require(path.resolve(component.dir, component.pkg));
  const dependencies = package.dependencies;
  console.log('package of ==>', component.dir);
  Object.keys(dependencies).forEach((dep) => {
    const depPackage = require(path.resolve(
      component.dir,
      'node_modules',
      dep,
      component.pkg
    ));
    console.log('depPackage ==>', depPackage.name, depPackage.license);
  });
});
