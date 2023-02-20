require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const bodyparser = require ('body-parser');
const dns = require('node:dns');
var shortid = require('shortid');

// Basic Configuration
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser : true, useUnifiedTopology: true});
const port = process.env.PORT || 3000;

const urlSchema = new mongoose.Schema({
original_url: { type: String, required: true, unique: true},
short_url:{type: String, required: true, unique: true}
})
let URLModel = mongoose.model('url', urlSchema)

app.use(cors());
app.use("/", bodyparser.urlencoded({extended: false}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
app.get('/api/shorturl/:short_url', (req, res) =>{
  let short_url = req.params.short_url;
  URLModel.findOne({short_url: short_url}).then((foundURL) =>{
    //console.log(foundURL);
    if(foundURL){
      let original_url = foundURL.original_url;
      res.redirect(original_url);
    }
    else{ res.json({error: 'shorturl not found'
    
  })
        }
  });
 
})
app.post('/api/shorturl', function(req, res) {
  try {url = req.body.url;
   urlObj = new URL(url);

// Your first API endpoint

       dns.lookup(urlObj.hostname, function(err, address, family){
         if(!address){
           res.json({error: "invalid url"})
         } else {
           let original_url = urlObj.href;
           let short_url = shortid.generate();
URLModel.findOne({original_url: original_url}).then((foundURL)=>{
  if(foundURL){ res.json({original_url:foundURL.original_url,
                         short_url:foundURL.short_url})}
else{let resObj = {original_url:original_url ,
                      short_url :  short_url
                  }
     
             let newUrl = new URLModel(resObj)
            newUrl.save();
           res.json(resObj);
                      }
  
})
 })
} catch {
    res.json({ error: "invalid url"})
}
});
   
  app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
