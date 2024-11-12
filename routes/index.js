var express = require('express');
var router = express.Router();
var fs = require("fs");
const path = require('path');
var bodyParser = require('body-parser');
const compiler = require('compilex');

/* GET home page. */

var fs = require("fs");

router.get("/", function(req, res) {                        //   this is the local route ( / )
  fs.readdir("./uploads", { withFileTypes:true } , function(err , files){     //  this is the Asynchronus code and it is run after  the synchronus code
      res.render("index",{ files : files});      // it is dirents
      // console.log(files);           //  we need the first show the all files and then get on the / route  ( It is the Synchronus code and run before the Asynchronus Code)
  });
});

router.get("/file/:filename", function(req, res) {
  fs.readdir("./uploads", { withFileTypes:true } , function(err , files){     //  this is the Asynchronus code and it is run after  the synchronus code
    fs.readFile(`./uploads/${req.params.filename}`, "utf8" , function(err,data){
      res.render("opened",{ files : files ,filename: req.params.filename ,filedata: data}); 
    });
  });
});

router.post("/filechange/:filename", function(req, res) {
    fs.writeFile(`./uploads/${req.params.filename}`, req.body.filedata , function(err){
      res.redirect("back");
    });
});

router.get("/filecreate", function(req, res) {
     fs.writeFile(`./uploads/${req.query.filename}` , "" ,function(err){                  //  this is for the filecreate route
      if(err) res.send(err);
      else res.redirect("back");
     });
});

router.get("/foldercreate", function(req, res){
  fs.mkdir(`./uploads/${req.query.foldername}`, function(err){             //  this route is for the foldercrete
    if(err) res.send(err);
    else res.redirect("back");
  });
});

router.post("/editfilename/:filename", function(req, res) {

  var oldname = req.params.filename;
  var newname = req.body.editfilename;
  
    fs.rename(`./uploads/${oldname}`, `./uploads/${newname}`, (err) => {
      if (err) throw err;
      console.log('Rename complete!');
    }); 
  
    // console.log(req.params.filename)
    // console.log(req.body.editfilename)
    res.redirect("back");
  });



router.get('/code', function(req,res){
     res.render('code')
    // console.log("ijssnfidbf");
    // res.send("i am here");
})



// Start Code for Compiler

// var app = express();
// app.use(bodyParser());

const option = { stats: true };
compiler.init(option);

router.post('/code', function (req, res) {
  const code = req.body.code;
  const input = req.body.input;
  const inputRadio = req.body.inputRadio;
  const lang = req.body.lang;

  if (lang === 'C' || lang === 'C++') {
    const envData = { OS: 'windows', cmd: 'C:\MinGW\bin', options: { timeout: 30000 } };

    if (inputRadio === 'true') {
      compiler.compileCPPWithInput(envData, code, input, function (data) {
        if (data.error) {
          console.error('Compilation error:', data.error);
          res.send(data.error);
        } else if (data.stderr) {
          console.error('Execution error:', data.stderr);
          res.send(data.stderr);
        } else {
          res.send(data.output);
        }
      });
    } else {
      compiler.compileCPP(envData, code, function (data) {
        if (data.error) {
          console.error('Compilation error:', data.error);
          res.send(data.error);
        } else if (data.stderr) {
          console.error('Execution error:', data.stderr);
          res.send(data.stderr);
        } else {
          res.send(data.output);
        }
      });
    }
  } else if (lang === 'Python') {
    const envData = { OS: 'windows' };

    if (inputRadio === 'true') {
      compiler.compilePythonWithInput(envData, code, input, function (data) {
        if (data.error) {
          console.error('Execution error:', data.error);
          res.send(data.error);
        } else {
          res.send(data.output);
        }
      });
    } else {
      compiler.compilePython(envData, code, function (data) {
        if (data.error) {
          console.error('Execution error:', data.error);
          res.send(data.error);
        } else {
          res.send(data.output);
        }
      });
    }
  } else {
    res.status(400).send('Invalid language');
  }
});

router.get('/fullStat', function (req, res) {
  compiler.fullStat(function (data) {
    res.send(data);
  });
});

compiler.flush(function () {
  console.log('All temporary files flushed!');
});


// End Code For Compiler




module.exports = router;
