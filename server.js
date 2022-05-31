const express = require('express');
const path = require('path');
const next = require('next');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const ServerRouter = require('./services/ServerRouter');
const dev = false; //process.env.NODE_ENV !== 'production';
const app = next({dev});
const handle = app.getRequestHandler();

function wwwRedirect(req, res, next) {
  if (req.headers.host.slice(0, 4) === 'www.') {
    var newHost = req.headers.host.slice(4);
    return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
  }
  next();
}

app
  .prepare()
  .then(() => {
    const server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({extended: false}));
    server.use(cookieParser());
    server.set('trust proxy', true);
    server.use(wwwRedirect);

    server.get('/focus', (req, res) => {
      app.render(req, res, '/focus', {});
    });

    server.get('/inbox', (req, res) => {
      app.render(req, res, '/inbox', {});
    });

    server.get('/calendar', (req, res) => {
      app.render(req, res, '/calendar', {});
    });

    server.get('/', (req, res) => {
      app.render(req, res, '/index', {});
    });
    server.get('/onboarding', (req, res) => {
      app.render(req, res, '/onboarding', {});
    });
    server.get('/login', (req, res) => {
      app.render(req, res, '/auth/login', {});
    });
    /*server.get('/signup', (req, res) => {
      app.render(req, res, '/auth/signup', {});
    });*/
    server.get('/activate/:token', (req, res) => {
      app.render(req, res, '/auth/activate', {});
    });
    /*server.get('/forgot-password', (req, res) => {
      app.render(req, res, '/auth/forgot-password', {});
    });*/
    /*server.get('/reset-password/:token', (req, res) => {
      app.render(req, res, '/auth/reset-password', {});
    });*/
    server.get('/logout', (req, res) => {
      res.cookie('id_token', '');
      res.redirect('/');
    });

    server.post('/login', (req, res) => {
      axios({
        method: 'post',
        url: `${ServerRouter.backend()}/auth/login`,
        data: {
          email: req.body.email,
          password: req.body.password,
        },
      })
        .then((back_res) => {
          res.cookie('id_token', back_res.data.id_token);
          res.status(200).json(back_res.data);
        })
        .catch((error) => {
          res.status(error.response.status).json(error.response.data);
        });
    });

    server.get('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(5000, (err) => {
      if (err) throw err;
      console.log('> Ready on http://localhost:5000');
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
