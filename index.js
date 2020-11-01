const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const PORT = process.env.PORT;

const parser = bodyParser.json();

const group_id = 199833573;

let confirmationCode = "";

app.post('/', parser, (req, res) => {
    console.log(req.body);
    if(req.body.type == 'confirmation' && req.body.group_id == group_id){
        res.send(confirmationCode);
    }else if(req.body.type == 'code'){
        confirmationCode = req.body.code;
    }else{
        handleMessage(req.body);
        res.send("ok");
    }
});

app.listen(PORT, err => {
    if(err) return console.log(err);
    console.log("Server starter on port", PORT);
});

function handleMessage(data){
    console.log(data.attachments);
}
