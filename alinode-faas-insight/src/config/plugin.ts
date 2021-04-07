import { EggPlugin } from 'egg';
export default {
  static: true,
  view: true,
  xtpl: {
    enable: true,
    package: 'egg-view-xtpl',
  },
  passport: {
    enable: true,
    package: 'egg-passport',
  },
} as EggPlugin;
