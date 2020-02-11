const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const rp = require('request-promise');
var http = require('http');
const JWT = require(path.join(__dirname, 'lib', 'jwt.js'));
const Pkg = require(path.join(__dirname, '../', 'package.json'));
var router = express.Router();

const app = express();

app.set('port', process.env.PORT || 3000);


// Register middleware that parses the request payload.
app.use(bodyParser.raw({
    type: 'application/jwt'
}));


app.use(express.static(path.join(__dirname, '../public')));


app.post('/save',function (req, res){
  console.log('ON SAVE');
  console.log(req.headers);
  console.log(req.body);

  res.status(200);
  res.send({
      route: 'save'
  });
});

app.post('/publish',function (req, res){
  console.log('ON PUBLISH');
  console.log(req.headers);
  console.log(req.body);
  res.status(200);
  res.send({
      route: 'publish'
  });
});



app.post('/validate',function (req, res){
  console.log('ON VALIDATE');
  console.log(req.headers);
  console.log(req.body);
  res.status(200);
  res.send({
      route: 'validate'
  });
});


app.post('/execute',function (req, res){

  console.log('EXECUTE');

  JWT(req.body, Pkg.options.salesforce.marketingCloud.jwtSecret, (err, decoded) => {
      
      if (err) {
          console.log("ERR: " + err);
          return res.status(401).end();
      }

      if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {

          //Logica de backend
          res.status(200);
          res.send({
              route: 'execute'
          });
      } else {
          console.error('inArguments invalid.');
          return res.status(400).end();
      }



  });


});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

