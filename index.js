const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const PORT = process.env.PORT;

const parser = bodyParser.urlencoded({extended: false});

app.post('/', parser, (req, res) => {
    console.log(req.body);
    res.send("2f08e3bc");
});

app.listen(PORT, err => {
    if(err) return console.log(err);
    console.log("Server starter on port", PORT);
});
