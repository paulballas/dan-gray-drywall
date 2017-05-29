var Prismic = require('prismic-nodejs');
var app = require('./config');
var PORT = app.get('port');
var PConfig = require('./prismic-configuration');
var request = require('request');

function handleError(err, req, res) {
  if (err.status == 404) {
    res.status(404).send('404 not found');
  } else {
    res.status(500).send('Error 500: ' + err.message);
  }
}

app.listen(PORT, function() {
  const repoEndpoint = PConfig.apiEndpoint.replace('/api', '');
  request.post(repoEndpoint + '/app/settings/onboarding/run', {form: {language: 'node', framework: 'express'}});
  console.log('Point your browser to: http://localhost:' + PORT);
});

// initialize prismic context and api
function api(req, res) {
  res.locals.ctx = {
    endpoint: PConfig.apiEndpoint,
    linkResolver: PConfig.linkResolver
  };
  return Prismic.api(PConfig.apiEndpoint, {
    accessToken: PConfig.accessToken,
    req: req
  });
}

// hardcode home page
app.get('/', function(req, res) {
  var uid = 'home';
  api(req, res).then(function(api) {
    return api.getByUID('home', uid);
  }).then(function(content) {
    res.render('home', {
      content: content
    });
  });
})

// all the other routes
app.get('/:uid', function(req, res) {
  var uid = req.params.uid;
  api(req, res).then(function(api) {
    return api.getByUID(uid, uid);
  }).then(function(content) {
    res.render(uid, {
      content: content
    });
  });
})
