var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// jsonwebtoken is required for you to generate and sign the OpenID Connect Token
// You can read more about this module here: https://github.com/auth0/node-jsonwebtoken
var jwt = require('jsonwebtoken');
// var jose = require('node-jose');

/*	
	You will need to generate your own public and private RSA keys using OpenSSL. These keys can then be placed in the files below.
	Page 19 of this pdf: https://ce-sr.s3.amazonaws.com/Auth%20Chat/Authenticated%20Interactions%20with%20oAuth%202.0v.pdf shows
	how you can generate these keys.
	Once you generate a new public key, make sure you update JWT Public Key Field in LiveEngage.
    */
var fs = require('fs');
var cert_pub = fs.readFileSync(__dirname + '/public_key_idp.pem');
var cert_priv = fs.readFileSync(__dirname + '/private_key_idp.pem');


app.set('port', (process.env.PORT || 3000));

app.use(express.static(__dirname + '/public'));

// used to generate the OpenID Connect Token for the implicit flow
app.post('/getJwt', function (request, response) {

  console.log('request.body', request.body);
  console.log('request.body', request.body.this);

  // generate our token with the appropiate information and sign it with our private RSA key.
  var token = jwt.sign(request.body, cert_priv, { algorithm: 'RS256'});

  console.log(token);

  // verify that the token was generated correctly
  jwt.verify(token, cert_pub, function (err, decoded) {
    // if the token didn't generate then respond with the error
    if (err) {
      console.log(err);
      response.json({
        'error': err,
        'Fail': '404'
      });

    }
    // if successful then response with the token
    else {

      response.json({
        'token': token
      });
    }
  });
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
