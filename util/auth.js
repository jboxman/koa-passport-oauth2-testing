// http://scottksmith.com/blog/2014/09/18/beer-locker-building-a-restful-api-with-node-username-and-password/
const passport = require('koa-passport');
const GitHubStrategy = require('passport-github2').Strategy;
const MockStrategy = require('./mock-strategy').Strategy;

const userStore = (function() {
  const state = {}

  function fetchUser(id) {
    return new Promise((fulfill, reject) => {
      if(state[id]) {
        return fulfill(state[id])
      }
      else {
        return fulfill({id})
      }
      //reject(new Error('Not found'))
    })
  }

  function saveUser(user) {
    state[user.id] = Object.assign({}, user)
  }

  return {
    fetchUser,
    saveUser
  }
})()

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await userStore.fetchUser(id);
    done(null, user);
  } catch(err) {
    done(err);
  }
});

function cb(accessToken, refreshToken, profile, done) {
  // Possibly User.findOrCreate({...}) or similar
  let u = {
    id: 1,
    oauthId: profile.id,
    oauthProvider: profile.provider,
    email: profile.emails[0].value,
    username: profile.username,
    avatarUrl: profile._json.avatar_url
  };
  // synchronous in this example
  userStore.saveUser(u);
  done(null, u);
}

function strategyForEnvironment() {
  let strategy;
  switch(process.env.NODE_ENV) {
    case 'production':
    /*
     strategy = new GitHubStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_URL
      }, cb);
      */
    //break;
    default:
      strategy = new MockStrategy('github', cb);
  }
  return strategy;
}

passport.use(strategyForEnvironment());
