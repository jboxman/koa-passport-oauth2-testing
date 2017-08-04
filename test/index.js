const test = require('tape');
const agent = require('supertest').agent;

const app = require('../');

const prepare = () => {
  const httpServer = app.listen();
  const request = agent(app.callback());
  return {
    request,
    httpServer
  };
}

// https://medium.com/@juha.a.hytonen/testing-authenticated-requests-with-supertest-325ccf47c2bb
const createAuthenticatedUser = (done) => {
  const httpServer = app.listen();
  const authenticatedUser = agent(app.callback());
  authenticatedUser
  .get('/auth/github/callback')
  .end((error, resp) => {
    done(authenticatedUser);
    httpServer.close();
  });
}

test('it should work', t => {
    createAuthenticatedUser(request => {
      request
      .get('/app')
      .expect(200)
      .end((err, res) => {
        console.log(res.body);
        t.end(err);
      });
    });
});

test('it should deny access to /app', t => {
  const {httpServer, request} = prepare();

  request
  .get('/app')
  .expect(403)
  .end((err, res) => {
    httpServer.close();
    t.end(err);
  });
});
