import { EggPlugin } from 'egg';
export default {
  static: true,
  view: true,
  xtpl: {
    enable: true,
    package: 'egg-view-xtpl',
  }
} as EggPlugin;
