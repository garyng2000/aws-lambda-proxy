// var express = require('express');
// var app = express();
// var PORT = 3000;
 
// app.use(express.text());
   
// app.post('/', function (req, res) {
//     console.log(req.body);
//     res.end();
// })
 
// app.listen(PORT, function(err){
//     if (err) console.log(err);
//     console.log("Server listening on PORT", PORT);
// });

const path = require('path')
const express = require('express')
const bodyParser = require("body-parser")
const lambdaLocal = require('lambda-local')

const app = express()

app.use(express.text())
app.use(express.json())
app.use(bodyParser.json())

app.use('/', async (req, res) => {
  const result = await lambdaLocal
    .execute({
      lambdaPath: path.join(__dirname, 'app'),
      lambdaHandler: 'lambdaHandler',
      envfile: path.join(__dirname, '.env'),
      event: {
        headers: req.headers, // Pass on request headers
        body: req.body // Pass on request body
      }
    })

  // Respond to HTTP request
  res
    .status(result.statusCode)
    .set(result.headers)
    .end(result.body)
})

app.listen(3000, () => console.log('listening on port: 3000'))