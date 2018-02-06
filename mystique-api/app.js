var express = require('express');

var bodyParser = require('body-parser');
const fs = require('fs');

var request = require('request');
var rn = require('random-number');
const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
var cors = require('cors');
var app = express();

var parseString = require('xml2js').parseString;
// use it before all route definitions
app.use(cors({origin: '*'}));
app.use(bodyParser.json({limit: '50mb'}));


app.get("/",(req, res) => {
    res.send("HI");
});


app.post("/getPremium",(req, res) => {
    let data = req.body;
    request.post({
      url:     'http://124.30.32.37:9082/TEBT_QuoteGenerationWeb/sca/QuoteGeneration_ThirdPartyExport',
      body: data.data,
      headers: {'Content-Type': 'text/xml'}
      // json:    {apikey:'puGfjvZVbpMvIuHAadbqgcrLLzB2',unique_id:'1120094'},
    }, function(error, response, body){
      if(error){
        throw err
      }
      parseString(body, function (error, result) {
        if(error){
          throw err
        }
        res.send(JSON.parse(result["soapenv:Envelope"]["soapenv:Body"][0]["out2:generatequoteResponse"][0]["generatequoteRes"][0]["body"][0]["quotedtls"][0]));
      });
    });
});

app.post("/getData",(req, res) => {
    let data = req.body;
    //console.log(course.base64);
    // var buf = Buffer.from(course, 'base64');
    // var imageBuffer = decodeBase64Image(data.base64);
    var base64Data = data.base64.replace(/^data:image\/jpeg;base64,|data:image\/png;base64,/, "");

    var options = {
      min:  1000,
      max:  100000000,
      integer: true
    }

    fileName = "./images/image_"+rn(options)+".png";
    var bitmap = new Buffer(base64Data, 'base64');
    //fs.writeFileSync(fileName, bitmap);
    // var fileStream = fs.createWriteStream(fileName);
    // fileStream.write(base64Data);
    // fileStream.end();

    fs.writeFile(fileName, base64Data, "base64", function(err) {
      if(err){
          throw err
      }

      console.log(fileName);
      var formData = {
        api_key: "eeAcJGSu4H-NhIHoCJRkxbGoJiDkSTrI",
        api_secret: "qvFaqa0gNE-NXN6Kg4-tSx5ffJ8-SKaT",
        image_file:  fs.createReadStream(fileName)
      }
      request.post({
        headers: {'content-type' : 'multipart/form-data'},
        url:     'https://api-us.faceplusplus.com/facepp/v3/detect?return_attributes=gender,age',
        formData: formData,
        // json:    {apikey:'puGfjvZVbpMvIuHAadbqgcrLLzB2',unique_id:'1120094'},
      }, function(error, response, body){
          console.log('error:', error); // Print the error if one occurred
          console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
          console.log('body:', body); // Print the HTML for the Google homepage.
          res.send({
            data : JSON.parse(body),
            image_name : fileName
          });
      });
    });
});


var server = app.listen(3000, function(){
    console.log("The server started on port 3000 !!!!!!");
});
