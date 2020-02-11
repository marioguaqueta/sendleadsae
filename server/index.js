const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const rp = require('request-promise');
var http = require('http');
var uuid = require('uuid');
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
  var task_id = randomString(48, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  JWT(req.body, Pkg.options.salesforce.marketingCloud.jwtSecret, (err, decoded) => {
      
      if (err) {
          console.log("ERR: " + err);
          return res.status(401).end();
      }

      if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {

          //Logica de backend
          console.log(decoded.inArguments);
          createJson(decoded.inArguments, task_id);
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

function createJson(decoded, task_id){

  var regex = {};
  var emailField;
  var firstnameField;
  var middlenameField;
  var lastnameField;
  var UTMCField;
  var UTMSField;
  
  inArguments.forEach(function(obj) { 
    if (obj.email != undefined) {
      emailField = obj.email;
    }
    else if (obj.firstname != undefined) {
      firstnameField = obj.firstname;
    }
    else if (obj.middlename != undefined) {
      middlenameField = obj.middlename;
    }
    else if (obj.lastname != undefined) {
      lastnameField = obj.lastname;
    }
    else if (obj.UTMC != undefined) {
      UTMCField = obj.UTMC;
    }
    else if (obj.UTMS != undefined) {
      UTMSField = obj.UTMS;
    }else{
      regex['%%' + extractFieldName(Object.keys(obj)) + '%%'] =  Object.values(obj);
    }   
  });

   var jsonPayLoad = {
     "id_task":task_id,
     "firstname":regex[firstnameField],
     "middlename":regex[middlenameField],
     "lastname" : regex[lastnameField],
     "email": regex[emailField],
     "UTMS":regex[UTMSField],
     "UTMc":regex[UTMCField]
    };
  
    sendRequest(jsonPayLoad);

}


function sendRequest(jsonPayLoad){
  console.log(jsonPayLoad);
}
  

function extractFieldName(field) {
  var stringField = field.toString();
  var index = stringField.lastIndexOf('.');
  return field.toString().substring(index + 1);
}

function GFG_Fun(Obj, str) { 
  var regex = Obj;
  var RE = new RegExp(Object.keys(regex).join("|"), "gi"); 
  var newMessage = str.replace(RE, function(matched) { 
      return regex[matched]; 
  });

  return newMessage;
}

function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

