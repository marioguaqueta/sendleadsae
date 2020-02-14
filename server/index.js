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


app.post('/save', function (req, res) {
  console.log('ON SAVE');
  console.log(req.headers);
  console.log(req.body);

  res.status(200);
  res.send({
    route: 'save'
  });
});

app.post('/publish', function (req, res) {
  console.log('ON PUBLISH');
  console.log(req.headers);
  console.log(req.body);
  res.status(200);
  res.send({
    route: 'publish'
  });
});



app.post('/validate', function (req, res) {
  console.log('ON VALIDATE');
  console.log(req.headers);
  console.log(req.body);
  res.status(200);
  res.send({
    route: 'validate'
  });
});


app.post('/execute', function (req, res) {

  console.log('EXECUTE');
  var task_id = randomString(48, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');


  JWT(req.body, Pkg.options.salesforce.marketingCloud.jwtSecret, (err, decoded) => {

    if (err) {
      console.log("ERR: " + err);
      return res.status(401).end();
    }

    if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {

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


  /*
  var inArguments = [
    { "com.aeromexico.event.data.Source": "0" },
    {
    "com.aeromexico.event.data.EmailAddress": "jorge.guaqueta@globant.com"
    },
    { "com.aeromexico.event.data.CreateDate": "2/11/2020 12:00:00 AM" },
    { "com.aeromexico.event.data.LastName": "Guaquta" },
    { "com.aeromexico.event.data.FirstName": "Jorge" },
    { "com.aeromexico.event.data.Address": "Calle 173" },
    { "com.aeromexico.event.data.City": "Bogota" },
    { "com.aeromexico.event.data.State": "Bogota" },
    { "com.aeromexico.event.data.ZipCode": "11001" },
    { "com.aeromexico.event.data.Locale": "en_US" },
    { "com.aeromexico.event.data.Phone": "573114913693" },
    { "com.aeromexico.event.data.Gender": "M" },
    { "com.aeromexico.event.data.BirthDate": "Oct" },
    { "com.aeromexico.event.data.Email_Opt_in": "False" },
    { "com.aeromexico.event.data.Mobile_Opt_in": "False" },
    { "com.aeromexico.event.data.Country": "" },
    { "com.aeromexico.event.data.Company": "" },
    { "com.aeromexico.event.data.PageID": "" },
    { "com.aeromexico.event.data.TabID": "" },
    { "com.aeromexico.event.data.TrackingCode": "" },
    { "com.aeromexico.event.data.ContentID": "" },
    { "com.aeromexico.event.data.FacebookUserID": "" },
    { "com.aeromexico.event.data.TwitterHandle": "" },
    { "com.aeromexico.event.data.ModifiedDate": "2/11/2020 10:52:04 AM" },
    { "com.aeromexico.event.data.CreatedBy": "" },
    { "com.aeromexico.event.data.ModifiedBy": "" },
    { "com.aeromexico.event.data.Terms_Conditions": "False" },
    { "com.aeromexico.event.data.IsMobile": "False" },
    { "com.aeromexico.event.data.FormID": "" },
    { "email": "%%EmailAddress%%" },
    { "firstname": "%%FirstName%%" },
    { "middlename": "%%Address%%" },
    { "lastname": "%%LastName%%" },
    { "UTMC": "%%City%%" },
    { "UTMS": "%%ZipCode%%" }
    ];
  
    createJson(inArguments, task_id);
    res.status(200);
    res.send({
        route: 'execute'
    });
    */

});

function createJson(decoded, task_id) {

  var regex = {};
  var inArguments = decoded;


  var firstnameField;
  var middlenameField;
  var lastnameField;
  var suffixField;
  var emailField;
  var major18Field;
  var privacy_policyField;
  var has_opted_out_of_emailField;
  var genderField;
  var mobile_phoneField;
  var birthdateField;
  var countryField;
  var cityField;
  var UTMcField;
  var UTMSField;


  inArguments.forEach(function (obj) {

    if (obj.firstname != undefined) {
      firstnameField = obj.firstname;
    }
    else if (obj.middlename != undefined) {
      middlenameField = obj.middlename;
    }
    else if (obj.lastname != undefined) {
      lastnameField = obj.lastname;
    }
    else if (obj.suffix != undefined) {
      suffixField = obj.suffix;
    }
    else if (obj.email != undefined) {
      emailField = obj.email;
    }
    else if (obj.major18 != undefined) {
      major18Field = obj.major18;
    }
    else if (obj.privacy_policy != undefined) {
      privacy_policyField = obj.privacy_policy;
    }
    else if (obj.has_opted_out_of_email != undefined) {
      has_opted_out_of_emailField = obj.has_opted_out_of_email;
    }
    else if (obj.gender != undefined) {
      genderField = obj.gender;
    }
    else if (obj.mobile_phone != undefined) {
      mobile_phoneField = obj.mobile_phone;
    }
    else if (obj.birthdate != undefined) {
      birthdateField = obj.birthdate;
    }
    else if (obj.country != undefined) {
      countryField = obj.country;
    }
    else if (obj.city != undefined) {
      cityField = obj.city;
    }
    else if (obj.UTMc != undefined) {
      UTMcField = obj.UTMc;
    }
    else if (obj.UTMS != undefined) {
      UTMSField = obj.UTMS;
    }
    else {
      regex['%%' + extractFieldName(Object.keys(obj)) + '%%'] = Object.values(obj).toString();
    }
  });






  var optionsToken = {
    method: 'POST',
    uri: 'https://dev-svoc-mc-create-lead.herokuapp.com/token',
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Basic e2a2f94bf46f99a4da6ba14b2c0cc1b5'
    },
    body:
    {
    },
    json: true
  };

  rp(optionsToken).then(function (response) {

    var optionsHeroku = {
      method: 'POST',
      uri: 'https://dev-svoc-mc-create-lead.herokuapp.com/leads',
      headers: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + response.token

      },
      body:
      {
        "id_task": task_id,
        "firstname": regex[firstnameField],
        "middlename": regex[middlenameField],
        "lastname": regex[lastnameField],
        "suffix": regex[suffixField],
        "email": regex[emailField],
        "privacy_policy": regex[privacy_policyField],
        "has_opted_out_of_email": regex[has_opted_out_of_emailField],
        "gender": regex[genderField],
        "mobile_phone": regex[mobile_phoneField],
        "birthdate": regex[birthdateField],
        "country": regex[countryField],
        "city": regex[cityField],
        "UTMS": regex[UTMSField],
        "UTMc": regex[UTMcField]
      },
      json: true
    };
    console.log(optionsHeroku);
    rp(optionsHeroku).then(function (response) {
      console.log("Success Send Heroku");
    })
      .catch(function (err) {
        console.log("Failed Send");
      });

  })
    .catch(function (err) {
      console.log("Error token");
    });



}


function extractFieldName(field) {
  var stringField = field.toString();
  var index = stringField.lastIndexOf('.');
  return field.toString().substring(index + 1);
}



function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

