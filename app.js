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

/**
* initialize prismic context and api
*/
function api(req, res) {
  res.locals.ctx = { // So we can use this information in the views
    endpoint: PConfig.apiEndpoint,
    linkResolver: PConfig.linkResolver
  };
  return Prismic.api(PConfig.apiEndpoint, {
    accessToken: PConfig.accessToken,
    req: req
  });
}

// INSERT YOUR ROUTES HERE

/**
* route with documentation to build your project with prismic
*/
// app.get('/', function(req, res) {
//   res.redirect('/help');
// });

app.get('/', function(req, res) {
  return res.render('home', {
    title: 'Home'
  });
});

app.get('/help', function(req, res) {
  const repoRegexp = new RegExp('^(https?:\/\/([\\-\\w]+)\\.[a-z]+\\.(io|dev))\/api$');
  const match = PConfig.apiEndpoint.match(repoRegexp);
  const repoURL = match[1];
  const name = match[2];
  const host = req.headers.host;
  const isConfigured = name !== 'your-repo-name';
  res.render('help', {isConfigured, repoURL, name, host});
});

/**
* preconfigured prismic preview
*/
app.get('/preview', function(req, res) {
  api(req, res).then(function(api) {
    return Prismic.preview(api, PConfig.linkResolver, req, res);
  }).catch(function(err) {
    handleError(err, req, res);
  });
});

// route handler
app.get('/page/:uid', function(req, res) {
  var uid = req.params.uid;
  api(req, res).then(function(api) {
    return api.getByUID('home', uid);
  }).then(function(content) {
    res.render('home', {
      content: content
    });
  });
})
