import { Application } from 'egg';
import { Strategy } from 'passport-local';

declare module 'egg' {
  interface Application {
    passport: any;
  }
}

export default (app: Application) => {
  app.passport.use(
    new Strategy(
      {
        passReqToCallback: true,
      },
      (req, username, password, done) => {
        const user = {
          provider: 'local',
          username,
          password,
        };
        app.passport.doVerify(req, user, done);
      }
    )
  );
  app.passport.serializeUser(async (ctx, user) => {
    return `${user.username}-${user.password}`;
  });
  app.passport.deserializeUser(async (ctx, user) => {
    return {
      username: user.split('-')[0],
    };
  });
};
