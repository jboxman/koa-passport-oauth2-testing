const Koa = require('koa');
const session = require('koa-session');
const passport = require('koa-passport');

const app = new Koa();

//require('dotenv').config();

// trust proxy
app.proxy = true;

// sessions
app.keys = ['your-session-secret'];
app.use(session({}, app));

// body parser
//const bodyParser = require('koa-bodyparser')
//app.use(bodyParser())

// authentication
require('./util/auth');
app.use(passport.initialize());
app.use(passport.session());

// routes
const route = require('koa-route');

/*
  Upon success:
  ctx.state.user:       User object from passport.deserializeUser()
  ctx.session:          Session object
  ctx.session.passport: ID from passport.seralizeUser()
*/

app.use(route.get('/auth/github',
  passport.authenticate('github')
));

// Custom handler that returns the authenticated user object
app.use(route.get('/auth/github/callback', function(ctx) {
  return passport.authenticate('github', async function(err, user, info) {
    await ctx.logIn(user);
    //await ctx.render('success', {user: JSON.stringify(ctx.state.user)})
    ctx.body = 'OK';
  })(ctx);
}));

/*
// Classic redirect behavior
app.use(route.get('/auth/github/callback',
  passport.authenticate('github', {
    successRedirect: '/app',
    failureRedirect: '/'
  })
))
*/

// Require authentication for now
app.use(async function(ctx, next) {
  if (ctx.isAuthenticated()) {
    return next();
  } else {
    ctx.throw(403);
  }
});

app.use(route.get('/app', function(ctx) {
  //console.log(ctx.state.user);
  ctx.body = ctx.state.user;
}));

// start server
//const port = process.env.PORT || 3000;
//app.listen(port, () => console.log('Server listening on', port));

module.exports = app;
