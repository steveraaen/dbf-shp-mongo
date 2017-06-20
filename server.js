var express = require("express");
var Parser = require('dbf-parser');
var mongoose = require("mongoose");
var pwds = require("../../random-exercises/nyc-parking/passwds.js");
var Sign = require("./models/Signs.js");

var app = express();

mongoose.connect(pwds.mong);
var db = mongoose.connection;

db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});
// --------------- open db connection and leave it open
db.once("open", function() {
    console.log("Mongoose connection successful.");
// --------------- parse dbf file
    var parser = new Parser('../../random-exercises/nyc-parking/Parking_Regulation_Shapefile.dbf');
    parser.on('start', function(p) {
        console.log('dBase file parsing has started');
    });

    parser.on('header', function(h) {
        console.log('dBase file header has been parsed');
    });
    var sweep = "SANITATION BROOM SYMBOL"
// ---------------- Find records that meet conditions    
    parser.on('record', function(record) {
    	var swsign = new Sign({ sign: record });
        if (record.SIGNDESC1.match(sweep) && record.SG_KEY_BOR === "K") { 
// ---------------- Save to db          
            swsign.save(function(err) {
                if (err) {
                    console.log(err);
                } 
            });
        } 
    });

    parser.on('end', function(p) {
        console.log('Finished parsing the dBase file');
    });

    parser.parse();

    app.listen(3000, function(req, res) {
        console.log('connected on 3000')
    })
});
